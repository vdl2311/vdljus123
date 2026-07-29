"use client";

import * as React from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Scale,
  FileText,
  Zap,
  Trash2,
  Copy,
  Check,
  ScrollText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sugestoes?: string[];
  pending?: boolean;
}

const quickPrompts = [
  "Quais processos têm prazo fatal nos próximos 7 dias?",
  "Resuma o processo TechNova x CloudProvider",
  "Quais as teses recentes do STF sobre ICMS na base do PIS/COFINS?",
  "Como contestar horas extras em ação trabalhista?",
];

export function CopilotoView() {
  const [activeTab, setActiveTab] = React.useState<"chat" | "peca">("chat");

  return (
    <div className="h-[calc(100vh-7rem)]">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full">
        <div className="flex items-center justify-between mb-3">
          <TabsList>
            <TabsTrigger value="chat" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Conversa
            </TabsTrigger>
            <TabsTrigger value="peca" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Gerar peça
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="chat" className="h-[calc(100%-3rem)] m-0">
          <ChatTab />
        </TabsContent>
        <TabsContent value="peca" className="h-[calc(100%-3rem)] m-0">
          <PecaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChatTab() {
  const [messages, setMessages] = React.useState<LocalMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    setMessages((prev) => [...prev, userMsg, pendingMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg]
        .filter((m) => !m.pending)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      const text = await res.text();
      let data: any = null;
      if (text) {
        try { data = JSON.parse(text); } catch {}
      }

      if (!res.ok || !data) throw new Error(data?.error || "Erro ao consultar o Copiloto");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingMsg.id
            ? {
                ...m,
                pending: false,
                content: data.content || "Não foi possível gerar resposta.",
                sugestoes: data.sugestoes || [],
              }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingMsg.id
            ? {
                ...m,
                pending: false,
                content: "Erro ao conectar com o Copiloto. Tente novamente.",
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full" ref={scrollRef as any}>
          <div className="p-4 md:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center pt-10 gap-4 max-w-2xl mx-auto">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shadow-glow">
                  <Scale className="h-7 w-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-semibold">Copiloto Jurídico</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Seu assistente jurídico pessoal com conhecimento em todas as áreas do direito brasileiro.
                    Pode analisar processos, sugerir peças, identificar prazos e responder dúvidas.
                  </p>
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {quickPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => enviar(p)}
                      className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/40 transition-all text-sm flex items-start gap-2"
                    >
                      <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-3",
                  m.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {m.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground mt-1">
                    {m.pending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-md"
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
                    <div className="space-y-1.5">
                      {m.content.split("\n").map((line, i) => (
                        <p key={i} className={cn(line.startsWith("**") && "font-semibold")}>
                          {line.replace(/\*\*/g, "")}
                        </p>
                      ))}
                    </div>
                  )}
                  {!m.pending && m.sugestoes && m.sugestoes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/40 space-y-1.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                        Perguntas sugeridas
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
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t p-3 md:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviar();
          }}
          className="flex items-end gap-2"
        >
          <Textarea
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
            className="flex-1 resize-none min-h-[44px] max-h-32"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} className="h-11 w-11">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground/70 mt-1.5 text-center">
          Enter para enviar · Shift+Enter para nova linha · O Copiloto pode errar — valide sempre
        </p>
      </div>
    </Card>
  );
}

function PecaTab() {
  const [tipo, setTipo] = React.useState("Contestação Trabalhista");
  const [contexto, setContexto] = React.useState("");
  const [partes, setPartes] = React.useState("");
  const [fatos, setFatos] = React.useState("");
  const [pedidos, setPedidos] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resultado, setResultado] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  async function gerar() {
    if (!tipo) {
      toast.error("Informe o tipo de peça");
      return;
    }
    setLoading(true);
    setResultado(null);
    try {
      const res = await fetch("/api/ai/gerar-peca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, contexto, partes, fatos, pedidos }),
      });
      const text = await res.text();
      let data: any = null;
      if (text) {
        try { data = JSON.parse(text); } catch {}
      }
      if (!res.ok || !data) throw new Error(data?.error || "Erro ao gerar minuta da peça");
      setResultado(data.pecaMarkdown || data.content || "Minuta gerada com sucesso.");
      toast.success("Peça gerada!");
    } catch {
      toast.error("Erro ao gerar peça");
    } finally {
      setLoading(false);
    }
  }

  function copiar() {
    if (!resultado) return;
    navigator.clipboard.writeText(resultado);
    setCopied(true);
    toast.success("Copiado para a área de transferência");
    setTimeout(() => setCopied(false), 2000);
  }

  const tiposPeca = [
    "Petição Inicial Trabalhista",
    "Contestação Trabalhista",
    "Recurso Ordinário",
    "Apelação Cível",
    "Contrarrazões",
    "Mandado de Segurança",
    "Petição Inicial Cível",
    "Contestação Cível",
    "Memoriais",
    "Agravo de Instrumento",
  ];

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
          {/* Form */}
          <div className="p-5 space-y-4 border-r">
            <div>
              <h3 className="text-sm font-semibold mb-1">Configuração da peça</h3>
              <p className="text-xs text-muted-foreground">
                Preencha as informações e a IA gera um rascunho profissional.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tipo de peça</Label>
              <Textarea
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                rows={2}
                placeholder="Ex: Contestação Trabalhista"
              />
              <div className="flex gap-1 flex-wrap">
                {tiposPeca.slice(0, 5).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipo(t)}
                    className="text-[10px] px-2 py-1 rounded-md border border-border hover:bg-accent"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contexto do processo</Label>
              <Textarea
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                placeholder="Ex: Processo trabalhista na 1ª Vara de São Paulo. Cliente réu. Alegação de horas extras..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Partes</Label>
              <Textarea
                value={partes}
                onChange={(e) => setPartes(e.target.value)}
                placeholder="Reclamante: João Bezerra, RG..., CTPS..., endereço...&#10;Reclamada: Construtora Horizonte Ltda, CNPJ..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Fatos</Label>
              <Textarea
                value={fatos}
                onChange={(e) => setFatos(e.target.value)}
                placeholder="Descreva os fatos relevantes..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Pedidos (opcional)</Label>
              <Textarea
                value={pedidos}
                onChange={(e) => setPedidos(e.target.value)}
                placeholder="Pedidos específicos..."
                rows={2}
              />
            </div>

            <Button onClick={gerar} disabled={loading} className="w-full gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Gerando..." : "Gerar rascunho"}
            </Button>
          </div>

          {/* Resultado */}
          <div className="p-5 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Rascunho gerado</h3>
              </div>
              {resultado && (
                <Button variant="outline" size="sm" onClick={copiar} className="gap-1.5 text-xs h-7">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-sm font-medium">Gerando peça...</p>
                <p className="text-xs text-muted-foreground mt-1">Pode levar alguns segundos</p>
              </div>
            ) : resultado ? (
              <div className="rounded-lg border bg-card p-4 max-h-[60vh] overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-sans leading-relaxed">
                  {resultado}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <FileText className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">Nenhuma peça gerada ainda</p>
                <p className="text-xs mt-1">Preencha o formulário e clique em Gerar rascunho</p>
              </div>
            )}

            {resultado && (
              <div className="mt-3 rounded-lg border border-warning/30 bg-warning/5 p-2.5 flex items-start gap-2">
                <ScrollText className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Atenção:</strong> Este é um rascunho gerado por IA. Revise cuidadosamente
                  antes de protocolar. Verifique prazos, endereçamento, fundos de instância e
                  adequação ao caso concreto.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
