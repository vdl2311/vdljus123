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
  
  // Auth
  user: any | null;
  setUser: (user: any | null) => void;
  authError: string | null;
  setAuthError: (error: string | null) => void;
  emailsAutorizados: string[];

  // Initialization
  initFirebase: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
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
  githubProvider, 
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
  setDoc 
} from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { logger } from "./logger";
import { toast } from "sonner";

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

  processos: seedProcessos,
  clientes: seedClientes,
  tarefas: seedTarefas,
  documentos: seedDocumentos,
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
    // Optimistic update
    set((s) => ({ processos: [p, ...s.processos] }));
    try {
      await setDoc(doc(db, "processos", p.id), p);
      logger.action("Processo criado", { id: p.id, numeroCnj: p.numeroCnj });
    } catch (error) {
      logger.error("system", "Erro ao criar processo", error);
    }
  },
  updateProcesso: async (id, patch) => {
    set((s) => ({
      processos: s.processos.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    }));
    try {
      await updateDoc(doc(db, "processos", id), patch as any);
      logger.action("Processo atualizado", { id, patch });
    } catch (error) {
      logger.error("system", "Erro ao atualizar processo", error);
    }
  },
  addCliente: async (c) => {
    set((s) => ({ clientes: [c, ...s.clientes] }));
    try {
      await setDoc(doc(db, "clientes", c.id), c);
      logger.action("Cliente criado", { id: c.id, nome: c.nome });
    } catch (error) {
      logger.error("system", "Erro ao criar cliente", error);
    }
  },
  addTarefa: async (t) => {
    set((s) => ({ tarefas: [t, ...s.tarefas] }));
    try {
      await setDoc(doc(db, "tarefas", t.id), t);
      logger.action("Tarefa criada", { id: t.id, descricao: t.descricao });
    } catch (error) {
      logger.error("system", "Erro ao criar tarefa", error);
    }
  },
  updateTarefa: async (id, patch) => {
    set((s) => ({
      tarefas: s.tarefas.map((t) =>
        t.id === id ? { ...t, ...patch } : t
      ),
    }));
    try {
      await updateDoc(doc(db, "tarefas", id), patch as any);
      logger.action("Tarefa atualizada", { id, patch });
    } catch (error) {
      logger.error("system", "Erro ao atualizar tarefa", error);
    }
  },
  removeTarefa: async (id) => {
    set((s) => ({ tarefas: s.tarefas.filter((t) => t.id !== id) }));
    try {
      await deleteDoc(doc(db, "tarefas", id));
      logger.action("Tarefa removida", { id });
    } catch (error) {
      logger.error("system", "Erro ao remover tarefa", error);
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
  loginWithGithub: async () => {
    try {
      set({ authError: null });
      await signInWithPopup(auth, githubProvider);
      logger.info("auth", "User logged in with GitHub");
    } catch (e: any) {
      logger.error("auth", "GitHub Login failed", e);
      set({ authError: e.message || "Falha ao entrar com GitHub." });
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

      try {
        // Listen to Processos
        onSnapshot(
          collection(db, "processos"),
          (snapshot) => {
            const processosData = snapshot.docs.map((doc) => doc.data() as Processo).sort((a, b) => b.id.localeCompare(a.id));
            if (processosData.length > 0) {
              set({ processos: processosData });
            } else {
              seedProcessos.forEach((p) => setDoc(doc(db, "processos", p.id), p).catch(() => {}));
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
            const clientesData = snapshot.docs.map((doc) => doc.data() as Cliente).sort((a, b) => b.id.localeCompare(a.id));
            if (clientesData.length > 0) {
              set({ clientes: clientesData });
            } else {
              seedClientes.forEach((c) => setDoc(doc(db, "clientes", c.id), c).catch(() => {}));
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
            const tarefasData = snapshot.docs.map((doc) => doc.data() as Tarefa).sort((a, b) => b.id.localeCompare(a.id));
            if (tarefasData.length > 0) {
              set({ tarefas: tarefasData });
            } else {
              seedTarefas.forEach((t) => setDoc(doc(db, "tarefas", t.id), t).catch(() => {}));
            }
          },
          (error) => {
            logger.warn("system", "Firestore info on tarefas snapshot", error);
          }
        );
      } catch (e) {
        logger.warn("system", "Firebase fetch info", e);
      }
    });
  },
}));
