"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Zap,
  Activity,
  Brain,
  Sparkles,
  Loader2,
  RefreshCw,
  ArrowRight,
  Clock,
  Users,
  FileWarning,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import {
  gargalosEscritorio,
  analisesPreditivas,
} from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

export function EstrategicoView() {
  const { openProcesso, setAiPanelOpen } = useAppStore();
  const [loading, setLoading] = React.useState(false);
  const [insightIA, setInsightIA] = React.useState<string>("");

  const impactoConfig: Record<string, { color: string; bg: string }> = {
    Alto: { color: "text-destructive", bg: "bg-destructive/10" },
    Médio: { color: "text-warning", bg: "bg-warning/15" },
    Baixo: { color: "text-info", bg: "bg-info/10" },
  };

  // Health score do escritório — gap normalizado por gargalo (0 a 1)
  const healthScore = (() => {
    const pesos: Record<string, number> = { Alto: 3, Médio: 2, Baixo: 1 };
    const totalPeso = gargalosEscritorio.reduce((acc, g) => acc + pesos[g.impacto], 0);
    // Gap normalizado: se atual <= meta, gap = 0. Caso contrário, gap = (atual-meta)/atual (limitado a 1)
    const gapPonderado = gargalosEscritorio.reduce((acc, g) => {
      let gap = 0;
      if (g.valorMeta === 0) {
        gap = g.valorAtual > 0 ? 1 : 0;
      } else if (g.valorAtual > g.valorMeta) {
        gap = Math.min(1, (g.valorAtual - g.valorMeta) / g.valorAtual);
      }
      return acc + gap * pesos[g.impacto];
    }, 0);
    const score = 100 - (gapPonderado / Math.max(totalPeso, 1)) * 100;
    return Math.round(Math.max(0, Math.min(100, score)));
  })();

  async function gerarInsight() {
    setLoading(true);
    setInsightIA("");
    try {
      // Reusa a API de copiloto proativo para insight estratégico
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Atue como consultor estratégico para o escritório Vidal & Associados. Analise os gargalos atuais:

${JSON.stringify(gargalosEscritorio, null, 2)}

Gere 3 recomendações estratégicas PRIORITÁRIAS para os próximos 30 dias. Para cada uma, indique: (1) ação, (2) responsável, (3) métrica de sucesso, (4) prazo. Seja específico e acionável.`,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInsightIA(data.content);
      toast.success("Análise estratégica gerada!");
    } catch {
      toast.error("Erro ao gerar análise");
    } finally {
      setLoading(false);
    }
  }

  // Dados para gráfico radial de health score
  const healthData = [{ name: "Saúde", value: healthScore, fill: healthScore >= 70 ? "var(--primary)" : healthScore >= 50 ? "var(--warning)" : "var(--destructive)" }];

  // Dados gargalos para gráfico
  const gargalosData = gargalosEscritorio.map((g) => ({
    name: g.categoria.length > 18 ? g.categoria.slice(0, 18) + "..." : g.categoria,
    atual: g.valorAtual,
    meta: g.valorMeta,
    impacto: g.impacto,
  }));

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-chart-2/5">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <CardContent className="relative p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/15">
                  <Brain className="h-3 w-3 mr-1" />
                  Modo Estratégico
                </Badge>
              </div>
              <h2 className="text-xl md:text-2xl font-bold leading-tight">
                Diagnóstico do escritório: <span className={cn(healthScore >= 70 ? "text-success" : healthScore >= 50 ? "text-warning" : "text-destructive")}>Score {healthScore}/100</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Identifique gargalos operacionais, oportunidades de melhoria e prevê movimentações
                futuras dos processos com IA preditiva.
              </p>
              <Button onClick={gerarInsight} disabled={loading} size="sm" className="gap-1.5">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {loading ? "Analisando..." : "Gerar análise estratégica IA"}
              </Button>
            </div>

            {/* Health Score radial */}
            <div className="shrink-0 relative">
              <div className="h-[140px] w-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="65%"
                    outerRadius="100%"
                    data={healthData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} fill={healthData[0].fill} background={{ fill: "var(--muted)" }} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tabular-nums">{healthScore}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Saúde</span>
              </div>
            </div>
          </div>

          {/* Insight IA */}
          {insightIA && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shrink-0">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="flex-1 overflow-x-auto">
                  <p className="text-xs font-semibold mb-1.5 text-primary uppercase tracking-widest">Análise estratégica IA</p>
                  <div className="text-sm leading-relaxed space-y-2">
                    {insightIA.split("\n").map((line, i) => (
                      <p key={i} className={cn(line.startsWith("**") && "font-semibold")}>
                        {line.replace(/\*\*/g, "")}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Gargalos + gráfico comparativo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista gargalos */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Gargalos Operacionais
            </CardTitle>
            <CardDescription className="text-xs">
              Pontos críticos que reduzem produtividade e lucratividade
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {gargalosEscritorio.map((g, idx) => {
                const cfg = impactoConfig[g.impacto];
                const gap = ((g.valorAtual - g.valorMeta) / Math.max(g.valorMeta, 0.1)) * 100;
                return (
                  <motion.div
                    key={g.categoria}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn("text-xs", cfg.color, cfg.bg, "border-current/30")}>
                            Impacto {g.impacto}
                          </Badge>
                          <p className="text-sm font-semibold">{g.categoria}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{g.descricao}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-2 mt-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">{g.metrica}</p>
                        <p className={cn("text-lg font-bold tabular-nums", cfg.color)}>{g.valorAtual}</p>
                        <p className="text-xs text-muted-foreground">atual</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">&nbsp;</p>
                        <p className="text-lg font-bold tabular-nums text-success">{g.valorMeta}</p>
                        <p className="text-xs text-muted-foreground">meta</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Gap</p>
                        <p className={cn("text-lg font-bold tabular-nums", gap > 0 ? "text-destructive" : "text-success")}>
                          {gap > 0 ? "+" : ""}{gap.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">vs meta</p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 flex items-start gap-1.5">
                      <Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs leading-snug">
                        <span className="font-semibold text-primary">Recomendação: </span>
                        {g.recomendacao}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico comparativo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <Target className="h-4 w-4" />
              Atual vs Meta
            </CardTitle>
            <CardDescription className="text-xs">Quão longe estamos da meta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={gargalosData}
                  layout="vertical"
                  margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="var(--muted-foreground)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="meta" fill="var(--muted)" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="atual" radius={[0, 4, 4, 0]}>
                    {gargalosData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.impacto === "Alto" ? "var(--destructive)" : entry.impacto === "Médio" ? "var(--warning)" : "var(--info)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-3 text-xs mt-2 pt-2 border-t">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded bg-muted" /> Meta
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded bg-destructive" /> Atual
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise Preditiva */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-primary" />
            Análise Preditiva por Processo
          </CardTitle>
          <CardDescription className="text-xs">
            Probabilidade de movimentação em 30 dias e risco de perda de prazo
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {analisesPreditivas.map((a, idx) => (
              <motion.div
                key={a.processoId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">{a.clienteNome}</p>
                        <p className="text-xs text-muted-foreground font-mono">{a.processoNumeroCnj}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 shrink-0 gap-1"
                        onClick={() => openProcesso(a.processoId)}
                      >
                        Abrir <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">{a.recomendacao}</p>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground uppercase tracking-widest">Mov. 30d</span>
                          <span className={cn("font-bold tabular-nums", a.probabilidadeMovimentacao30d >= 70 ? "text-success" : a.probabilidadeMovimentacao30d >= 40 ? "text-warning" : "text-muted-foreground")}>
                            {a.probabilidadeMovimentacao30d}%
                          </span>
                        </div>
                        <Progress value={a.probabilidadeMovimentacao30d} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground uppercase tracking-widest">Risco prazo</span>
                          <span className={cn("font-bold tabular-nums", a.riscoPerdaPrazo >= 50 ? "text-destructive" : a.riscoPerdaPrazo >= 25 ? "text-warning" : "text-success")}>
                            {a.riscoPerdaPrazo}%
                          </span>
                        </div>
                        <Progress value={a.riscoPerdaPrazo} className="h-1.5 [&>div]:bg-destructive" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground uppercase tracking-widest">Sem mov.</span>
                          <span className="font-bold tabular-nums">{a.diasSemMovimentacao}d</span>
                        </div>
                        <Progress value={Math.min(100, (a.diasSemMovimentacao / 30) * 100)} className="h-1.5 [&>div]:bg-info" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações rápidas estratégicas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: "Reduzir SLA movimentações", color: "primary" as const, action: () => setAiPanelOpen(true) },
          { icon: Users, label: "Reativar clientes inativos", color: "chart-2" as const, action: () => toast.info("Listando 4 clientes inativos") },
          { icon: FileWarning, label: "Processar docs pendentes", color: "warning" as const, action: () => toast.info("6 documentos na fila") },
          { icon: DollarSign, label: "Cobrar honorários atrasados", color: "destructive" as const, action: () => toast.info("R$ 8.500 em atraso") },
        ].map((a) => (
          <button
            key={a.label}
            onClick={a.action}
            className="text-left rounded-lg border border-border hover:border-primary/30 hover:shadow-card transition-all p-4 flex flex-col gap-2"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                a.color === "primary" && "bg-primary/10 text-primary",
                a.color === "chart-2" && "bg-chart-2/10 text-chart-2",
                a.color === "warning" && "bg-warning/15 text-warning",
                a.color === "destructive" && "bg-destructive/10 text-destructive"
              )}
            >
              <a.icon className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium leading-tight">{a.label}</p>
            <p className="text-xs text-primary flex items-center gap-0.5">
              Agir agora <ArrowRight className="h-2.5 w-2.5" />
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
