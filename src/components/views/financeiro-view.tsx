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
  PlusCircle,
  MinusCircle,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Check,
  Building2,
  Tag,
  Repeat,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import {
  contratosHonorarios,
  fluxoCaixaMensal,
} from "@/lib/seed-data";
import { formatCurrency } from "@/lib/format";
import { format, parseISO, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FinanceiroSkeleton } from "@/components/skeleton";
import type { LancamentoFinanceiro, LancamentoTipo, LancamentoStatus } from "@/lib/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  Pago: { color: "text-success", bg: "border-success/40 bg-success/5 text-success", label: "Pago" },
  Pendente: { color: "text-warning", bg: "border-warning/40 bg-warning/5 text-warning", label: "Pendente" },
  Atrasado: { color: "text-destructive", bg: "border-destructive/40 bg-destructive/5 text-destructive", label: "Atrasado" },
  Agendado: { color: "text-info", bg: "border-info/40 bg-info/5 text-info", label: "Agendado" },
};

const CATEGORIAS_RECEITA = [
  "Honorários Contratuais",
  "Honorários de Sucesso",
  "Honorários Sucumbenciais",
  "Consultoria Jurídica",
  "Acordo Extrajudicial",
  "Outras Receitas",
];

const CATEGORIAS_DESPESA = [
  "Custas Judiciais",
  "Honorários Periciais",
  "Aluguel & Condomínio",
  "Softwares & TI",
  "Pessoal & Folha",
  "Impostos & Taxas",
  "Marketing & Publicidade",
  "Material de Escritório",
  "Outras Despesas",
];

