"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  FolderKanban,
  Users,
  DollarSign,
  Activity,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Zap,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/lib/store";
import {
  escritorioStats,
  faturamentoMensal,
  produtividadeSemanal,
  eventosAgenda,
} from "@/lib/seed-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { formatCurrency, safeDate, formatDateSafe } from "@/lib/format";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const { processos, tarefas, clientes, inbox, setView, openProcesso, setAiPanelOpen } = useAppStore();

  const processosPrioritarios = React.useMemo(() => {
    return [...(processos || [])]
      .filter((p) => p && (p.status === "Ativo" || p.status === "Em Recurso"))
      .sort((a, b) => {
        const aDate = safeDate(a.datasImportantes?.prazoFatal)?.getTime() || Infinity;
        const bDate = safeDate(b.datasImportantes?.prazoFatal)?.getTime() || Infinity;
        return aDate - bDate;
      })
      .slice(0, 4);
  }, [processos]);

  const tarefasUrgentes = React.useMemo(() => {
    return [...(tarefas || [])]
      .filter((t) => t && t.status !== "Concluído")
      .sort((a, b) => {
        const aDate = safeDate(a.dataLimite)?.getTime() || Infinity;
        const bDate = safeDate(b.dataLimite)?.getTime() || Infinity;
        return aDate - bDate;
      })
      .slice(0, 5);
  }, [tarefas]);

  const inboxNaoLidos = (inbox || []).filter((i) => i && !i.lido && !i.arquivado).slice(0, 4);
  const agendaProximos = eventosAgenda.slice(0, 5);

  const processosAtivosCount = (processos || []).filter(p => p && (p.status === "Ativo" || p.status === "Em Recurso")).length;
  const clientesAtivosCount = (clientes || []).filter(c => c && (c.status === "Ativo" || c.status === "Potencial")).length;
  const prazosProximos7DiasCount = (tarefas || []).filter(t => {
    if (!t || t.status === "Concluído") return false;
    const d = safeDate(t.dataLimite);
    if (!d) return false;
    const diff = differenceInDays(d, new Date());
    return diff >= 0 && diff <= 7;
  }).length;

  const processosPorAreaComputed = React.useMemo(() => {
    const counts = (processos || []).reduce((acc, p) => {
      if (!p) return acc;
      const area = p.area || "Outros";
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([area, quantidade], idx) => ({
        area,
        quantidade,
        fill: colors[idx % colors.length]
      }));
  }, [processos]);

  return (
    <div className="space-y-6">
      {/* Hero central de inteligência */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-card to-chart-2/5">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <CardContent className="relative p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/15">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Central de Inteligência
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold leading-tight">
                  Você tem <span className="text-primary">{prazosProximos7DiasCount} prazo{prazosProximos7DiasCount !== 1 ? 's' : ''} nos próximos 7 dias</span> e{" "}
                  <span className="text-primary">{inboxNaoLidos.length} notificaç{inboxNaoLidos.length !== 1 ? 'ões' : 'ão'}</span> na caixa de entrada.
                </h2>
                <p className="text-sm text-muted-foreground">
                  Recomendo priorizar o processo <strong>TechNova x CloudProvider</strong> (contrarrazões em 16 dias) e
                  preparar o dossiê da audiência <strong>Ricardo Souza</strong> (30/07).
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" onClick={() => setAiPanelOpen(true)} className="gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Abrir Copiloto
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setView("inbox")}>
                    Ver Inbox Jurídico
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setView("busca")}>
                    Busca Inteligente
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex shrink-0 flex-col items-center gap-2 rounded-2xl bg-card/80 border border-primary/15 p-4 min-w-[160px]">
                <div className="text-3xl font-bold text-gradient-primary tabular-nums">
                  {escritorioStats.produtividade}%
                </div>
                <p className="text-xs text-muted-foreground text-center">Produtividade da semana</p>
                <div className="flex items-center gap-1 text-xs text-success">
                  <TrendingUp className="h-3 w-3" /> +6% vs sem. anterior
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Processos Ativos"
          value={processosAtivosCount.toString()}
          trend="+3 este mês"
          trendUp
          color="primary"
          onClick={() => setView("processos")}
        />
        <StatCard
          icon={Users}
          label="Clientes Ativos"
          value={clientesAtivosCount.toString()}
          trend="+2 este mês"
          trendUp
          color="chart-2"
          onClick={() => setView("clientes")}
        />
        <StatCard
          icon={Clock}
          label="Prazos 7 dias"
          value={prazosProximos7DiasCount.toString()}
          trend={`${prazosProximos7DiasCount} urgentes`}
          trendUp={false}
          color="destructive"
          onClick={() => setView("tarefas")}
        />
        <StatCard
          icon={DollarSign}
          label="Faturado (mês)"
          value={formatCurrency(escritorioStats.faturamentoMes)}
          trend="+12,4% vs Jun"
          trendUp
          color="success"
        />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Faturamento chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Faturamento & Recebimento</CardTitle>
              <CardDescription className="text-xs">Últimos 6 meses</CardDescription>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Faturado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-chart-2" /> Recebido
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={faturamentoMensal} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="colorFaturado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRecebido" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `R$ ${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Area
                    type="monotone"
                    dataKey="faturado"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#colorFaturado)"
                  />
                  <Area
                    type="monotone"
                    dataKey="recebido"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    fill="url(#colorRecebido)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Processos por área */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Processos por Área</CardTitle>
            <CardDescription className="text-xs">Distribuição atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processosPorAreaComputed}
                    dataKey="quantidade"
                    nameKey="area"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {processosPorAreaComputed.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-3">
              {processosPorAreaComputed.slice(0, 4).map((p) => (
                <div key={p.area} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: p.fill }}
                  />
                  <span className="text-muted-foreground truncate">{p.area}</span>
                  <span className="ml-auto font-medium tabular-nums">{p.quantidade}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Processos prioritários + Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Processos Prioritários</CardTitle>
              <CardDescription className="text-xs">Ordenados por proximidade do prazo</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setView("processos")} className="text-xs gap-1">
              Ver todos <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {processosPrioritarios.map((p) => {
                const prazoFatalDate = safeDate(p.datasImportantes?.prazoFatal);
                const diasPrazo = prazoFatalDate ? differenceInDays(prazoFatalDate, new Date()) : null;
                return (
                  <button
                    key={p.id}
                    onClick={() => openProcesso(p.id)}
                    className="w-full flex items-start gap-3 p-4 hover:bg-accent/40 transition-colors text-left"
                  >
                    <div
                      className={cn(
                        "mt-1 h-9 w-9 shrink-0 rounded-lg flex items-center justify-center font-semibold text-xs",
                        p.risco === "Alto" && "bg-destructive/10 text-destructive",
                        p.risco === "Médio" && "bg-warning/15 text-warning",
                        p.risco === "Baixo" && "bg-success/10 text-success"
                      )}
                    >
                      {(p.area || "Cível").slice(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {p.clienteNome}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {p.numeroCnj} · {p.tribunal}
                          </p>
                        </div>
                        {diasPrazo !== null && (
                          <Badge
                            variant={diasPrazo <= 7 ? "destructive" : "secondary"}
                            className="shrink-0 text-xs"
                          >
                            <Clock className="h-3 w-3 mr-0.5" />
                            {diasPrazo}d
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="text-xs">
                          {p.area}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {p.assunto}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Agenda */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Agenda
              </CardTitle>
              <CardDescription className="text-xs">Próximos compromissos</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              Ver tudo <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px]">
              <div className="divide-y">
                {agendaProximos.map((e) => {
                  const date = new Date(`${e.data}T${e.hora}:00`);
                  const isHoje = isToday(date);
                  const isAmanha = isTomorrow(date);
                  return (
                    <div key={e.id} className="flex gap-3 p-3 hover:bg-accent/40 transition-colors">
                      <div className="flex flex-col items-center justify-center min-w-[44px] py-1">
                        <span className="text-xs uppercase tracking-widest text-muted-foreground">
                          {format(date, "MMM", { locale: ptBR })}
                        </span>
                        <span className="text-lg font-bold leading-none">
                          {format(date, "dd")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{e.titulo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {e.hora} · {e.clienteNome}
                        </p>
                        <Badge
                          variant={isHoje ? "destructive" : isAmanha ? "default" : "outline"}
                          className="mt-1 text-xs"
                        >
                          {isHoje ? "Hoje" : isAmanha ? "Amanhã" : format(date, "EEE", { locale: ptBR })}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Tarefas + Inbox + Produtividade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Tarefas Urgentes</CardTitle>
            <CardDescription className="text-xs">Próximos vencimentos</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px]">
              <div className="divide-y">
                {tarefasUrgentes.map((t) => {
                  const date = safeDate(t.dataLimite) || new Date();
                  const dias = differenceInDays(date, new Date());
                  return (
                    <div key={t.id} className="flex gap-3 p-3 hover:bg-accent/40 transition-colors">
                      <div
                        className={cn(
                          "mt-1 h-2 w-2 rounded-full shrink-0",
                          t.prioridade === "Urgente" && "bg-destructive",
                          t.prioridade === "Alta" && "bg-warning",
                          t.prioridade === "Média" && "bg-info",
                          t.prioridade === "Baixa" && "bg-muted-foreground"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{t.descricao}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {dias < 0 ? (
                            <span className="text-destructive font-medium">
                              {Math.abs(dias)}d em atraso
                            </span>
                          ) : dias === 0 ? (
                            <span className="text-warning font-medium">Hoje</span>
                          ) : (
                            <span>Em {dias} dias · {format(date, "dd/MM", { locale: ptBR })}</span>
                          )}
                          <span className="text-muted-foreground/60">·</span>
                          <span>{t.processoNumeroCnj ? `Proc. ${t.processoNumeroCnj.slice(0, 8)}` : t.categoria}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Inbox não lidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Inbox Jurídico</CardTitle>
              <CardDescription className="text-xs">Triagem IA</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setView("inbox")} className="text-xs gap-1">
              Ver tudo <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px]">
              <div className="divide-y">
                {inboxNaoLidos.map((i) => (
                  <div key={i.id} className="p-3 hover:bg-accent/40 transition-colors">
                    <div className="flex items-start gap-2">
                      <div
                        className={cn(
                          "mt-1 h-2 w-2 rounded-full shrink-0",
                          i.classificacaoIa === "Ação Necessária" && "bg-destructive",
                          i.classificacaoIa === "Importante" && "bg-warning",
                          i.classificacaoIa === "Pode Esperar" && "bg-info"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight line-clamp-1">{i.titulo}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{i.descricao}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Badge variant="outline" className="text-xs">
                            {i.tipo}
                          </Badge>
                          <Badge
                            variant={i.classificacaoIa === "Ação Necessária" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                            {i.classificacaoIa}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Produtividade semanal */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Produtividade Semanal
            </CardTitle>
            <CardDescription className="text-xs">Tarefas criadas vs concluídas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={produtividadeSemanal} margin={{ top: 8, right: 0, bottom: 0, left: -22 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="dia"
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="tarefas" fill="var(--muted)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="concluidas" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <div>
                  <p className="text-xs font-medium">{escritorioStats.taxaSucesso}%</p>
                  <p className="text-xs text-muted-foreground">Taxa de êxito</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs font-medium">181</p>
                  <p className="text-xs text-muted-foreground">Ações automáticas / mês</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
  color: "primary" | "chart-2" | "destructive" | "success";
  onClick?: () => void;
}

function StatCard({ icon: Icon, label, value, trend, trendUp, color, onClick }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all",
          onClick && "cursor-pointer hover:shadow-elevated hover:border-primary/30"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                color === "primary" && "bg-primary/10 text-primary",
                color === "chart-2" && "bg-chart-2/10 text-chart-2",
                color === "destructive" && "bg-destructive/10 text-destructive",
                color === "success" && "bg-success/10 text-success"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div
              className={cn(
                "flex items-center gap-0.5 text-[11px] font-medium",
                trendUp ? "text-success" : "text-destructive"
              )}
            >
              {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
            <p
              className={cn(
                "text-[11px]",
                trendUp ? "text-success" : "text-destructive"
              )}
            >
              {trend}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
