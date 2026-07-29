"use client";

import { create } from "zustand";
import type {
  ViewKey,
  Processo,
  Cliente,
  Tarefa,
  Documento,
  InboxJuridicoItem,
  AiChatMessage,
  Notificacao,
} from "./types";
import {
  processos as seedProcessos,
  clientes as seedClientes,
  tarefas as seedTarefas,
  documentos as seedDocumentos,
  inboxItens as seedInbox,
  notificacoes as seedNotificacoes,
  membrosEquipe as seedEquipe,
} from "./seed-data";

interface AppState {
  // Navegação
  currentView: ViewKey;
  selectedProcessoId: string | null;
  selectedClienteId: string | null;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  aiPanelOpen: boolean;

  // Dados
  processos: Processo[];
  clientes: Cliente[];
  tarefas: Tarefa[];
  documentos: Documento[];
  inbox: InboxJuridicoItem[];
  notificacoes: Notificacao[];
  chatMessages: AiChatMessage[];

  // Filtros & busca
  processoSearch: string;
  processoStatusFilter: string;
  processoAreaFilter: string;

  // Ações de navegação
  setView: (v: ViewKey) => void;
  openProcesso: (id: string) => void;
  openCliente: (id: string) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setAiPanelOpen: (open: boolean) => void;

  // Filtros
  setProcessoSearch: (s: string) => void;
  setProcessoStatusFilter: (s: string) => void;
  setProcessoAreaFilter: (s: string) => void;

  // CRUD
  addProcesso: (p: Processo) => void;
  updateProcesso: (id: string, patch: Partial<Processo>) => void;
  addCliente: (c: Cliente) => void;
  addTarefa: (t: Tarefa) => void;
  updateTarefa: (id: string, patch: Partial<Tarefa>) => void;
  removeTarefa: (id: string) => void;
  marcarInboxLido: (id: string) => void;
  arquivarInbox: (id: string) => void;
  marcarNotificacaoLida: (id: string) => void;
  marcarTodasNotificacoesLidas: () => void;
  addChatMessage: (m: AiChatMessage) => void;
  clearChat: () => void;
  limparDadosDemonstracao: () => void;
  
  // Auth
  user: any | null;
  setUser: (user: any | null) => void;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  emailsAutorizados: string[];

  // Initialization
  initFirebase: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, nome: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  addEmailAutorizado: (email: string) => Promise<void>;
  removeEmailAutorizado: (email: string) => Promise<void>;
}

import { 
  db, 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  deleteDoc, 
  setDoc,
  enableIndexedDbPersistence
} from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { logger } from "./logger";
import { toast } from "sonner";

const STORAGE_KEYS = {
  PROCESSOS: "vdl_juris_processos_v2",
  CLIENTES: "vdl_juris_clientes_v2",
  TAREFAS: "vdl_juris_tarefas_v2",
  DOCUMENTOS: "vdl_juris_documentos_v2",
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving to localStorage", e);
  }
}

function cleanForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (value === undefined ? null : value))
  );
}

let firebaseInitialized = false;

