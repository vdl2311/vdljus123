"use client";

import * as React from "react";
import {
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Sparkles,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Filter,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import {
  jurisprudencias,
  tendenciasJurisprudenciais,
} from "@/lib/seed-data";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

const tendenciaConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }> = {
  "Favorável": { icon: ThumbsUp, color: "text-success", bg: "bg-success/10", label: "Favorável" },
  "Contrária": { icon: ThumbsDown, color: "text-destructive", bg: "bg-destructive/10", label: "Contrária" },
  "Neutra": { icon: Minus, color: "text-muted-foreground", bg: "bg-muted", label: "Neutra" },
};

export function JurisprudenciaView() {
  const [search, setSearch] = React.useState("");
  const [areaFiltro, setAreaFiltro] = React.useState("todas");
  const [explicando, setExplicando] = React.useState<string | null>(null);
  const [explicacao, setExplicacao] = React.useState<Record<string, any>>({});
  const { setAiPanelOpen } = useAppStore();

  const areas = ["todas", ...Array.from(new Set(jurisprudencias.map((j) => j.area)))];

  const filtradas = React.useMemo(() => {
    return jurisprudencias
      .filter((j) => areaFiltro === "todas" || j.area === areaFiltro)
      .filter((j) => {
        const q = search.toLowerCase();
        return (
          !q ||
          j.ementa.toLowerCase().includes(q) ||
          j.tese.toLowerCase().includes(q) ||
          j.tribunal.toLowerCase().includes(q) ||
          j.relator.toLowerCase().includes(q) ||
          j.area.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [search, areaFiltro]);

  async function explicar(id: string, ementa: string, contexto: string) {
    setExplicando(id);
    try {
      const res = await fetch("/api/ai/explicar-decisao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: ementa, contexto }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setExplicacao((prev) => ({ ...prev, [id]: data }));
      toast.success("Decisão explicada pela IA");
    } catch {
      toast.error("Erro ao explicar decisão");
    } finally {
      setExplicando(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Hero com tendências */}
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-chart-2/5">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <CardContent className="relative p-5 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/15">
              <Sparkles className="h-3 w-3 mr-1" />
              Painel de Jurisprudência IA
            </Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-bold leading-tight mb-1">
            Tendências dos tribunais em tempo real
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Análise contínua de decisões do STF, STJ, TST e tribunais regionais. Identifique
            padrões favoráveis à sua tese antes de ajuizar ou recorrer.
          </p>
        </CardContent>
      </Card>

      {/* Tendências por área */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary" />
          Tendências por área
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tendenciasJurisprudenciais.map((t, idx) => {
            const cfg = tendenciaConfig[t.tendencia];
            return (
              <motion.div
                key={`${t.area}-${t.tribunal}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-elevated transition-all h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="text-xs font-semibold">{t.area}</p>
                        <p className="text-[10px] text-muted-foreground">{t.tribunal}</p>
                      </div>
                      <Badge variant="outline" className={cn("text-[9px]", cfg.color, cfg.bg, "border-current/30")}>
                        <cfg.icon className="h-2.5 w-2.5 mr-0.5" />
                        {cfg.label}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">% Favorável</span>
                          <span className={cn("font-bold tabular-nums", cfg.color)}>{t.percentualFavoravel}%</span>
                        </div>
                        <Progress
                          value={t.percentualFavoravel}
                          className={cn("h-2", t.tendencia === "Favorável" && "[&>div]:bg-success", t.tendencia === "Contrária" && "[&>div]:bg-destructive")}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{t.totalDecisoes} decisões analisadas</span>
                        <span className={cn("flex items-center gap-0.5 font-medium", t.variacaoMes >= 0 ? "text-success" : "text-destructive")}>
                          {t.variacaoMes >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                          {Math.abs(t.variacaoMes)}% mês
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Tese predominante</p>
                        <p className="text-xs leading-snug">{t.tesePredominante}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Filtros + busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ementas, teses, relatores..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={areaFiltro} onValueChange={setAreaFiltro}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a === "todas" ? "Todas áreas" : a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de jurisprudências */}
      <div className="space-y-3">
        {filtradas.map((j, idx) => {
          const isExplicando = explicando === j.id;
          const temExplicacao = explicacao[j.id];
          return (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.4) }}
            >
              <Card className="hover:shadow-elevated transition-all overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shrink-0", j.favoravel ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                      {j.favoravel ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-tight">{j.tribunal} · {j.classe}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Relator: {j.relator} · Julgado em {format(parseISO(j.dataJulgamento), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px]",
                              j.relevanceScore >= 90 && "border-success/40 text-success",
                              j.relevanceScore >= 75 && j.relevanceScore < 90 && "border-primary/40 text-primary"
                            )}
                          >
                            {j.relevanceScore}% relev.
                          </Badge>
                          <Badge variant="outline" className="text-[9px]">{j.area}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/40 p-3 mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Tese firmada</p>
                    <p className="text-sm font-medium leading-snug">{j.tese}</p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{j.ementa}</p>

                  <div className="flex items-center gap-1.5 mt-3">
                    <Badge variant="outline" className="text-[9px] font-mono">
                      {j.processoOrigem}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px]", j.favoravel ? "border-success/40 text-success" : "border-destructive/40 text-destructive")}
                    >
                      {j.favoravel ? "Favorável" : "Contrária"}
                    </Badge>
                  </div>

                  {/* Explicação IA (se disponível) */}
                  {temExplicacao && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">Explicação em linguagem simples</p>
                          <p className="text-sm leading-relaxed">{temExplicacao.explicacaoSimples}</p>
                        </div>
                      </div>
                      {temExplicacao.pontosChave && temExplicacao.pontosChave.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Pontos-chave</p>
                          <ul className="text-xs space-y-0.5">
                            {temExplicacao.pontosChave.map((p: string, i: number) => (
                              <li key={i} className="flex gap-1">
                                <span className="text-primary">·</span> {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {temExplicacao.impacto && (
                        <div className="mt-2 pt-2 border-t border-primary/20">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Impacto prático</p>
                          <p className="text-xs">{temExplicacao.impacto}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex items-center gap-1.5 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 gap-1.5"
                      onClick={() => explicar(j.id, j.ementa, `${j.tribunal} - ${j.classe} - ${j.area}`)}
                      disabled={isExplicando}
                    >
                      {isExplicando ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      {isExplicando ? "Explicando..." : temExplicacao ? "Reexplicar" : "Explicar com IA"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 gap-1.5"
                      onClick={() => setAiPanelOpen(true)}
                    >
                      <Lightbulb className="h-3 w-3" />
                      Perguntar ao Copiloto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