export function FinanceiroView() {
  const {
    lancamentos: storeLancamentos,
    addLancamento,
    removeLancamento,
    updateLancamentoStatus,
    clientes,
    processos,
  } = useAppStore();

  const [filtro, setFiltro] = React.useState<"todos" | LancamentoTipo>("todos");
  const [statusFiltro, setStatusFiltro] = React.useState("todos");
  const [loading, setLoading] = React.useState(false);

  // Modal State
  const [showModal, setShowModal] = React.useState(false);
  const [defaultTipoModal, setDefaultTipoModal] = React.useState<LancamentoTipo>("Receita");

  // Confirm delete modal state
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const lancamentos = React.useMemo(() => {
    return storeLancamentos
      .filter((l) => filtro === "todos" || l.tipo === filtro)
      .filter((l) => statusFiltro === "todos" || l.status === statusFiltro)
      .sort((a, b) => new Date(b.dataVencimento).getTime() - new Date(a.dataVencimento).getTime());
  }, [storeLancamentos, filtro, statusFiltro]);

  // Stats dynamically calculated from store
  const totalReceber = storeLancamentos
    .filter((l) => (l.tipo === "Receita" || l.tipo === "Honorário") && (l.status === "Pendente" || l.status === "Agendado" || l.status === "Atrasado"))
    .reduce((acc, l) => acc + l.valor, 0);

  const totalPagar = storeLancamentos
    .filter((l) => (l.tipo === "Despesa" || l.tipo === "Custa") && (l.status === "Pendente" || l.status === "Atrasado"))
    .reduce((acc, l) => acc + l.valor, 0);

  const recebidoMes = storeLancamentos
    .filter((l) => l.status === "Pago" && (l.tipo === "Receita" || l.tipo === "Honorário"))
    .reduce((acc, l) => acc + l.valor, 0);

  const inadimplencia = storeLancamentos
    .filter((l) => l.status === "Atrasado")
    .reduce((acc, l) => acc + l.valor, 0);

  // Distribuição por tipo
  const distribuicaoTipo = React.useMemo(() => {
    const grupos: Record<string, number> = {};
    storeLancamentos.forEach((l) => {
      grupos[l.tipo] = (grupos[l.tipo] || 0) + l.valor;
    });
    return Object.entries(grupos).map(([tipo, valor]) => ({
      tipo,
      valor,
      fill: tipo === "Honorário" ? "var(--primary)" : tipo === "Receita" ? "var(--chart-2)" : tipo === "Despesa" ? "var(--chart-4)" : "var(--chart-5)",
    }));
  }, [storeLancamentos]);

  function handleOpenModal(tipo: LancamentoTipo = "Receita") {
    setDefaultTipoModal(tipo);
    setShowModal(true);
  }

  async function handleMarkPaid(id: string, descricao: string) {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      await updateLancamentoStatus(id, "Pago", hoje);
      toast.success(`Lançamento "${descricao}" marcado como Pago!`);
    } catch {
      toast.error("Erro ao atualizar lançamento");
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingId) return;
    try {
      await removeLancamento(deletingId);
      toast.success("Lançamento excluído com sucesso!");
    } catch {
      toast.error("Erro ao excluir lançamento");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <FinanceiroSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Módulo Financeiro
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestão simplificada de entradas, saídas, honorários advocatícios e fluxo de caixa.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs text-xs font-semibold"
            onClick={() => handleOpenModal("Receita")}
          >
            <Plus className="h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="A Receber"
          value={formatCurrency(totalReceber)}
          trend={`${storeLancamentos.filter((l) => (l.status === "Pendente" || l.status === "Agendado") && (l.tipo === "Receita" || l.tipo === "Honorário")).length} a receber`}
          trendUp
          color="success"
        />
        <StatCard
          icon={TrendingDown}
          label="A Pagar"
          value={formatCurrency(totalPagar)}
          trend={`${storeLancamentos.filter((l) => (l.status === "Pendente" || l.status === "Agendado") && (l.tipo === "Despesa" || l.tipo === "Custa")).length} a pagar`}
          trendUp={false}
          color="destructive"
        />
        <StatCard
          icon={Wallet}
          label="Recebido (mês)"
          value={formatCurrency(recebidoMes)}
          trend="Valores quitados"
          trendUp
          color="primary"
        />
        <StatCard
          icon={AlertCircle}
          label="Inadimplência"
          value={formatCurrency(inadimplencia)}
          trend={`${storeLancamentos.filter((l) => l.status === "Atrasado").length} em atraso`}
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
              <CardDescription className="text-xs">Receita vs Despesa — Visão consolidada</CardDescription>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <span>Lançamentos Financeiros</span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {lancamentos.length}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">Histórico completo de receitas e despesas</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => handleOpenModal("Receita")}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Novo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[520px] overflow-y-auto divide-y">
              {lancamentos.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Nenhum lançamento encontrado</p>
                  <p className="text-xs text-muted-foreground">Clique em "Novo Lançamento" para cadastrar um novo valor de receita ou despesa.</p>
                  <Button size="sm" className="mt-2 text-xs gap-1.5" onClick={() => handleOpenModal("Receita")}>
                    <Plus className="h-3.5 w-3.5" /> Novo Lançamento
                  </Button>
                </div>
              ) : (
                lancamentos.map((l) => {
                  const stCfg = statusConfig[l.status] || statusConfig.Pendente;
                  const date = safeParseDate(l.dataVencimento);
                  const isReceita = l.tipo === "Receita" || l.tipo === "Honorário";
                  return (
                    <div key={l.id} className="p-3.5 hover:bg-accent/30 transition-colors group">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                            isReceita ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {isReceita ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold leading-tight">{l.descricao}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p
                                className={cn(
                                  "text-sm font-bold tabular-nums",
                                  isReceita ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                                )}
                              >
                                {isReceita ? "+" : "−"} {formatCurrency(l.valor)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs font-normal",
                                l.tipo === "Receita" && "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
                                l.tipo === "Despesa" && "border-destructive/30 bg-destructive/5 text-destructive",
                                l.tipo === "Honorário" && "border-primary/30 bg-primary/5 text-primary",
                                l.tipo === "Custa" && "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300"
                              )}
                            >
                              {l.tipo}
                            </Badge>
                            <span className="font-medium">{l.categoria}</span>
                            {l.clienteNome && <span>· {l.clienteNome}</span>}
                            {l.processoNumeroCnj && (
                              <span className="font-mono text-[11px] text-muted-foreground">({l.processoNumeroCnj.split("-")[0]})</span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 border-t border-border/40">
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                Venc: {date ? format(date, "dd/MM/yyyy") : l.dataVencimento}
                              </span>
                              <Badge variant="outline" className={cn("text-xs font-medium px-1.5 py-0", stCfg.bg)}>
                                {l.status === "Pago" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                {l.status === "Pendente" && <Clock className="h-3 w-3 mr-1" />}
                                {l.status === "Atrasado" && <AlertCircle className="h-3 w-3 mr-1" />}
                                {l.status}
                              </Badge>
                              {l.formaPagamento && (
                                <Badge variant="secondary" className="text-xs font-normal">{l.formaPagamento}</Badge>
                              )}
                              {l.recorrente && (
                                <Badge variant="outline" className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                                  <Repeat className="h-2.5 w-2.5" /> Recorrente
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                              {l.status !== "Pago" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 px-2 gap-1"
                                  onClick={() => handleMarkPaid(l.id, l.descricao)}
                                  title="Marcar lançamento como Pago"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Pagar
                                </Button>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeletingId(l.id)}
                                title="Excluir lançamento"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
            <CardDescription className="text-xs">{contratosHonorarios.length} contratos ativos no escritório</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[520px] overflow-y-auto divide-y">
              {contratosHonorarios.map((c) => (
                <div key={c.id} className="p-3.5 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold leading-tight">{c.clienteNome}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs shrink-0 font-normal",
                        c.status === "Ativo" && "border-emerald-500/40 text-emerald-600 bg-emerald-500/10"
                      )}
                    >
                      {c.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Badge variant="secondary" className="text-xs">{c.tipo}</Badge>
                    {c.percentualSucesso && (
                      <Badge variant="outline" className="text-xs">{c.percentualSucesso}% sucesso</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Valor base</p>
                      <p className="font-semibold tabular-nums">{formatCurrency(c.valorBase)}</p>
                    </div>
                    {c.valorProximaParcela && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Próx. parcela</p>
                        <p className="font-semibold tabular-nums text-primary">{formatCurrency(c.valorProximaParcela)}</p>
                      </div>
                    )}
                  </div>
                  {c.proximoVencimento && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Vencimento: {format(parseISO(c.proximoVencimento), "dd/MM/yyyy")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal: Novo Lançamento Financeiro */}
      <NovoLancamentoModal
        open={showModal}
        onOpenChange={setShowModal}
        defaultTipo={defaultTipoModal}
        clientes={clientes}
        processos={processos}
        onSave={addLancamento}
      />

      {/* Modal Confirm Delete */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 text-base">
              <Trash2 className="h-5 w-5" />
              Excluir Lançamento
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Tem certeza que deseja remover este lançamento financeiro? Esta ação atualizará o saldo e o histórico do escritório.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm}>
              Sim, Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              color === "success" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              color === "warning" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
              color === "destructive" && "bg-destructive/10 text-destructive"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className={cn("text-[11px] font-medium", trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
            {trendUp ? <ArrowUpRight className="h-3 w-3 inline" /> : <ArrowDownRight className="h-3 w-3 inline" />}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold tabular-nums tracking-tight">{value}</p>
        <p className={cn("text-[11px]", trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>{trend}</p>
      </CardContent>
    </Card>
  );
}

function safeParseDate(str: string): Date | null {
  try {
    if (!str) return null;
    const d = parseISO(str);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

// ============================================================================
// Modal Form: Novo Lançamento Financeiro (Receita / Despesa / Honorário / Custa)
// ============================================================================

interface NovoLancamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTipo: LancamentoTipo;
  clientes: any[];
  processos: any[];
  onSave: (lancamento: LancamentoFinanceiro) => Promise<void>;
}

function NovoLancamentoModal({
  open,
  onOpenChange,
  defaultTipo,
  clientes,
  processos,
  onSave,
}: NovoLancamentoModalProps) {
  const [tipo, setTipo] = React.useState<LancamentoTipo>(defaultTipo);
  const [descricao, setDescricao] = React.useState("");
  const [valor, setValor] = React.useState("");
  const [dataVencimento, setDataVencimento] = React.useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = React.useState<LancamentoStatus>("Pendente");
  const [dataPagamento, setDataPagamento] = React.useState(new Date().toISOString().split("T")[0]);
  const [categoria, setCategoria] = React.useState("");
  const [clienteId, setClienteId] = React.useState("nenhum");
  const [processoId, setProcessoId] = React.useState("nenhum");
  const [formaPagamento, setFormaPagamento] = React.useState<"Boleto" | "PIX" | "Transferência" | "Cartão" | "Dinheiro">("PIX");
  const [recorrente, setRecorrente] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Sync defaultTipo when modal opens or prop changes
  React.useEffect(() => {
    if (open) {
      setTipo(defaultTipo);
      setCategoria(defaultTipo === "Despesa" || defaultTipo === "Custa" ? CATEGORIAS_DESPESA[0] : CATEGORIAS_RECEITA[0]);
    }
  }, [open, defaultTipo]);

  // Update default categories when type changes
  const handleTipoChange = (newTipo: LancamentoTipo) => {
    setTipo(newTipo);
    if (newTipo === "Despesa" || newTipo === "Custa") {
      setCategoria(CATEGORIAS_DESPESA[0]);
    } else {
      setCategoria(CATEGORIAS_RECEITA[0]);
    }
  };

  const categoriasAtuais = (tipo === "Despesa" || tipo === "Custa") ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!descricao.trim()) {
      toast.error("Informe a descrição do lançamento.");
      return;
    }

    const numericValor = parseFloat(valor.replace(",", "."));
    if (isNaN(numericValor) || numericValor <= 0) {
      toast.error("Informe um valor maior que R$ 0,00.");
      return;
    }

    if (!dataVencimento) {
      toast.error("Informe a data de vencimento.");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCliente = clientes.find((c) => c.id === clienteId);
      const selectedProcesso = processos.find((p) => p.id === processoId);

      const novoLancamento: LancamentoFinanceiro = {
        id: `lf-${Date.now()}`,
        tipo,
        descricao: descricao.trim(),
        valor: numericValor,
        dataVencimento,
        status,
        dataPagamento: status === "Pago" ? (dataPagamento || dataVencimento) : undefined,
        categoria: categoria || (tipo === "Despesa" ? "Outras Despesas" : "Outras Receitas"),
        clienteId: clienteId !== "nenhum" ? clienteId : undefined,
        clienteNome: selectedCliente ? selectedCliente.nome : undefined,
        processoId: processoId !== "nenhum" ? processoId : undefined,
        processoNumeroCnj: selectedProcesso ? selectedProcesso.numeroCnj : undefined,
        formaPagamento,
        recorrente,
      };

      await onSave(novoLancamento);

      toast.success(
        `${tipo === "Despesa" ? "Despesa" : "Receita"} de ${formatCurrency(numericValor)} lançada com sucesso!`,
        { description: descricao.trim() }
      );

      // Reset form
      setDescricao("");
      setValor("");
      setStatus("Pendente");
      setClienteId("nenhum");
      setProcessoId("nenhum");
      setRecorrente(false);
      onOpenChange(false);
    } catch (err) {
      toast.error("Erro ao salvar lançamento.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            {tipo === "Receita" || tipo === "Honorário" ? (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <PlusCircle className="h-4 w-4" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <MinusCircle className="h-4 w-4" />
              </div>
            )}
            Lançar Novo Valor Financeiro
          </DialogTitle>
          <DialogDescription className="text-xs">
            Cadastre uma receita, honorário, despesa ou custa judicial no caixa do escritório.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Selector de Tipo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tipo de Lançamento</Label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-muted rounded-lg">
              {(["Receita", "Despesa", "Honorário", "Custa"] as LancamentoTipo[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTipoChange(t)}
                  className={cn(
                    "py-1.5 px-2 rounded-md text-xs font-semibold transition-all text-center",
                    tipo === t
                      ? t === "Receita"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : t === "Despesa"
                        ? "bg-destructive text-white shadow-xs"
                        : t === "Honorário"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-amber-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Descrição e Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="descricao" className="text-xs font-semibold">
                Descrição <span className="text-destructive">*</span>
              </Label>
              <Input
                id="descricao"
                placeholder={
                  tipo === "Despesa"
                    ? "Ex: Custas processuais, aluguel, software"
                    : "Ex: Honorários iniciais, consulta, acordo"
                }
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="valor" className="text-xs font-semibold">
                Valor (R$) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Categoria e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecione categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriasAtuais.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status do Pagamento</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as LancamentoStatus)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente" className="text-xs">Pendente</SelectItem>
                  <SelectItem value="Pago" className="text-xs">Pago (Quitado)</SelectItem>
                  <SelectItem value="Agendado" className="text-xs">Agendado</SelectItem>
                  <SelectItem value="Atrasado" className="text-xs">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dataVencimento" className="text-xs font-semibold">
                Data de Vencimento <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dataVencimento"
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            {status === "Pago" && (
              <div className="space-y-1.5">
                <Label htmlFor="dataPagamento" className="text-xs font-semibold">
                  Data de Pagamento
                </Label>
                <Input
                  id="dataPagamento"
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Forma de Pagamento</Label>
              <Select value={formaPagamento} onValueChange={(v: any) => setFormaPagamento(v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX" className="text-xs">PIX</SelectItem>
                  <SelectItem value="Boleto" className="text-xs">Boleto Bancário</SelectItem>
                  <SelectItem value="Transferência" className="text-xs">Transferência (TED/DOC)</SelectItem>
                  <SelectItem value="Cartão" className="text-xs">Cartão de Crédito/Débito</SelectItem>
                  <SelectItem value="Dinheiro" className="text-xs">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vinculação: Cliente e Processo (opcional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-border/60 pt-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Cliente Vinculado (Opcional)
              </Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Nenhum cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum" className="text-xs">Nenhum cliente</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Processo Vinculado (Opcional)
              </Label>
              <Select value={processoId} onValueChange={setProcessoId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Nenhum processo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum" className="text-xs">Nenhum processo</SelectItem>
                  {processos.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.numeroCnj ? `${p.numeroCnj.split("-")[0]} — ${p.clienteNome || p.assunto || ""}` : p.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkbox Recorrente */}
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="recorrente"
              checked={recorrente}
              onCheckedChange={(checked) => setRecorrente(!!checked)}
            />
            <Label htmlFor="recorrente" className="text-xs cursor-pointer font-medium">
              Lançamento Recorrente (Cobrança/Pagamento Mensal)
            </Label>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className={cn(
                "gap-1.5 font-semibold",
                tipo === "Despesa" ? "bg-destructive hover:bg-destructive/90 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
              )}
            >
              {isSubmitting ? "Salvando..." : tipo === "Despesa" ? "Lançar Despesa" : "Lançar Receita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
