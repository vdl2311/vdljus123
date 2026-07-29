"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  CreditCard,
  Receipt,
  FileText,
  Plus,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import {
  lancamentosFinanceiros,
  contratosHonorarios,
  fluxoCaixaMensal,
} from "@/lib/seed-data";
import { formatCurrency, formatCurrencyDetailed } from "@/lib/format";
import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FinanceiroSkeleton } from "@/components/skeleton";
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

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  Pago: { color: "text-success", bg: "border-success/40 bg-success/5", label: "Pago" },
  Pendente: { color: "text-warning", bg: "border-warning/40 bg-warning/5", label: "Pendente" },
  Atrasado: { color: "text-destructive", bg: "border-destructive/40 bg-destructive/5", label: "Atrasado" },
  Agendado: { color: "text-info", bg: "border-info/40 bg-info/5", label: "Agendado" },
};

export function FinanceiroView() {
  const [filtro, setFiltro] = React.useState<"todos" | "Receita" | "Despesa" | "Honorário" | "Custa">("todos");
  const [statusFiltro, setStatusFiltro] = React.useState("todos");
  const [loading, setLoading] = React.useState(false);

  const lancamentos = React.useMemo(() => {
    return lancamentosFinanceiros
      .filter((l) => filtro === "todos" || l.tipo === filtro)
      .filter((l) => statusFiltro === "todos" || l.status === statusFiltro)
      .sort((a, b) => new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime());
  }, [filtro, statusFiltro]);

  // Stats
  const totalReceber = lancamentosFinanceiros
    .filter((l) => (l.tipo === "Receita" || l.tipo === "Honorário") && (l.status === "Pendente" || l.status === "Agendado" || l.status === "Atrasado"))
    .reduce((acc, l) => acc + l.valor, 0);

  const totalPagar = lancamentosFinanceiros
    .filter((l) => (l.tipo === "Despesa" || l.tipo === "Custa") && (l.status === "Pendente" || l.status === "Atrasado"))
    .reduce((acc, l) => acc + l.valor, 0);

  const recebidoMes = lancamentosFinanceiros
    .filter((l) => l.status === "Pago" && (l.tipo === "Receita" || l.tipo === "Honorário"))
    .reduce((acc, l) => acc + l.valor, 0);

  const inadimplencia = lancamentosFinanceiros
    .filter((l) => l.status === "Atrasado")
    .reduce((acc, l) => acc + l.valor, 0);

  // Distribuição por tipo
  const distribuicaoTipo = (() => {
    const grupos: Record<string, number> = {};
    lancamentosFinanceiros.forEach((l) => {
      grupos[l.tipo] = (grupos[l.tipo] || 0) + l.valor;
    });
    return Object.entries(grupos).map(([tipo, valor]) => ({
      tipo,
      valor,
      fill: tipo === "Honorário" ? "var(--primary)" : tipo === "Receita" ? "var(--chart-2)" : tipo === "Despesa" ? "var(--chart-4)" : "var(--chart-5)",
    }));
  })();

  if (loading) {
    return <FinanceiroSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="A Receber"
          value={formatCurrency(totalReceber)}
          trend={`${lancamentosFinanceiros.filter((l) => l.status === "Pendente" && (l.tipo === "Receita" || l.tipo === "Honorário")).length} lançamentos`}
          trendUp
          color="success"
        />
        <StatCard
          icon={TrendingDown}
          label="A Pagar"
          value={formatCurrency(totalPagar)}
          trend={`${lancamentosFinanceiros.filter((l) => l.status === "Pendente" && (l.tipo === "Despesa" || l.tipo === "Custa")).length} lançamentos`}
          trendUp={false}
          color="destructive"
        />
        <StatCard
          icon={Wallet}
          label="Recebido (mês)"
          value={formatCurrency(recebidoMes)}
          trend="+12% vs Jun"
          trendUp
          color="primary"
        />
        <StatCard
          icon={AlertCircle}
          label="Inadimplência"
          value={formatCurrency(inadimplencia)}
          trend="Acima da meta 5%"
          trendUp={false}
          color="warning"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Fluxo de caixa */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Fluxo de Caixa</CardTitle>
              <CardDescription className="text-xs">Receita vs Despesa — 6 meses</CardDescription>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Receita
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-chart-4" /> Despesa
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fluxoCaixaMensal} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-4)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-4)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v / 1000}k`}
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
                  <Area type="monotone" dataKey="receita" stroke="var(--primary)" strokeWidth={2} fill="url(#colorReceita)" />
                  <Area type="monotone" dataKey="despesa" stroke="var(--chart-4)" strokeWidth={2} fill="url(#colorDespesa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por tipo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Distribuição</CardTitle>
            <CardDescription className="text-xs">Por tipo de lançamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribuicaoTipo}
                    dataKey="valor"
                    nameKey="tipo"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {distribuicaoTipo.map((entry, i) => (
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
                    formatter={(v: number) => formatCurrency(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-3">
              {distribuicaoTipo.map((d) => (
                <div key={d.tipo} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                  <span className="text-muted-foreground flex-1">{d.tipo}</span>
                  <span className="font-medium tabular-nums">{formatCurrency(d.valor)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lançamentos e Contratos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lançamentos */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Lançamentos</CardTitle>
                <CardDescription className="text-xs">{lancamentos.length} lançamento(s)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={filtro} onValueChange={(v) => setFiltro(v as any)}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <Filter className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos tipos</SelectItem>
                    <SelectItem value="Receita">Receita</SelectItem>
                    <SelectItem value="Despesa">Despesa</SelectItem>
                    <SelectItem value="Honorário">Honorário</SelectItem>
                    <SelectItem value="Custa">Custa</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos status</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Atrasado">Atrasado</SelectItem>
                    <SelectItem value="Agendado">Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto divide-y">
              {lancamentos.map((l) => {
                const stCfg = statusConfig[l.status];
                const date = parseISO(l.dataVencimento);
                const dias = differenceInDays(date, new Date(2026, 6, 27));
                const isReceita = l.tipo === "Receita" || l.tipo === "Honorário";
                return (
                  <div key={l.id} className="p-3 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                          isReceita ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {isReceita ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">{l.descricao}</p>
                          <p
                            className={cn(
                              "text-sm font-bold tabular-nums shrink-0",
                              isReceita ? "text-success" : "text-destructive"
                            )}
                          >
                            {isReceita ? "+" : "−"} {formatCurrency(l.valor)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <Badge variant="outline" className="text-[9px]">{l.tipo}</Badge>
                          <span>{l.categoria}</span>
                          {l.clienteNome && <span>· {l.clienteNome}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-2.5 w-2.5" />
                            {format(date, "dd/MM/yyyy")}
                          </span>
                          <Badge variant="outline" className={cn("text-[9px]", stCfg.bg, stCfg.color, "border-current/30")}>
                            {l.status === "Pago" && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                            {l.status === "Pendente" && <Clock className="h-2.5 w-2.5 mr-0.5" />}
                            {l.status === "Atrasado" && <AlertCircle className="h-2.5 w-2.5 mr-0.5" />}
                            {l.status} {l.status === "Pendente" && dias < 0 && `(${Math.abs(dias)}d)`}
                          </Badge>
                          {l.formaPagamento && (
                            <Badge variant="outline" className="text-[9px]">{l.formaPagamento}</Badge>
                          )}
                          {l.recorrente && (
                            <Badge variant="outline" className="text-[9px]">Recorrente</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contratos de honorários */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              Contratos de Honorários
            </CardTitle>
            <CardDescription className="text-xs">{contratosHonorarios.length} ativos</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto divide-y">
              {contratosHonorarios.map((c) => (
                <div key={c.id} className="p-3 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium leading-tight">{c.clienteNome}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] shrink-0",
                        c.status === "Ativo" && "border-success/40 text-success"
                      )}
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Badge variant="secondary" className="text-[9px]">{c.tipo}</Badge>
                    {c.percentualSucesso && (
                      <Badge variant="outline" className="text-[9px]">{c.percentualSucesso}% sucesso</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Valor base</p>
                      <p className="font-medium tabular-nums">{formatCurrency(c.valorBase)}</p>
                    </div>
                    {c.valorProximaParcela && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Próx. parcela</p>
                        <p className="font-medium tabular-nums text-primary">{formatCurrency(c.valorProximaParcela)}</p>
                      </div>
                    )}
                  </div>
                  {c.proximoVencimento && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <Calendar className="h-2.5 w-2.5" />
                      Venc: {format(parseISO(c.proximoVencimento), "dd/MM/yyyy")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
  color: "primary" | "success" | "warning" | "destructive";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              color === "primary" && "bg-primary/10 text-primary",
              color === "success" && "bg-success/10 text-success",
              color === "warning" && "bg-warning/15 text-warning",
              color === "destructive" && "bg-destructive/10 text-destructive"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className={cn("text-[11px] font-medium", trendUp ? "text-success" : "text-destructive")}>
            {trendUp ? <ArrowUpRight className="h-3 w-3 inline" /> : <ArrowDownRight className="h-3 w-3 inline" />}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold tabular-nums tracking-tight">{value}</p>
        <p className={cn("text-[11px]", trendUp ? "text-success" : "text-destructive")}>{trend}</p>
      </CardContent>
    </Card>
  );
}
