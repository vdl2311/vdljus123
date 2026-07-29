"use client";

import * as React from "react";
import {
  Sparkles,
  RefreshCw,
  Loader2,
  AlertOctagon,
  Clock,
  Users,
  FileWarning,
  TrendingUp,
  TrendingDown,
  Handshake,
  Zap,
  Filter,
  ChevronRight,
  CheckCircle2,
  Bot,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/lib/store";
import {
  insightsProativos as insightsIniciais,
} from "@/lib/seed-data";
import type { InsightProativo, InsightTipo, InsightSeveridade } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const severidadeConfig: Record<
  InsightSeveridade,
  { color: string; bg: string; label: string; border: string }
> = {
  critica: { color: "text-destructive", bg: "bg-destructive/10", label: "Crítica", border: "border-destructive/30" },
  alta: { color: "text-warning", bg: "bg-warning/15", label: "Alta", border: "border-warning/30" },
  media: { color: "text-info", bg: "bg-info/10", label: "Média", border: "border-info/30" },
  baixa: { color: "text-muted-foreground", bg: "bg-muted", label: "Baixa", border: "border-border" },
};

const tipoConfig: Record<
  InsightTipo,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  prazo_urgente: { icon: Clock, label: "Prazos Urgentes" },
  cliente_sem_contato: { icon: Users, label: "Clientes sem Contato" },
  documento_faltante: { icon: FileWarning, label: "Documentos Faltantes" },
  movimentacao_importante: { icon: Activity, label: "Movimentações Importantes" },
  oportunidade_sucesso: { icon: TrendingUp, label: "Oportunidades de Êxito" },
  risco_perda: { icon: TrendingDown, label: "Riscos de Perda" },
  oportunidade_acordo: { icon: Handshake, label: "Oportunidades de Acordo" },
  gargalo_produto: { icon: Zap, label: "Gargalos Operacionais" },
};

