import * as React from "react";
import { useAppStore } from "@/lib/store";
import { AlarmClock, Plus, CheckCircle2, Calendar, AlertTriangle, ShieldCheck, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateSafe } from "@/lib/format";
import { toast } from "sonner";

export function PrazosView() {
  const { tarefas, processos, addTarefa, updateTarefa } = useAppStore();
  const [activeRange, setActiveRange] = React.useState<"hoje" | "semana" | "mes" | "todos">("todos");
  const [filterPriority, setFilterPriority] = React.useState<string>("All");

  // Form states
  const [title, setTitle] = React.useState("");
  const [date, setDate] = React.useState("");
  const [priority, setPriority] = React.useState<"Urgente" | "Alta" | "Média" | "Baixa">("Alta");
  const [processId, setProcessId] = React.useState("");

  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    const selectedProcess = processos.find((p) => p.id === processId);

    addTarefa({
      id: `task-${Date.now()}`,
      descricao: title,
      categoria: "Prazo Processual",
      prioridade: priority,
      status: "Pendente",
      dataLimite: new Date(date).toISOString(),
      responsavelId: "adv-1",
      responsavelNome: "Dra. Marina Silva",
      processoId: processId || undefined,
      processoNumeroCnj: selectedProcess ? selectedProcess.numeroCnj : undefined,
    });

    toast.success("Prazo processual agendado com sucesso!");
    setTitle("");
    setDate("");
    setPriority("Alta");
    setProcessId("");
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const prazos = tarefas.filter((t) => t.categoria === "Prazo Processual" || t.categoria === "Audiência");

  const filtered = prazos.filter((d) => {
    const matchesPriority = filterPriority === "All" || d.prioridade === filterPriority;
    const dDateStr = (d.dataLimite || "").split("T")[0];
    let matchesRange = true;
    if (activeRange === "hoje") {
      matchesRange = dDateStr === todayStr;
    } else if (activeRange === "semana") {
      matchesRange = dDateStr >= todayStr && dDateStr <= nextWeekStr;
    } else if (activeRange === "mes") {
      matchesRange = dDateStr >= todayStr && dDateStr <= nextMonthStr;
    }
    return matchesPriority && matchesRange;
  });

  const critical24h = prazos.filter(
    (d) =>
      d.status !== "Concluído" &&
      (d.dataLimite || "").split("T")[0] === todayStr &&
      (d.prioridade === "Urgente" || d.prioridade === "Alta")
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <AlarmClock className="h-6 w-6 text-primary" />
          Controle de Prazos Processuais & Fatais
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monitore contagens de prazos em tempo real para prevenir revelia, perempção ou preclusão judicial.
        </p>
      </div>

      {/* Alerta Crítico 24h */}
      {critical24h.length > 0 && (
        <Card className="border-rose-500/40 bg-rose-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                Risco de Preclusão ou Revelia (Vencimento Hoje!)
              </h4>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                Identificamos <strong>{critical24h.length} prazo(s) fatal(is)</strong> com vencimento nas próximas 24 horas. Providencie a minuta e o protocolo urgente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da Esquerda: Filtros e Lista (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { id: "todos", label: "Todos Ativos" },
                { id: "hoje", label: "Vence Hoje" },
                { id: "semana", label: "Esta Semana" },
                { id: "mes", label: "Este Mês" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  size="sm"
                  variant={activeRange === tab.id ? "default" : "outline"}
                  onClick={() => setActiveRange(tab.id as any)}
                  className="text-xs h-8"
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Prioridade:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value="All">Todas</option>
                <option value="Urgente">Urgente</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          {/* Lista de Prazos */}
          <div className="space-y-3">
            {filtered.map((d) => {
              const isDone = d.status === "Concluído";
              return (
                <Card
                  key={d.id}
                  className={`p-4 transition-all flex items-center justify-between gap-4 ${
                    isDone ? "opacity-60" : d.prioridade === "Urgente" ? "border-rose-500/50 bg-rose-500/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => updateTarefa(d.id, { status: isDone ? "Pendente" : "Concluído" })}
                      className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <h4 className={`text-sm font-bold ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {d.descricao}
                      </h4>
                      {d.processoNumeroCnj && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          CNJ: <span className="font-semibold text-primary">{d.processoNumeroCnj}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Limite: {formatDateSafe(d.dataLimite)}
                        </span>
                        <span>• Responsável: {d.responsavelNome}</span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={
                      d.prioridade === "Urgente"
                        ? "destructive"
                        : d.prioridade === "Alta"
                        ? "default"
                        : "secondary"
                    }
                    className="text-[10px] uppercase font-bold shrink-0"
                  >
                    {d.prioridade}
                  </Badge>
                </Card>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-12 bg-card border border-border rounded-xl text-center text-xs text-muted-foreground">
                Nenhum prazo localizado para o filtro selecionado.
              </div>
            )}
          </div>
        </div>

        {/* Coluna da Direita: Formulário de Novo Prazo (1 col) */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Agendar Prazo OAB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDeadline} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Descrição do Prazo
                </label>
                <Input
                  required
                  placeholder="Ex: Réplica à contestação / Recurso Especial"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Data Limite de Protocolo
                </label>
                <Input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Gravidade / Nível de Risco
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-background border border-border rounded-md p-2 text-xs font-medium text-foreground focus:outline-none"
                >
                  <option value="Urgente">Urgente (Fatal 24h / Preclusivo)</option>
                  <option value="Alta">Alta (Intimação regular)</option>
                  <option value="Média">Média (Ações preparatórias)</option>
                  <option value="Baixa">Baixa (Diligência interna)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Vincular Processo CNJ (Opcional)
                </label>
                <select
                  value={processId}
                  onChange={(e) => setProcessId(e.target.value)}
                  className="w-full bg-background border border-border rounded-md p-2 text-xs font-medium text-foreground focus:outline-none"
                >
                  <option value="">Nenhum (Prazo Administrativo)</option>
                  {processos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.numeroCnj} - {p.assunto}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Registrar Prazo no Calendário
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
