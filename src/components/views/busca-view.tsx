"use client";

import * as React from "react";
import {
  Search,
  Sparkles,
  Loader2,
  ArrowRight,
  FolderKanban,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const exemplos = [
  "Mostre processos trabalhistas com risco alto e prazo nos próximos 15 dias",
  "Quais processos têm valor da causa acima de R$ 500 mil?",
  "Processos do cliente TechNova Soluções",
  "Processos com audiência marcada para agosto",
  "Processos arquivados em 2024",
  "Processos tributários com alta probabilidade de êxito",
];

interface ResultadoBusca {
  processosMatched: string[];
  explicacao: string;
  resumo: string;
}

export function BuscaView() {
  const { processos, openProcesso } = useAppStore();
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resultado, setResultado] = React.useState<ResultadoBusca | null>(null);

  async function buscar(q?: string) {
    const pergunta = (q ?? query).trim();
    if (!pergunta) {
      toast.error("Digite sua pergunta");
      return;
    }
    setLoading(true);
    setResultado(null);
    setQuery(pergunta);

    try {
      const res = await fetch("/api/ai/busca-inteligente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: pergunta, processos }),
      });
      const text = await res.text();
      let data: any = null;
      if (text) {
        try { data = JSON.parse(text); } catch {}
      }
      if (!res.ok || !data) throw new Error(data?.error || "Erro ao realizar busca");
      setResultado(data);
    } catch {
      toast.error("Erro na busca. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const processosEncontrados = React.useMemo(() => {
    if (!resultado) return [];
    return resultado.processosMatched
      .map((id) => processos.find((p) => p.id === id))
      .filter(Boolean);
  }, [resultado, processos]);

  return (
    <div className="space-y-4">
      {/* Hero busca */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-chart-2/5">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <CardContent className="relative p-5 md:p-7">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/20 hover:bg-primary/15">
              <Sparkles className="h-3 w-3 mr-1" />
              Busca Jurídica Inteligente
            </Badge>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Pergunte em linguagem natural
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              A IA entende o contexto dos seus processos e responde com precisão.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                buscar();
              }}
              className="w-full flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ex: processos trabalhistas com prazo nos próximos 15 dias..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 h-11 text-sm"
                />
              </div>
              <Button type="submit" disabled={loading} size="lg" className="gap-1.5">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Exemplos */}
      {!resultado && !loading && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <Lightbulb className="h-4 w-4 text-warning" />
              <p className="text-sm font-semibold">Exemplos de perguntas</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exemplos.map((ex) => (
                <button
                  key={ex}
                  onClick={() => buscar(ex)}
                  className="group flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-accent/40 transition-all text-left text-sm"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                  <span className="flex-1">{ex}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="p-10 text-center">
            <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-3" />
            <p className="text-sm font-medium">Analisando processos com IA...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Cruzando critérios em {processos.length} processos
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resultado */}
      <AnimatePresence>
        {resultado && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Resumo da busca */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1">{resultado.resumo}</p>
                    <p className="text-xs text-muted-foreground">{resultado.explicacao}</p>
                    <Badge variant="secondary" className="mt-2 text-[10px]">
                      {processosEncontrados.length} processo(s) encontrado(s)
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processos encontrados */}
            <div className="grid grid-cols-1 gap-3">
              {processosEncontrados.length === 0 ? (
                <Card>
                  <CardContent className="p-10 text-center text-muted-foreground">
                    <FolderKanban className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Nenhum processo corresponde</p>
                    <p className="text-xs mt-1">Tente reformular sua busca.</p>
                  </CardContent>
                </Card>
              ) : (
                processosEncontrados.map((p) => {
                  if (!p) return null;
                  const diasPrazo = p.datasImportantes.prazoFatal
                    ? differenceInDays(new Date(p.datasImportantes.prazoFatal), new Date())
                    : null;
                  return (
                    <Card
                      key={p.id}
                      className="cursor-pointer hover:shadow-elevated hover:border-primary/30 transition-all"
                      onClick={() => openProcesso(p.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-1 h-10 w-10 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs",
                              p.risco === "Alto" && "bg-destructive/10 text-destructive",
                              p.risco === "Médio" && "bg-warning/15 text-warning",
                              p.risco === "Baixo" && "bg-success/10 text-success"
                            )}
                          >
                            {p.area.slice(0, 3).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  {p.numeroCnj}
                                </p>
                                <p className="text-sm font-semibold truncate">
                                  {p.clienteNome} · {p.assunto}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-[10px]">
                                {p.area}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {p.tribunal}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {formatCurrency(p.valorCausa)}
                              </Badge>
                              {diasPrazo !== null && (
                                <Badge
                                  variant={diasPrazo <= 7 ? "destructive" : "secondary"}
                                  className="text-[10px]"
                                >
                                  Prazo: {diasPrazo}d
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