export function CopilotoProativoView() {
  const { processos, tarefas, inbox, openProcesso, setView, setAiPanelOpen } = useAppStore();
  const [insights, setInsights] = React.useState<InsightProativo[]>(insightsIniciais);
  const [novosInsights, setNovosInsights] = React.useState<InsightProativo[]>([]);
  const [resumoExecutivo, setResumoExecutivo] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [filtro, setFiltro] = React.useState<InsightTipo | "todos">("todos");
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());
  const [resolvidos, setResolvidos] = React.useState<Set<string>>(new Set());

  async function analisar() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/copiloto-proativo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processos,
          tarefas,
          inbox,
          lancamentos: [], // simplificado
          insightsExistentes: insights,
        }),
      });
      const text = await res.text();
      let data: any = null;
      if (text) {
        try { data = JSON.parse(text); } catch {}
      }
      if (!res.ok || !data) throw new Error(data?.error || "Erro no copiloto proativo");
      if (data.insights && data.insights.length > 0) {
        const novosFormatados: InsightProativo[] = data.insights.map((i: any, idx: number) => ({
          ...i,
          id: `novo-${Date.now()}-${idx}`,
          processoId: i.processoId || undefined,
          processoNumeroCnj: i.processoNumeroCnj || undefined,
          clienteNome: i.clienteNome || undefined,
          prazoDias: i.prazoDias || undefined,
          impactoFinanceiro: i.impactoFinanceiro || undefined,
          probabilidadeSucesso: i.probabilidadeSucesso || undefined,
        }));
        setNovosInsights(novosFormatados);
        setResumoExecutivo(data.resumoExecutivo || "");
        setLastUpdate(new Date());
        toast.success(`${novosFormatados.length} novos insights gerados pela IA`);
      } else {
        toast.info("Nenhum insight novo — escritório está em dia!");
      }
    } catch {
      toast.error("Erro ao gerar insights");
    } finally {
      setLoading(false);
    }
  }

  function marcarResolvido(id: string) {
    setResolvidos((prev) => new Set(prev).add(id));
    toast.success("Insight marcado como resolvido");
  }

  const todosInsights = [...novosInsights, ...insights].filter(
    (i) => !resolvidos.has(i.id)
  );

  const insightsFiltrados =
    filtro === "todos" ? todosInsights : todosInsights.filter((i) => i.tipo === filtro);

  // Agrupar por tipo
  const insightsAgrupados = React.useMemo(() => {
    const grupos: Record<string, InsightProativo[]> = {};
    insightsFiltrados.forEach((i) => {
      if (!grupos[i.tipo]) grupos[i.tipo] = [];
      grupos[i.tipo].push(i);
    });
    return grupos;
  }, [insightsFiltrados]);

  // Stats
  const criticasCount = todosInsights.filter((i) => i.severidade === "critica").length;
  const altasCount = todosInsights.filter((i) => i.severidade === "alta").length;
  const impactoTotal = todosInsights.reduce(
    (acc, i) => acc + (i.impactoFinanceiro || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Hero — Copiloto Proativo */}
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-chart-2/5">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <CardContent className="relative p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/15">
                  <Bot className="h-3 w-3 mr-1" />
                  Copiloto Proativo
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Última análise: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ptBR })}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold leading-tight">
                {resumoExecutivo ||
                  "Analisando continuamente todos os seus processos em segundo plano."}
              </h2>
              <p className="text-sm text-muted-foreground">
                O Copiloto Proativo monitora prazos, movimentações, oportunidades, riscos e gargalos
                24/7. Recomenda ações concretas antes que você precise perguntar.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button onClick={analisar} disabled={loading} size="sm" className="gap-1.5">
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {loading ? "Analisando..." : "Nova análise IA"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAiPanelOpen(true)} className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Perguntar ao Copiloto
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="rounded-xl bg-card/80 border border-destructive/20 p-3 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-destructive tabular-nums">{criticasCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Críticas</p>
              </div>
              <div className="rounded-xl bg-card/80 border border-warning/20 p-3 text-center min-w-[80px]">
                <p className="text-2xl font-bold text-warning tabular-nums">{altasCount}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Altas</p>
              </div>
              <div className="rounded-xl bg-card/80 border border-primary/20 p-3 text-center min-w-[80px]">
                <p className="text-lg font-bold text-primary tabular-nums">{formatCurrency(impactoTotal).replace("R$", "").trim()}</p>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Impacto R$</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros por tipo */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <button
          onClick={() => setFiltro("todos")}
          className={cn(
            "text-xs px-2.5 py-1 rounded-md border transition-colors",
            filtro === "todos"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-accent"
          )}
        >
          Todos ({todosInsights.length})
        </button>
        {Object.entries(tipoConfig).map(([key, cfg]) => {
          const count = todosInsights.filter((i) => i.tipo === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setFiltro(key as InsightTipo)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1",
                filtro === key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-accent"
              )}
            >
              <cfg.icon className="h-3 w-3" />
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Insights agrupados por tipo */}
      <div className="space-y-5">
        {Object.entries(insightsAgrupados).map(([tipo, rawItems]) => {
          const items = rawItems as InsightProativo[];
          const cfg = tipoConfig[tipo as InsightTipo];
          if (!cfg || items.length === 0) return null;
          return (
            <div key={tipo}>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <cfg.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{cfg.label}</h3>
                  <p className="text-[10px] text-muted-foreground">{items.length} insight(s)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {items.map((insight, idx) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    isNew={novosInsights.some((n) => n.id === insight.id)}
                    onOpenProcesso={() => insight.processoId && openProcesso(insight.processoId)}
                    onResolve={() => marcarResolvido(insight.id)}
                    onAskAi={() => setAiPanelOpen(true)}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {insightsFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-success" />
            <p className="font-medium">Tudo em dia!</p>
            <p className="text-xs mt-1">Nenhum insight pendente nesta categoria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InsightCard({
  insight,
  isNew,
  onOpenProcesso,
  onResolve,
  onAskAi,
  index,
}: {
  key?: React.Key;
  insight: InsightProativo;
  isNew: boolean;
  onOpenProcesso: () => void;
  onResolve: () => void;
  onAskAi: () => void;
  index: number;
}) {
  const sev = severidadeConfig[insight.severidade];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4) }}
      layout
    >
      <Card className={cn("overflow-hidden hover:shadow-elevated transition-all", sev.border, isNew && "ring-2 ring-primary/20")}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", sev.bg.replace("/10", "").replace("/15", ""))} />
              <Badge variant="outline" className={cn("text-[9px]", sev.color, sev.border)}>
                {sev.label}
              </Badge>
              {isNew && (
                <Badge className="text-[9px] bg-primary text-primary-foreground">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Novo
                </Badge>
              )}
              {insight.prazoDias !== undefined && (
                <Badge variant="outline" className="text-[9px]">
                  <Clock className="h-2.5 w-2.5 mr-0.5" />
                  {insight.prazoDias}d
                </Badge>
              )}
            </div>
          </div>

          <h4 className="text-sm font-semibold leading-tight mb-1.5">{insight.titulo}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{insight.descricao}</p>

          {(insight.clienteNome || insight.processoNumeroCnj) && (
            <div className="flex items-center gap-2 mb-2 text-[10px] text-muted-foreground">
              {insight.clienteNome && <span>👤 {insight.clienteNome}</span>}
              {insight.processoNumeroCnj && (
                <span className="font-mono">📋 {insight.processoNumeroCnj.slice(0, 16)}...</span>
              )}
            </div>
          )}

          {/* Ação sugerida */}
          <div className={cn("rounded-lg border p-2.5 mb-3", sev.bg, sev.border)}>
            <div className="flex items-start gap-1.5">
              <Zap className={cn("h-3 w-3 shrink-0 mt-0.5", sev.color)} />
              <div>
                <p className={cn("text-[10px] uppercase tracking-widest font-semibold mb-0.5", sev.color)}>
                  Ação sugerida
                </p>
                <p className="text-xs leading-snug">{insight.acaoSugerida}</p>
              </div>
            </div>
          </div>

          {/* Métricas */}
          {(insight.impactoFinanceiro || insight.probabilidadeSucesso) && (
            <div className="flex items-center gap-3 mb-3 text-xs">
              {insight.impactoFinanceiro !== undefined && (
                <div>
                  <span className="text-muted-foreground">Impacto: </span>
                  <span className="font-semibold">{formatCurrency(insight.impactoFinanceiro)}</span>
                </div>
              )}
              {insight.probabilidadeSucesso !== undefined && (
                <div>
                  <span className="text-muted-foreground">Prob. êxito: </span>
                  <span className="font-semibold text-primary">{insight.probabilidadeSucesso}%</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {insight.processoId && (
              <Button variant="outline" size="sm" className="gap-1 text-xs h-7" onClick={onOpenProcesso}>
                Abrir processo <ChevronRight className="h-3 w-3" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={onAskAi}>
              <Sparkles className="h-3 w-3" /> Detalhar com IA
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto gap-1 text-xs h-7 text-success"
              onClick={onResolve}
            >
              <CheckCircle2 className="h-3 w-3" /> Resolver
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
