"use client";

import * as React from "react";
import {
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Briefcase,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Scale,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import type { Tarefa, TarefaPrioridade, TarefaStatus, TarefaCategoria } from "@/lib/types";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const colunas: { status: TarefaStatus; titulo: string; dotColor: string }[] = [
  { status: "Pendente", titulo: "A FAZER", dotColor: "bg-slate-500" },
  { status: "Em Andamento", titulo: "EM ANDAMENTO", dotColor: "bg-amber-500" },
  { status: "Em Revisão", titulo: "EM REVISÃO", dotColor: "bg-purple-500" },
  { status: "Concluído", titulo: "CONCLUÍDA", dotColor: "bg-emerald-500" },
];

export function TarefasView() {
  const { tarefas, addTarefa, updateTarefa, removeTarefa } = useAppStore();
  const [showNew, setShowNew] = React.useState(false);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  const activeCount = tarefas.filter((t) => t.status !== "Concluído").length;

  const grouped = React.useMemo(() => {
    return colunas.map((col) => ({
      ...col,
      list: tarefas
        .filter((t) => {
          if (col.status === "Pendente") {
            return t.status === "Pendente" || t.status === "Atrasado";
          }
          return t.status === col.status;
        })
        .sort((a, b) => new Date(a.dataLimite).getTime() - new Date(b.dataLimite).getTime()),
    }));
  }, [tarefas]);

  function handleDrop(targetStatus: TarefaStatus) {
    if (!draggingId) return;
    updateTarefa(draggingId, { status: targetStatus });
    setDraggingId(null);
    toast.success("Tarefa reposicionada no Kanban");
  }

  const shiftStatus = (id: string, currentStatus: TarefaStatus, direction: "left" | "right") => {
    const statuses: TarefaStatus[] = ["Pendente", "Em Andamento", "Em Revisão", "Concluído"];
    let idx = statuses.indexOf(currentStatus === "Atrasado" ? "Pendente" : currentStatus);
    if (idx === -1) idx = 0;
    const newIdx = direction === "left" ? Math.max(0, idx - 1) : Math.min(statuses.length - 1, idx + 1);
    updateTarefa(id, { status: statuses[newIdx] });
    toast.success(`Status alterado para ${statuses[newIdx]}`);
  };

  return (
    <div className="space-y-4">
      {/* Subheader bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">Kanban da equipe</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            <strong>{activeCount} tarefas ativas</strong> • Arraste entre colunas ou use as setas
          </p>
        </div>

        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-full px-4 text-xs font-bold">
              <Plus className="h-4 w-4" />
              Nova tarefa
            </Button>
          </DialogTrigger>
          <NovaTarefaDialog
            onSave={(t) => {
              addTarefa(t);
              setShowNew(false);
              toast.success("Nova tarefa adicionada!");
            }}
          />
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {grouped.map((col) => (
          <div
            key={col.status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.status)}
            className="flex flex-col rounded-xl bg-muted/30 border border-border/60 p-3 space-y-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-1 bg-background rounded-lg border border-border shadow-xs">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full shrink-0", col.dotColor)} />
                <h3 className="text-xs font-bold tracking-wider text-foreground">{col.titulo}</h3>
              </div>
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
                {col.list.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              <AnimatePresence>
                {col.list.map((t) => (
                  <TarefaKanbanCard
                    key={t.id}
                    tarefa={t}
                    onDragStart={() => setDraggingId(t.id)}
                    onShiftLeft={() => shiftStatus(t.id, t.status, "left")}
                    onShiftRight={() => shiftStatus(t.id, t.status, "right")}
                    onDelete={() => {
                      removeTarefa(t.id);
                      toast.success("Tarefa removida do Kanban", {
                        action: {
                          label: "Desfazer",
                          onClick: () => addTarefa(t),
                        },
                      });
                    }}
                  />
                ))}
              </AnimatePresence>

              {col.list.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                  Sem tarefas nesta etapa
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TarefaKanbanCard({
  tarefa,
  onDragStart,
  onShiftLeft,
  onShiftRight,
  onDelete,
}: {
  tarefa: Tarefa;
  onDragStart: () => void;
  onShiftLeft: () => void;
  onShiftRight: () => void;
  onDelete: () => void;
}) {
  const priorityClasses = {
    Urgente: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    Alta: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    Média: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
    Baixa: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30",
  };

  const initialLetter = (tarefa.responsavelNome || "Advogado")[0].toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={onDragStart}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card className="hover:border-primary/40 transition-all shadow-xs border-border bg-background">
        <CardContent className="p-3.5 space-y-2.5">
          {/* Top Bar: Priority Pill & Delete */}
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={cn("text-[10px] font-bold uppercase tracking-wider py-0 px-2 h-5", priorityClasses[tarefa.prioridade] || priorityClasses["Média"])}
            >
              {tarefa.prioridade === "Urgente" ? "CRÍTICO" : tarefa.prioridade.toUpperCase()}
            </Badge>
            <button
              onClick={onDelete}
              className="text-muted-foreground/60 hover:text-destructive p-1 rounded transition-colors"
              title="Excluir tarefa"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Title & Description */}
          <div>
            <h4 className="text-xs font-bold text-foreground leading-snug">{tarefa.descricao}</h4>
            {tarefa.categoria && (
              <span className="inline-block mt-1 text-[10px] text-muted-foreground font-medium bg-muted/50 px-1.5 py-0.5 rounded border border-border/40">
                {tarefa.categoria}
              </span>
            )}
          </div>

          {/* Linked Process Badge if exists */}
          {tarefa.processoNumeroCnj && (
            <div className="p-1.5 bg-muted/50 border border-border/60 rounded text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 truncate">
              <Scale className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">Proc: {tarefa.processoNumeroCnj}</span>
            </div>
          )}

          {/* Bottom Bar: Responsible User & Navigation Arrows */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                {initialLetter}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[110px]">
                {tarefa.responsavelNome}
              </span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <button
                onClick={onShiftLeft}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                title="Mover para esquerda"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onShiftRight}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                title="Mover para direita"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NovaTarefaDialog({ onSave }: { onSave: (t: Tarefa) => void }) {
  const { processos, user } = useAppStore();
  const [descricao, setDescricao] = React.useState("");
  const [dataLimite, setDataLimite] = React.useState("");
  const [prioridade, setPrioridade] = React.useState<TarefaPrioridade>("Alta");
  const [categoria, setCategoria] = React.useState<TarefaCategoria>("Prazo Processual");
  const [processoId, setProcessoId] = React.useState("");
  const [responsavelNome, setResponsavelNome] = React.useState("Dra. Letícia Antunes");

  function salvar() {
    if (!descricao || !dataLimite) {
      toast.error("Preencha a descrição e a data limite");
      return;
    }
    const proc = processos.find((p) => p.id === processoId);
    const nova: Tarefa = {
      id: `t-${Date.now()}`,
      descricao,
      processoId: processoId || undefined,
      processoNumeroCnj: proc?.numeroCnj,
      responsavelId: user?.uid || "u-001",
      responsavelNome: responsavelNome || "Dra. Letícia Antunes",
      dataLimite,
      prioridade,
      status: "Pendente",
      categoria,
    };
    onSave(nova);
  }

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle className="text-base font-bold">Cadastrar Nova Tarefa</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 py-2">
        <div className="space-y-1">
          <Label htmlFor="tarefa-descricao" className="text-xs font-semibold">Descrição / Título da Tarefa</Label>
          <Input
            id="tarefa-descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Redigir Petição Inicial de Divórcio"
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="tarefa-data-limite" className="text-xs font-semibold">Data Limite</Label>
            <Input
              id="tarefa-data-limite"
              type="date"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="tarefa-prioridade" className="text-xs font-semibold">Prioridade</Label>
            <select
              id="tarefa-prioridade"
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value as any)}
              className="w-full bg-background border border-border rounded-md p-2 text-xs font-medium text-foreground focus:outline-none"
            >
              <option value="Urgente">Crítico / Urgente</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="tarefa-responsavel" className="text-xs font-semibold">Advogado / Responsável</Label>
          <Input
            id="tarefa-responsavel"
            value={responsavelNome}
            onChange={(e) => setResponsavelNome(e.target.value)}
            placeholder="Ex: Dra. Letícia Antunes"
            className="text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="tarefa-processo" className="text-xs font-semibold">Vincular Processo CNJ (Opcional)</Label>
          <select
            id="tarefa-processo"
            value={processoId}
            onChange={(e) => setProcessoId(e.target.value)}
            className="w-full bg-background border border-border rounded-md p-2 text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="">Nenhum processo vinculado</option>
            {processos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.numeroCnj} - {p.assunto}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={salvar} className="w-full mt-2 gap-1.5">
          <Plus className="h-4 w-4" />
          Criar Tarefa no Kanban
        </Button>
      </div>
    </DialogContent>
  );
}