const initialAuthorizedEmails = [
  "cria2311@gmail.com",
  "vidal2311usa@gmail.com",
  "admin@jurisflow.com.br",
  "marina@jurisflow.com.br",
  "advogado@jurisflow.com.br",
  "joao.silva@jurisflow.com.br",
];

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  authError: null,
  setAuthError: (authError) => set({ authError }),
  emailsAutorizados: initialAuthorizedEmails,

  currentView: "dashboard",
  selectedProcessoId: null,
  selectedClienteId: null,
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  aiPanelOpen: false,

  processos: getLocal(STORAGE_KEYS.PROCESSOS, seedProcessos),
  clientes: getLocal(STORAGE_KEYS.CLIENTES, seedClientes),
  tarefas: getLocal(STORAGE_KEYS.TAREFAS, seedTarefas),
  documentos: getLocal(STORAGE_KEYS.DOCUMENTOS, seedDocumentos),
  inbox: seedInbox,
  notificacoes: seedNotificacoes,
  chatMessages: [],

  processoSearch: "",
  processoStatusFilter: "todos",
  processoAreaFilter: "todas",

  setView: (v) => set({ currentView: v, selectedProcessoId: null }),
  openProcesso: (id) =>
    set({ selectedProcessoId: id, currentView: "processo-detalhe" }),
  openCliente: (id) =>
    set({ selectedClienteId: id, currentView: "clientes" }),
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setAiPanelOpen: (open) => set({ aiPanelOpen: open }),

  setProcessoSearch: (s) => set({ processoSearch: s }),
  setProcessoStatusFilter: (s) => set({ processoStatusFilter: s }),
  setProcessoAreaFilter: (s) => set({ processoAreaFilter: s }),

  addProcesso: async (p) => {
    const cleanP = cleanForFirestore(p);
    set((s) => {
      const filtered = s.processos.filter((existing) => existing.id !== cleanP.id);
      const updated = [cleanP, ...filtered];
      setLocal(STORAGE_KEYS.PROCESSOS, updated);
      return { processos: updated };
    });

    try {
      await setDoc(doc(db, "processos", cleanP.id), cleanP);
      logger.action("Processo criado no Firestore", { id: cleanP.id, numeroCnj: cleanP.numeroCnj });
    } catch (error) {
      logger.error("system", "Erro ao salvar processo no Firestore", error);
    }
  },
  updateProcesso: async (id, patch) => {
    const cleanPatch = cleanForFirestore(patch);
    set((s) => {
      const updated = s.processos.map((p) =>
        p.id === id ? { ...p, ...cleanPatch } : p
      );
      setLocal(STORAGE_KEYS.PROCESSOS, updated);
      return { processos: updated };
    });

    try {
      await updateDoc(doc(db, "processos", id), cleanPatch as any);
      logger.action("Processo atualizado no Firestore", { id, patch: cleanPatch });
    } catch (error) {
      logger.error("system", "Erro ao atualizar processo no Firestore", error);
    }
  },
  addCliente: async (c) => {
    const cleanC = cleanForFirestore(c);
    set((s) => {
      const filtered = s.clientes.filter((existing) => existing.id !== cleanC.id);
      const updated = [cleanC, ...filtered];
      setLocal(STORAGE_KEYS.CLIENTES, updated);
      return { clientes: updated };
    });

    try {
      await setDoc(doc(db, "clientes", cleanC.id), cleanC);
      logger.action("Cliente criado no Firestore", { id: cleanC.id, nome: cleanC.nome });
    } catch (error) {
      logger.error("system", "Erro ao criar cliente no Firestore", error);
    }
  },
  addTarefa: async (t) => {
    const cleanT = cleanForFirestore(t);
    set((s) => {
      const filtered = s.tarefas.filter((existing) => existing.id !== cleanT.id);
      const updated = [cleanT, ...filtered];
      setLocal(STORAGE_KEYS.TAREFAS, updated);
      return { tarefas: updated };
    });

    try {
      await setDoc(doc(db, "tarefas", cleanT.id), cleanT);
      logger.action("Tarefa criada no Firestore", { id: cleanT.id, descricao: cleanT.descricao });
    } catch (error) {
      logger.error("system", "Erro ao criar tarefa no Firestore", error);
    }
  },
  updateTarefa: async (id, patch) => {
    const cleanPatch = cleanForFirestore(patch);
    set((s) => {
      const updated = s.tarefas.map((t) =>
        t.id === id ? { ...t, ...cleanPatch } : t
      );
      setLocal(STORAGE_KEYS.TAREFAS, updated);
      return { tarefas: updated };
    });

    try {
      await updateDoc(doc(db, "tarefas", id), cleanPatch as any);
      logger.action("Tarefa atualizada no Firestore", { id, patch: cleanPatch });
    } catch (error) {
      logger.error("system", "Erro ao atualizar tarefa no Firestore", error);
    }
  },
  removeTarefa: async (id) => {
    set((s) => {
      const updated = s.tarefas.filter((t) => t.id !== id);
      setLocal(STORAGE_KEYS.TAREFAS, updated);
      return { tarefas: updated };
    });

    try {
      await deleteDoc(doc(db, "tarefas", id));
      logger.action("Tarefa removida no Firestore", { id });
    } catch (error) {
      logger.error("system", "Erro ao remover tarefa no Firestore", error);
    }
  },
  marcarInboxLido: (id) =>
    set((s) => ({
      inbox: s.inbox.map((i) =>
        i.id === id ? { ...i, lido: true } : i
      ),
    })),
  arquivarInbox: (id) =>
    set((s) => ({
      inbox: s.inbox.map((i) =>
        i.id === id ? { ...i, arquivado: true, lido: true } : i
      ),
    })),
  marcarNotificacaoLida: (id) =>
    set((s) => ({
      notificacoes: s.notificacoes.map((n) =>
        n.id === id ? { ...n, lida: true } : n
      ),
    })),
  marcarTodasNotificacoesLidas: () =>
    set((s) => ({
      notificacoes: s.notificacoes.map((n) => ({ ...n, lida: true })),
    })),
  addChatMessage: (m) =>
    set((s) => ({ chatMessages: [...s.chatMessages, m] })),
  clearChat: () => set({ chatMessages: [] }),
  limparDadosDemonstracao: () => {
    localStorage.removeItem(STORAGE_KEYS.PROCESSOS);
    localStorage.removeItem(STORAGE_KEYS.CLIENTES);
    localStorage.removeItem(STORAGE_KEYS.TAREFAS);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTOS);
    set({
      processos: [],
      clientes: [],
      tarefas: [],
      documentos: [],
      inbox: [],
      notificacoes: [],
    });
    toast.success("Dados de demonstração removidos. O sistema está limpo para uso real!");
  },

  loginWithGoogle: async () => {
    try {
      set({ authError: null });
      await signInWithPopup(auth, googleProvider);
      logger.info("auth", "User logged in with Google");
    } catch (e: any) {
      logger.error("auth", "Login failed", e);
      set({ authError: e.message || "Falha ao entrar com Google." });
    }
  },
  loginWithEmail: async (email, pass) => {
    try {
      set({ authError: null });
      const cleanEmail = email.trim().toLowerCase();
      
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
      
      const list = get().emailsAutorizados;
      if (!list.some((e) => e.toLowerCase() === cleanEmail)) {
        set({ emailsAutorizados: [...list, cleanEmail] });
        try {
          const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
          await setDoc(doc(db, "emails_autorizados", docId), {
            email: cleanEmail,
            adicionadoEm: new Date().toISOString(),
          });
        } catch (fErr) {
          logger.warn("auth", "Failed to add email to authorized list in Firestore", fErr);
        }
      }

      logger.info("auth", `User logged in with email: ${cleanEmail}`);
      toast.success("Login realizado com sucesso!");
      return { success: true };
    } catch (e: any) {
      logger.error("auth", "Email Login failed", e);
      let errMsg = "Falha na autenticação. Verifique e-mail e senha.";
      if (e.code === "auth/invalid-credential" || e.code === "auth/user-not-found" || e.code === "auth/wrong-password") {
        errMsg = "E-mail ou senha incorretos.";
      } else if (e.code === "auth/invalid-email") {
        errMsg = "Formato de e-mail inválido.";
      }
      set({ authError: errMsg });
      toast.error(errMsg);
      return { success: false, error: errMsg };
    }
  },
  signUpWithEmail: async (email, pass, nome) => {
    try {
      set({ authError: null });
      const cleanEmail = email.trim().toLowerCase();

      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (userCred.user && nome) {
        await updateProfile(userCred.user, { displayName: nome });
      }

      const list = get().emailsAutorizados;
      if (!list.some((e) => e.toLowerCase() === cleanEmail)) {
        set({ emailsAutorizados: [...list, cleanEmail] });
        try {
          const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
          await setDoc(doc(db, "emails_autorizados", docId), {
            email: cleanEmail,
            adicionadoEm: new Date().toISOString(),
          });
        } catch (fErr) {
          logger.warn("auth", "Failed to save auto-authorized email to Firestore", fErr);
        }
      }

      logger.info("auth", `User signed up with email: ${cleanEmail}`);
      toast.success("Conta criada com sucesso!");
      return { success: true };
    } catch (e: any) {
      logger.error("auth", "Email Sign Up failed", e);
      let errMsg = "Não foi possível criar a conta.";
      if (e.code === "auth/email-already-in-use") {
        errMsg = "Este e-mail já está cadastrado no sistema.";
      } else if (e.code === "auth/weak-password") {
        errMsg = "A senha deve ter pelo menos 6 caracteres.";
      } else if (e.code === "auth/invalid-email") {
        errMsg = "Formato de e-mail inválido.";
      } else if (e.message) {
        errMsg = e.message;
      }
      set({ authError: errMsg });
      toast.error(errMsg);
      return { success: false, error: errMsg };
    }
  },
  resetPassword: async (email) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        toast.error("Informe seu e-mail para recuperar a senha.");
        return { success: false, error: "E-mail não informado" };
      }
      await sendPasswordResetEmail(auth, cleanEmail);
      logger.info("auth", `Password reset email sent to: ${cleanEmail}`);
      toast.success(`E-mail de redefinição de senha enviado para ${cleanEmail}! Verifique sua caixa de entrada.`);
      return { success: true };
    } catch (e: any) {
      logger.error("auth", "Password reset failed", e);
      let errMsg = "Não foi possível enviar o e-mail de redefinição.";
      if (e.code === "auth/user-not-found") {
        errMsg = "Não encontramos nenhuma conta cadastrada com este e-mail.";
      } else if (e.code === "auth/invalid-email") {
        errMsg = "E-mail em formato inválido.";
      }
      toast.error(errMsg);
      return { success: false, error: errMsg };
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, authError: null });
      logger.info("auth", "User logged out");
      toast.info("Sessão encerrada.");
    } catch (e) {
      logger.error("auth", "Logout failed", e);
    }
  },

  addEmailAutorizado: async (email) => {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      toast.error("E-mail inválido.");
      return;
    }
    const currentList = get().emailsAutorizados;
    if (currentList.some((e) => e.toLowerCase() === clean)) {
      toast.info("Este e-mail já está na lista de autorizados.");
      return;
    }
    const updated = [...currentList, clean];
    set({ emailsAutorizados: updated });

    try {
      const docId = clean.replace(/[^a-zA-Z0-9]/g, "_");
      await setDoc(doc(db, "emails_autorizados", docId), {
        email: clean,
        adicionadoEm: new Date().toISOString(),
      });
      toast.success(`E-mail ${clean} autorizado com sucesso!`);
    } catch (e) {
      logger.error("auth", "Failed to add authorized email to Firestore", e);
    }
  },

  removeEmailAutorizado: async (email) => {
    const clean = email.trim().toLowerCase();
    const updated = get().emailsAutorizados.filter((e) => e.toLowerCase() !== clean);
    set({ emailsAutorizados: updated });

    try {
      const docId = clean.replace(/[^a-zA-Z0-9]/g, "_");
      await deleteDoc(doc(db, "emails_autorizados", docId));
      toast.success(`Autorização removida para ${clean}.`);
    } catch (e) {
      logger.error("auth", "Failed to remove authorized email from Firestore", e);
    }
  },

  initFirebase: async () => {
    if (firebaseInitialized) return;
    firebaseInitialized = true;

    // Enable IndexedDB offline persistence
    try {
      await enableIndexedDbPersistence(db);
      logger.info("system", "Firestore offline persistence enabled successfully");
    } catch (err: any) {
      if (err.code === "failed-precondition") {
        logger.warn("system", "Persistence failed: Multiple tabs open.");
      } else if (err.code === "unimplemented") {
        logger.warn("system", "Persistence is not supported by this browser.");
      }
    }

    // Listen to Authorized Emails collection
    try {
      onSnapshot(
        collection(db, "emails_autorizados"),
        (snapshot) => {
          const firestoreEmails = snapshot.docs.map((doc) => doc.data()?.email as string).filter(Boolean);
          if (firestoreEmails.length > 0) {
            const merged = Array.from(new Set([...initialAuthorizedEmails, ...firestoreEmails]));
            set({ emailsAutorizados: merged });
          }
        },
        (error) => {
          logger.warn("auth", "Firestore notice on emails_autorizados snapshot", error);
        }
      );
    } catch (e) {
      logger.warn("auth", "Notice listening to authorized emails", e);
    }

    // Set up collection listeners independently of auth state to ensure real-time persistence
    try {
      // Listen to Processos
      onSnapshot(
        collection(db, "processos"),
        (snapshot) => {
          const firestoreProcessos = snapshot.docs.map((doc) => doc.data() as Processo);
          if (firestoreProcessos.length > 0) {
            set((s) => {
              const map = new Map<string, Processo>();
              // Keep local state
              s.processos.forEach((p) => map.set(p.id, p));
              // Merge/overwrite with Firestore data
              firestoreProcessos.forEach((p) => map.set(p.id, p));
              const merged = Array.from(map.values()).sort((a, b) => b.id.localeCompare(a.id));
              setLocal(STORAGE_KEYS.PROCESSOS, merged);
              return { processos: merged };
            });
          } else {
            // Seed Firestore with local processes if empty
            const current = get().processos;
            current.forEach((p) => {
              setDoc(doc(db, "processos", p.id), cleanForFirestore(p)).catch(() => {});
            });
          }
        },
        (error) => {
          logger.warn("system", "Firestore info on processos snapshot", error);
        }
      );

      // Listen to Clientes
      onSnapshot(
        collection(db, "clientes"),
        (snapshot) => {
          const firestoreClientes = snapshot.docs.map((doc) => doc.data() as Cliente);
          if (firestoreClientes.length > 0) {
            set((s) => {
              const map = new Map<string, Cliente>();
              s.clientes.forEach((c) => map.set(c.id, c));
              firestoreClientes.forEach((c) => map.set(c.id, c));
              const merged = Array.from(map.values()).sort((a, b) => b.id.localeCompare(a.id));
              setLocal(STORAGE_KEYS.CLIENTES, merged);
              return { clientes: merged };
            });
          } else {
            const current = get().clientes;
            current.forEach((c) => {
              setDoc(doc(db, "clientes", c.id), cleanForFirestore(c)).catch(() => {});
            });
          }
        },
        (error) => {
          logger.warn("system", "Firestore info on clientes snapshot", error);
        }
      );

      // Listen to Tarefas
      onSnapshot(
        collection(db, "tarefas"),
        (snapshot) => {
          const firestoreTarefas = snapshot.docs.map((doc) => doc.data() as Tarefa);
          if (firestoreTarefas.length > 0) {
            set((s) => {
              const map = new Map<string, Tarefa>();
              s.tarefas.forEach((t) => map.set(t.id, t));
              firestoreTarefas.forEach((t) => map.set(t.id, t));
              const merged = Array.from(map.values()).sort((a, b) => b.id.localeCompare(a.id));
              setLocal(STORAGE_KEYS.TAREFAS, merged);
              return { tarefas: merged };
            });
          } else {
            const current = get().tarefas;
            current.forEach((t) => {
              setDoc(doc(db, "tarefas", t.id), cleanForFirestore(t)).catch(() => {});
            });
          }
        },
        (error) => {
          logger.warn("system", "Firestore info on tarefas snapshot", error);
        }
      );

      // Listen to Documentos
      onSnapshot(
        collection(db, "documentos"),
        (snapshot) => {
          const firestoreDocumentos = snapshot.docs.map((doc) => doc.data() as Documento);
          if (firestoreDocumentos.length > 0) {
            set((s) => {
              const map = new Map<string, Documento>();
              s.documentos.forEach((d) => map.set(d.id, d));
              firestoreDocumentos.forEach((d) => map.set(d.id, d));
              const merged = Array.from(map.values());
              return { documentos: merged };
            });
          } else {
            const current = get().documentos;
            current.forEach((d) => {
              setDoc(doc(db, "documentos", d.id), cleanForFirestore(d)).catch(() => {});
            });
          }
        },
        (error) => {
          logger.warn("system", "Firestore info on documentos snapshot", error);
        }
      );

      // Listen to Inbox
      onSnapshot(
        collection(db, "inbox"),
        (snapshot) => {
          const firestoreInbox = snapshot.docs.map((doc) => doc.data() as InboxJuridicoItem);
          if (firestoreInbox.length > 0) {
            set((s) => {
              const map = new Map<string, InboxJuridicoItem>();
              s.inbox.forEach((i) => map.set(i.id, i));
              firestoreInbox.forEach((i) => map.set(i.id, i));
              return { inbox: Array.from(map.values()) };
            });
          } else {
            const current = get().inbox;
            current.forEach((i) => {
              setDoc(doc(db, "inbox", i.id), cleanForFirestore(i)).catch(() => {});
            });
          }
        },
        (error) => {
          logger.warn("system", "Firestore info on inbox snapshot", error);
        }
      );

      // Listen to Notificacoes
      onSnapshot(
        collection(db, "notificacoes"),
        (snapshot) => {
          const firestoreNotifs = snapshot.docs.map((doc) => doc.data() as Notificacao);
          if (firestoreNotifs.length > 0) {
            set((s) => {
              const map = new Map<string, Notificacao>();
              s.notificacoes.forEach((n) => map.set(n.id, n));
              firestoreNotifs.forEach((n) => map.set(n.id, n));
              return { notificacoes: Array.from(map.values()) };
            });
          } else {
            const current = get().notificacoes;
            current.forEach((n) => {
              setDoc(doc(db, "notificacoes", n.id), cleanForFirestore(n)).catch(() => {});
            });
          }
        },
        (error) => {
          logger.warn("system", "Firestore info on notificacoes snapshot", error);
        }
      );

      // Listen to Equipe
      onSnapshot(
        collection(db, "equipe"),
        (snapshot) => {
          if (snapshot.docs.length === 0) {
            seedEquipe.forEach((m) => {
              setDoc(doc(db, "equipe", m.id), cleanForFirestore(m)).catch(() => {});
            });
          }
        },
        (error) => {
          logger.warn("system", "Firestore info on equipe snapshot", error);
        }
      );
    } catch (e) {
      logger.warn("system", "Error setting up collection listeners", e);
    }

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({ user: null, authError: null });
        return;
      }

      const email = user.email?.toLowerCase() || "";
      const authorizedList = get().emailsAutorizados;

      if (email && !authorizedList.some((e) => e.toLowerCase() === email)) {
        set({ emailsAutorizados: [...authorizedList, email] });
      }

      set({ user, authError: null });
    });
  },
}));
