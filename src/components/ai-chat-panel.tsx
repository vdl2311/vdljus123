"use client";

import * as React from "react";
import { Sparkles, X, Send, Loader2, Trash2, User, Scale } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { processos as seedProcessos } from "@/lib/seed-data";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sugestoes?: string[];
  pending?: boolean;
  error?: boolean;
}

const quickPrompts = [
  "Quais processos têm prazo fatal nos próximos 7 dias?",
  "Resuma o processo TechNova x CloudProvider",
  "Gere um rascunho de contestação trabalhista",
  "Quais são as teses recentes do STF sobre ICMS na base do PIS/COFINS?",
];

export function AiChatPanel() {
  const { aiPanelOpen, setAiPanelOpen, selectedProcessoId, chatMessages, addChatMessage, clearChat } =
    useAppStore();
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [localMessages, setLocalMessages] = React.useState<LocalMessage[]>([]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const processoContexto = React.useMemo(() => {
    if (!selectedProcessoId) return undefined;
    const p = seedProcessos.find((x) => x.id === selectedProcessoId);
    if (!p) return undefined;
    return `Processo: ${p.numeroCnj} — ${p.classeProcessual}\nTribunal: ${p.tribunal} (${p.comarca})\nCliente: ${p.clienteNome}\nPartes: ${p.partes.poloAtivo} vs ${p.partes.poloPassivo}\nStatus: ${p.status} | Risco: ${p.risco}\nValor da causa: R$ ${p.valorCausa.toLocaleString("pt-BR")}\nResumo IA: ${p.resumoIa || "Não disponível"}`;
  }, [selectedProcessoId]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  // Atalho Cmd+J
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setAiPanelOpen(!aiPanelOpen);
      }
      if (e.key === "Escape") {
        setAiPanelOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [aiPanelOpen, setAiPanelOpen]);

  async function enviar(pergunta?: string) {
    const q = (pergunta ?? input).trim();
    if (!q || loading) return;

    const userMsg: LocalMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
    };
    const pendingMsg: LocalMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      pending: true,
    };
    setLocalMessages((prev) => [...prev, userMsg, pendingMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...localMessages, userMsg]
        .filter((m) => !m.pending && !m.error)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          contextoProcesso: processoContexto,
        }),
      });

      const text = await res.text();
      let data: any = null;
      if (text) {
        try { data = JSON.parse(text); } catch {}
      }

      if (!res.ok || !data) throw new Error(data?.error || "Falha na resposta da IA");

      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === pendingMsg.id
            ? {
                ...m,
                pending: false,
                content: data.content,
                sugestoes: data.sugestoes || [],
              }
            : m
        )
      );
    } catch (e) {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === pendingMsg.id
            ? {
                ...m,
                pending: false,
                error: true,
                content:
                  "Não foi possível conectar ao Copiloto. Verifique sua conexão e tente novamente.",
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    setLocalMessages([]);
    clearChat();
  }

  return (
    <AnimatePresence>
      {aiPanelOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="fixed right-0 top-0 z-40 h-screen w-full sm:w-[440px] md:w-[480px] bg-card border-l border-border flex flex-col shadow-elevated"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-14 border-b">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Copiloto Jurídico</p>
                <p className="text-xs text-muted-foreground">
                  {processoContexto ? "Contexto: processo selecionado" : "Assistente geral"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {localMessages.length > 0 && (
                <Button variant="ghost" size="icon" onClick={clearConversation} className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => setAiPanelOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollRef as any}>
            <div className="p-4 space-y-4 min-h-full">
              {localMessages.length === 0 && (
                <div className="flex flex-col items-center text-center pt-10 gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-glow">
                    <Scale className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-semibold">Como posso ajudar?</p>
                    <p className="text-sm text-muted-foreground max-w-[300px]">
                      Posso analisar processos, sugerir peças jurídicas, identificar prazos e responder dúvidas.
                    </p>
                  </div>
                  <div className="w-full space-y-2 mt-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      Sugestões
                    </p>
                    {quickPrompts.map((p) => (
                      <button
                        key={p}
                        onClick={() => enviar(p)}
                        className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-sm"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {localMessages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-2.5",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {m.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground mt-1">
                      {m.pending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : m.error
                        ? "bg-destructive/10 text-destructive rounded-tl-md"
                        : "bg-muted rounded-tl-md"
                    )}
                  >
                    {m.pending ? (
                      <div className="flex items-center gap-1.5 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse delay-150" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-pulse delay-300" />
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        {m.content.split("\n").map((line, i) => (
                          <p key={i} className={line.startsWith("**") ? "font-semibold mt-2 mb-1" : "mb-2"}>
                            {line.replace(/\*\*/g, "")}
                          </p>
                        ))}
                      </div>
                    )}
                    {!m.pending && m.sugestoes && m.sugestoes.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-border/40 space-y-1.5">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                          Continue
                        </p>
                        {m.sugestoes.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => enviar(s)}
                            className="block w-full text-left text-xs text-primary hover:underline"
                          >
                            → {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {m.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-1">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviar();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviar();
                  }
                }}
                rows={1}
                placeholder="Pergunte sobre processos, peças, jurisprudência..."
                className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-h-32"
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()} className="rounded-xl h-10 w-10">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="text-xs text-muted-foreground/70 mt-1.5 text-center">
              Pressione Enter para enviar · Shift+Enter para nova linha
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
