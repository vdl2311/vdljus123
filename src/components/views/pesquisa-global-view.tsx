"use client";

import * as React from "react";
import {
  Search,
  Sparkles,
  Loader2,
  ArrowRight,
  FolderKanban,
  Users,
  FileText,
  Scale,
  CheckSquare,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import {
  jurisprudencias,
} from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const exemplos = [
  "TechNova",
  "processos trabalhistas",
  "horas extras",
  "guarda compartilhada",
  "ICMS PIS COFINS",
  "Helena Martins",
];

const tipoConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  processo: { icon: FolderKanban, label: "Processo", color: "bg-primary/10 text-primary" },
  cliente: { icon: Users, label: "Cliente", color: "bg-chart-2/10 text-chart-2" },
  documento: { icon: FileText, label: "Documento", color: "bg-info/10 text-info" },
  jurisprudencia: { icon: Scale, label: "Jurisprudência", color: "bg-warning/15 text-warning" },
  tarefa: { icon: CheckSquare, label: "Tarefa", color: "bg-success/10 text-success" },
};

interface Resultado {
  tipo: string;
  id: string;
  titulo: string;
  descricao: string;
  meta?: string;
  score: number;
}

export function PesquisaGlobalView() {
  const { processos, clientes, documentos, tarefas, openProcesso, setView } = useAppStore();
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [resultados, setResultados] = React.useState<Resultado[]>([]);
  const [resumo, setResumo] = React.useState("");
  const [sugestaoIA, setSugestaoIA] = React.useState("");

  async function buscar(q?: string) {
    const pergunta = (q ?? query).trim();
    if (!pergunta) {
      toast.error("Digite sua busca");
      return;
    }
    setLoading(true);
    setResultados([]);
    setResumo("");
    setSugestaoIA("");
    setQuery(pergunta);

    try {
      const res = await fetch("/api/ai/pesquisa-global", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: pergunta,
          processos,
          clientes,
          documentos,
          jurisprudencias,
          tarefas,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResultados(data.resultados || []);
      setResumo(data.resumo || "");
      setSugestaoIA(data.sugestaoIA || "");
    } catch {
      toast.error("Erro na busca");
    } finally {
      setLoading(false);
    }
  }

  function abrirResultado(r: Resultado) {
    if (r.tipo === "processo") {
      const p = processos.find((x) => x.id === r.id);
      if (p) openProcesso(p.id);
    } else if (r.tipo === "cliente") {
      setView("clientes");
    } else if (r.tipo === "documento") {
      setView("documentos");
    } else if (r.tipo === "jurisprudencia") {
      setView("jurisprudencia");
    } else if (r.tipo === "tarefa") {
      setView("tarefas");
    }
  }

  // Agrupar resultados por tipo
  const agrupados = React.useMemo(() => {
    const grupos: Record<string, Resultado[]> = {};
    resultados.forEach((r) => {
      if (!grupos[r.tipo]) grupos[r.tipo] = [];
      grupos[r.tipo].push(r);
    });
    return grupos;
  }, [resultados]);

  return (
    <div className="space-y-4">
      {/* Hero busca */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-chart-2/5">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <CardContent className="relative p-5 md:p-7">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/20 hover:bg-primary/15">
              <Sparkles className="h-3 w-3 mr-1" />
              Pesquisa Global Unificada
            </Badge>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              Encontre tudo em um só lugar
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Processos, clientes, documentos, jurisprudência e tarefas — com IA que entende contexto.
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
                  placeholder="Ex: TechNova, horas extras, guarda compartilhada..."
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

            {/* Exemplos */}
            {!resultados.length && !loading && (
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                <span className="text-xs text-muted-foreground">Sugestões:</span>
                {exemplos.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => buscar(ex)}
                    className="text-xs px-2 py-0.5 rounded-full border border-border hover:border-primary/40 hover:bg-accent/40"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="p-10 text-center">
            <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-3" />
            <p className="text-sm font-medium">Pesquisando em todos os dados...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Processos · Clientes · Documentos · Jurisprudência · Tarefas
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      <AnimatePresence>
        {!loading && resultados.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Resumo + sugestão IA */}
            {(resumo || sugestaoIA) && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {resumo && (
                        <p className="text-sm font-medium">{resumo}</p>
                      )}
                      {sugestaoIA && (
                        <div className="flex items-start gap-1.5 pt-1.5 border-t border-primary/20">
                          <Lightbulb className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">Sugestão: </span>
                            {sugestaoIA}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resultados por tipo */}
            {Object.entries(agrupados).map(([tipo, rawItems]) => {
              const items = rawItems as any[];
              const cfg = tipoConfig[tipo] || tipoConfig.processo;
              return (
                <div key={tipo}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", cfg.color)}>
                      <cfg.icon className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-sm font-semibold">{cfg.label}</h3>
                    <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((r, idx) => (
                      <motion.div
                        key={`${r.tipo}-${r.id}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                      >
                        <Card
                          className="cursor-pointer hover:shadow-elevated hover:border-primary/30 transition-all"
                          onClick={() => abrirResultado(r)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <p className="text-sm font-medium leading-tight flex-1 line-clamp-1">
                                {r.titulo}
                              </p>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] shrink-0",
                                  r.score >= 90 && "border-success/40 text-success",
                                  r.score >= 70 && r.score < 90 && "border-primary/40 text-primary",
                                  r.score < 70 && "border-muted-foreground/40"
                                )}
                              >
                                {r.score}% match
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{r.descricao}</p>
                            {r.meta && (
                              <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">{r.meta}</p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && query && resultados.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum resultado encontrado</p>
            <p className="text-xs mt-1">Tente reformular sua busca.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
