"use client";

import * as React from "react";
import {
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Briefcase,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/lib/store";
import type { Tarefa, TarefaPrioridade, TarefaStatus, TarefaCategoria } from "@/lib/types";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const colunas: { status: TarefaStatus; titulo: string; color: string }[] = [
  { status: "Pendente", titulo: "Pendente", color: "bg-muted-foreground" },
  { status: "Em Andamento", titulo: "Em Andamento", color: "bg-info" },
  { status: "Concluído", titulo: "Concluído", color: "bg-success" },
  { status: "Atrasado", titulo: "Atrasado", color: "bg-destructive" },
];

const prioridades: TarefaPrioridade[] = ["Urgente", "Alta", "Média", "Baixa"];
const categorias: TarefaCategoria[] = [
  "Prazo Processual",
  "Audiência",
  "Diligência",
  "Reunião",
  "Interno",
];

export function TarefasView() {
  const { tarefas, addTarefa, updateTarefa, removeTarefa } = useAppStore();
  const [showNew, setShowNew] = React.useState(false);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  const grouped = React.useMemo(() => {
    return colunas.map((c) => ({
      ...c,
      tarefas: tarefas
        .filter((t) => {
          // Tarefa pendente com data passada vira atrasada visualmente
          if (c.status === "Atrasado") {
            return t.status === "Atrasado" ||
              (t.status === "Pendente" &&
                differenceInDays(new Date(t.dataLimite), new Date()) < 0);
          }
          if (c.status === "Pendente") {
            return t.status === "Pendente" &&
              differenceInDays(new Date(t.dataLimite), new Date()) >= 0;
          }
          return t.status === c.status;
        })
        .sort((a, b) => new Date(a.dataLimite).getTime() - new Date(b.dataLimite).getTime()),
    }));
  }, [tarefas]);

  function handleDrop(targetStatus: TarefaStatus) {
    if (!draggingId) return;
    updateTarefa(draggingId, { status: targetStatus });
    setDraggingId(null);
    toast.success("Tarefa movida");
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Quadro Kanban</p>
              <p className="text-xs text-muted-foreground">
                Arraste tarefas entre colunas para atualizar status
              </p>
            </div>
            <Dialog open={showNew} onOpenChange={setShowNew}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Nova tarefa
                </Button>
              </DialogTrigger>
              <NovaTarefaDialog
                onSave={(t) => {
                  addTarefa(t);
                  setShowNew(false);
                  toast.success("Tarefa criada!");
                }}
              />
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {grouped.map((col) => (
          <div
            key={col.status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.status)}
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", col.color)} />
                <h3 className="text-sm font-semibold">{col.titulo}</h3>
              </div>
              <Badge variant="secondary" className="text-[10px] tabular-nums">
                {col.tarefas.length}
              </Badge>
            </div>

            <div className="space-y-2 min-h-[200px]">
              <AnimatePresence>
                {col.tarefas.map((t) => (
                  <TarefaCard
                    key={t.id}
                    tarefa={t}
                    onDragStart={() => setDraggingId(t.id)}
                    onAdvance={() => {
                      const next: Record<TarefaStatus, TarefaStatus> = {
                        Pendente: "Em Andamento",
                        "Em Andamento": "Concluído",
                        Concluído: "Concluído",
                        Atrasado: "Em Andamento",
                      };
                      updateTarefa(t.id, { status: next[t.status] });
                      toast.success("Status atualizado");
                    }}
                    onDelete={() => {
                      removeTarefa(t.id);
                      toast.success("Tarefa removida");
                    }}
                  />
                ))}
              </AnimatePresence>

              {col.tarefas.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  Sem tarefas aqui
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TarefaCard({
  tarefa,
  onDragStart,
  onAdvance,
  onDelete,
}: {
  key?: React.Key;
  tarefa: Tarefa;
  onDragStart: () => void;
  onAdvance: () => void;
  onDelete: () => void;
}) {
  const date = new Date(tarefa.dataLimite);
  const dias = differenceInDays(date, new Date());

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      draggable
      onDragStart={onDragStart}
      className="cursor-move"
    >
      <Card className="overflow-hidden hover:shadow-elevated transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px]",
                tarefa.prioridade === "Urgente" && "border-destructive/40 text-destructive",
                tarefa.prioridade === "Alta" && "border-warning/40 text-warning",
                tarefa.prioridade === "Média" && "border-info/40 text-info",
                tarefa.prioridade === "Baixa" && "border-muted-foreground/40"
              )}
            >
              {tarefa.prioridade}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground p-0.5">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onAdvance}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Avançar status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-sm font-medium leading-snug mb-2">{tarefa.descricao}</p>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(date, "dd/MM", { locale: ptBR })}
            <span className="ml-1">
              {dias < 0 ? (
                <span className="text-destructive font-medium">· {Math.abs(dias)}d atraso</span>
              ) : dias === 0 ? (
                <span className="text-warning font-medium">· vence hoje</span>
              ) : (
                <span>· em {dias}d</span>
              )}
            </span>
          </div>

          {tarefa.processoNumeroCnj && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1.5 font-mono">
              <Briefcase className="h-3 w-3" />
              {tarefa.processoNumeroCnj.slice(0, 16)}...
            </div>
          )}

          <Badge variant="secondary" className="text-[9px] mt-2">
            {tarefa.categoria}
          </Badge>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function NovaTarefaDialog({ onSave }: { onSave: (t: Tarefa) => void }) {
  const { processos } = useAppStore();
  const [descricao, setDescricao] = React.useState("");
  const [dataLimite, setDataLimite] = React.useState("");
  const [prioridade, setPrioridade] = React.useState<TarefaPrioridade>("Média");
  const [categoria, setCategoria] = React.useState<TarefaCategoria>("Prazo Processual");
  const [processoId, setProcessoId] = React.useState("");

  function salvar() {
    if (!descricao || !dataLimite) {
      toast.error("Preencha descrição e data limite");
      return;
    }
    const proc = processos.find((p) => p.id === processoId);
    const nova: Tarefa = {
      id: `t-${Date.now()}`,
      descricao,
      processoId: processoId || undefined,
      processoNumeroCnj: proc?.numeroCnj,
      responsavelId: "u-001",
      responsavelNome: "Dra. Marina Vidal",
      dataLimite,
      prioridade,
      status: "Pendente",
      categoria,
    };
    onSave(nova);
    setDescricao("");
    setDataLimite("");
    setProcessoId("");
  }

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>Nova tarefa</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3 py-2">
        <div className="grid gap-2">
          <Label>Descrição</Label>
          <Textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Preparar contestação trabalhista..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Data limite</Label>
            <Input type="date" value={dataLimite} onChange={(e) => setDataLimite(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Prioridade</Label>
            <Select value={prioridade} onValueChange={(v) => setPrioridade(v as TarefaPrioridade)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {prioridades.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Categoria</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as TarefaCategoria)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Processo (opcional)</Label>
            <Select value={processoId} onValueChange={setProcessoId}>
              <SelectTrigger>
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                {processos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.numeroCnj.slice(0, 16)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={salvar}>Criar tarefa</Button>
      </DialogFooter>
    </DialogContent>
  );
}
