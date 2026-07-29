"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Plus,
  FolderKanban,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Database,
  Loader2,
  ArrowUpDown,
  Tag,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import type { Processo, ProcessoArea, ProcessoRisco, ProcessoStatus, ProcessoFase } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { datajudService } from "@/lib/datajudService";

const areas: ProcessoArea[] = [
  "Trabalhista",
  "Cível",
  "Tributário",
  "Empresarial",
  "Família",
  "Criminal",
  "Previdenciário",
];

const statusList: ProcessoStatus[] = [
  "Ativo",
  "Arquivado",
  "Suspenso",
  "Em Recurso",
  "Acordo",
];

const fasesList: ProcessoFase[] = [
  "Triagem",
  "Petição Inicial",
  "Instrução",
  "Sentença",
  "Recursal",
  "Execução",
];

export function ProcessosView() {
  const {
    processos,
    processoSearch,
    processoStatusFilter,
    processoAreaFilter,
    setProcessoSearch,
    setProcessoStatusFilter,
    setProcessoAreaFilter,
    openProcesso,
    addProcesso,
    updateProcesso,
  } = useAppStore();

  const [showNewDialog, setShowNewDialog] = React.useState(false);
  const [datajudLoading, setDatajudLoading] = React.useState(false);
  const [datajudResult, setDatajudResult] = React.useState<any>(null);
  const [cnjInput, setCnjInput] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("list");

  const filtered = React.useMemo(() => {
    return processos.filter((p) => {
      const q = processoSearch.toLowerCase();
      const matchSearch =
        !q ||
        p.numeroCnj.toLowerCase().includes(q) ||
        p.clienteNome.toLowerCase().includes(q) ||
        p.assunto.toLowerCase().includes(q) ||
        p.tribunal.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.partes.poloAtivo.toLowerCase().includes(q) ||
        p.partes.poloPassivo.toLowerCase().includes(q);

      const matchStatus =
        processoStatusFilter === "todos" || p.status === processoStatusFilter;
      const matchArea =
        processoAreaFilter === "todas" || p.area === processoAreaFilter;

      return matchSearch && matchStatus && matchArea;
    });
  }, [processos, processoSearch, processoStatusFilter, processoAreaFilter]);

  const [syncingDataJud, setSyncingDataJud] = React.useState(false);

  async function consultarDataJud() {
    if (!cnjInput) {
      toast.error("Informe um número CNJ válido");
      return;
    }
    setDatajudLoading(true);
    setDatajudResult(null);
    try {
      const data = await datajudService.consultar(cnjInput);
      setDatajudResult(data);
      toast.success("Processo localizado no DataJud e gravado no Firebase!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao consultar DataJud");
    } finally {
      setDatajudLoading(false);
    }
  }

  async function sincronizarTodosComDataJud() {
    if (processos.length === 0) {
      toast.info("Nenhum processo cadastrado para sincronizar");
      return;
    }
    setSyncingDataJud(true);
    toast.info("Iniciando varredura automatizada no DataJud para todos os processos...");
    let novosMovsTotal = 0;
    let atualizados = 0;

    try {
      for (const p of processos) {
        if (p.numeroCnj) {
          try {
            const res = await datajudService.sincronizarProcesso(p);
            if (res.novasMovimentacoes > 0) {
              novosMovsTotal += res.novasMovimentacoes;
            }
            atualizados++;
          } catch (err) {
            console.warn(`Erro ao sincronizar processo ${p.numeroCnj}`, err);
          }
        }
      }
      toast.success(`Sincronização concluída! ${atualizados} processos verificados, ${novosMovsTotal} novas movimentações capturadas e salvas no Firebase.`);
    } catch (e) {
      toast.error("Erro na sincronização em lote do DataJud");
    } finally {
      setSyncingDataJud(false);
    }
  }

  function salvarNovo() {
    if (!datajudResult) return;
    const novo: Processo = {
      id: `p-${Date.now()}`,
      numeroCnj: datajudResult.numeroCnj,
      tribunal: datajudResult.tribunal,
      comarca: datajudResult.comarca,
      classeProcessual: datajudResult.classe,
      assunto: datajudResult.assunto,
      area: datajudResult.area === "Trabalhista" ? "Trabalhista" : "Cível",
      risco: "Médio",
      partes: {
        poloAtivo: datajudResult.poloAtivo,
        poloPassivo: datajudResult.poloPassivo,
      },
      advogadoResponsavelId: "u-001",
      advogadoResponsavelNome: "Dra. Marina Vidal",
      clienteId: "c-001",
      clienteNome: "[Vincular cliente]",
      status: "Ativo",
      movimentacoes: datajudResult.movimentacoes.map((m: any, i: number) => ({
        id: `m-${Date.now()}-${i}`,
        data: m.data,
        descricao: m.descricao,
        orgao: m.orgao,
        fonte: "DataJud",
        relevancia: "Média" as const,
      })),
      documentosIds: [],
      tags: ["importado-datajud"],
      datasImportantes: {
        distribuicao: datajudResult.dataDistribuicao,
      },
      valorCausa: datajudResult.valorCausa,
      ultimaSincronizacaoDataJud: new Date().toISOString(),
    };
    addProcesso(novo);
    toast.success("Processo importado e adicionado!");
    setShowNewDialog(false);
    setDatajudResult(null);
    setCnjInput("");
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca + filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número CNJ, cliente, parte, assunto, tag..."
                value={processoSearch}
                onChange={(e) => setProcessoSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={processoStatusFilter} onValueChange={setProcessoStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos status</SelectItem>
                  {statusList.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={processoAreaFilter} onValueChange={setProcessoAreaFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas áreas</SelectItem>
                  {areas.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="gap-1.5 border-primary/30 hover:bg-primary/5 text-primary"
                onClick={sincronizarTodosComDataJud}
                disabled={syncingDataJud}
              >
                {syncingDataJud ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Database className="h-4 w-4 text-primary" />
                )}
                <span className="hidden sm:inline">
                  {syncingDataJud ? "Sincronizando DataJud..." : "Sincronizar DataJud"}
                </span>
              </Button>
              <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Novo Processo</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[560px]">
                  <DialogHeader>
                    <DialogTitle>Importar processo do DataJud</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="cnj">Número CNJ</Label>
                      <div className="flex gap-2">
                        <Input
                          id="cnj"
                          placeholder="0000000-00.0000.0.00.0000"
                          value={cnjInput}
                          onChange={(e) => setCnjInput(e.target.value)}
                        />
                        <Button onClick={consultarDataJud} disabled={datajudLoading}>
                          {datajudLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Database className="h-4 w-4" />
                          )}
                          Consultar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Formato: NNNNNNN-DD.AAAA.J.TR.OOOO · Ex: 0012345-67.2023.5.02.0001
                      </p>
                    </div>

                    {datajudResult && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="rounded-lg border border-success/30 bg-success/5 p-3 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium">Processo encontrado</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Tribunal:</span>{" "}
                            <strong>{datajudResult.tribunal}</strong>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Comarca:</span>{" "}
                            <strong>{datajudResult.comarca}</strong>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Classe:</span>{" "}
                            <strong>{datajudResult.classe}</strong>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Distribuição:</span>{" "}
                            <strong>{format(new Date(datajudResult.dataDistribuicao), "dd/MM/yyyy")}</strong>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Movimentações:</span>{" "}
                            <strong>{datajudResult.movimentacoes.length} encontradas</strong>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={salvarNovo} disabled={!datajudResult}>
                      Importar processo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats da busca */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{filtered.length}</span> processo(s) encontrado(s) ·{" "}
              <span className="font-medium text-foreground">{processos.length}</span> no total
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-xs gap-1 hidden md:flex">
                <ArrowUpDown className="h-3 w-3" />
                Ordenar por prazo
              </Button>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-fit">
                <TabsList className="h-8">
                  <TabsTrigger value="list" className="text-xs px-3">Lista</TabsTrigger>
                  <TabsTrigger value="kanban" className="text-xs px-3">Kanban</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualizações */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <FolderKanban className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum processo encontrado</p>
            <p className="text-xs mt-1">Tente ajustar a busca ou os filtros.</p>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((p, idx) => (
            <ProcessoCard key={p.id} processo={p} onOpen={() => openProcesso(p.id)} index={idx} />
          ))}
        </div>
      ) : (
        <ProcessosKanban 
          processos={filtered} 
          onOpenProcesso={openProcesso} 
          onMoveProcesso={(id, novaFase) => updateProcesso(id, { fase: novaFase })}
        />
      )}
    </div>
  );
}

function ProcessoCard({
  processo,
  onOpen,
  index,
}: {
  key?: React.Key;
  processo: Processo;
  onOpen: () => void;
  index: number;
}) {
  const diasPrazo = processo.datasImportantes.prazoFatal
    ? differenceInDays(new Date(processo.datasImportantes.prazoFatal), new Date())
    : null;

  const movimentacoesRecentes = processo.movimentacoes.slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Card
        className="cursor-pointer hover:shadow-elevated hover:border-primary/30 transition-all overflow-hidden"
        onClick={onOpen}
      >
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Avatar processo */}
            <div className="flex lg:flex-col items-center lg:items-start gap-3 lg:gap-1.5 lg:min-w-[120px]">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl font-bold text-xs",
                  processo.risco === "Alto" && "bg-destructive/10 text-destructive",
                  processo.risco === "Médio" && "bg-warning/15 text-warning",
                  processo.risco === "Baixo" && "bg-success/10 text-success"
                )}
              >
                {processo.area.slice(0, 3).toUpperCase()}
              </div>
              <div className="lg:hidden flex-1" />
              <div className="hidden lg:block">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Risco
                </p>
                <p
                  className={cn(
                    "text-sm font-bold",
                    processo.risco === "Alto" && "text-destructive",
                    processo.risco === "Médio" && "text-warning",
                    processo.risco === "Baixo" && "text-success"
                  )}
                >
                  {processo.risco}
                </p>
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs text-muted-foreground">{processo.numeroCnj}</p>
                  <h3 className="font-semibold text-sm leading-tight mt-0.5 truncate">
                    {processo.clienteNome} · {processo.assunto}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-[10px]">
                    {processo.status}
                  </Badge>
                  {diasPrazo !== null && (
                    <Badge
                      variant={diasPrazo <= 7 ? "destructive" : diasPrazo <= 15 ? "secondary" : "outline"}
                      className="text-[10px]"
                    >
                      <Clock className="h-3 w-3 mr-0.5" />
                      {diasPrazo}d
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <InfoItem label="Tribunal" value={processo.tribunal} />
                <InfoItem label="Área" value={processo.area} />
                <InfoItem label="Valor" value={formatCurrency(processo.valorCausa)} />
                <InfoItem
                  label="Última sync"
                  value={format(new Date(processo.ultimaSincronizacaoDataJud), "dd/MM HH:mm", { locale: ptBR })}
                />
              </div>

              {/* Movimentações recentes */}
              {movimentacoesRecentes.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
                  {movimentacoesRecentes.map((m) => (
                    <div key={m.id} className="flex items-start gap-2 text-xs">
                      <Calendar className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="text-muted-foreground tabular-nums shrink-0">
                        {format(new Date(m.data), "dd/MM")}
                      </span>
                      <span className="truncate">{m.descricao}</span>
                      {m.alertaIa && (
                        <Badge variant="outline" className="text-[9px] shrink-0 bg-primary/5 text-primary border-primary/20">
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                          IA
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              {processo.tags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {processo.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center">
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-xs font-medium truncate">{value}</p>
    </div>
  );
}

function ProcessosKanban({
  processos,
  onOpenProcesso,
  onMoveProcesso,
}: {
  processos: Processo[];
  onOpenProcesso: (id: string) => void;
  onMoveProcesso: (id: string, novaFase: ProcessoFase) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x hide-scrollbar">
      {fasesList.map((fase) => {
        const processosDaFase = processos.filter((p) => p.fase === fase || (!p.fase && fase === "Triagem"));
        return (
          <KanbanColumn
            key={fase}
            fase={fase}
            processos={processosDaFase}
            onOpenProcesso={onOpenProcesso}
            onDropProcesso={(id) => onMoveProcesso(id, fase)}
          />
        );
      })}
    </div>
  );
}

function KanbanColumn({
  fase,
  processos,
  onOpenProcesso,
  onDropProcesso,
}: {
  fase: ProcessoFase;
  processos: Processo[];
  onOpenProcesso: (id: string) => void;
  onDropProcesso: (id: string) => void;
}) {
  const [isOver, setIsOver] = React.useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      onDropProcesso(id);
    }
  }

  return (
    <div className="flex-shrink-0 w-[280px] md:w-[320px] flex flex-col gap-3 snap-center">
      <div className="flex items-center justify-between px-1">
        <h4 className="font-semibold text-sm">{fase}</h4>
        <Badge variant="secondary" className="text-xs font-mono">{processos.length}</Badge>
      </div>
      
      <div 
        className={cn(
          "flex-1 min-h-[60vh] rounded-xl p-2.5 transition-colors",
          isOver ? "bg-primary/5 border border-primary/20" : "bg-muted/30 border border-transparent"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col gap-2.5">
          {processos.map((p) => (
            <KanbanCard key={p.id} processo={p} onOpen={() => onOpenProcesso(p.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ processo, onOpen }: { processo: Processo; onOpen: () => void }) {
  const diasPrazo = processo.datasImportantes.prazoFatal
    ? differenceInDays(new Date(processo.datasImportantes.prazoFatal), new Date())
    : null;

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData("text/plain", processo.id);
  }

  return (
    <Card 
      className="cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-md transition-all"
      draggable
      onDragStart={handleDragStart}
      onClick={onOpen}
    >
      <CardContent className="p-3.5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-1.5 py-0",
              processo.risco === "Alto" && "border-destructive/30 bg-destructive/10 text-destructive",
              processo.risco === "Médio" && "border-warning/30 bg-warning/10 text-warning",
              processo.risco === "Baixo" && "border-success/30 bg-success/10 text-success"
            )}
          >
            Risco {processo.risco}
          </Badge>
          <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 rounded-sm">
            {processo.numeroCnj.split("-")[0]}
          </span>
        </div>
        
        <div>
          <p className="font-semibold text-sm leading-tight line-clamp-2">{processo.clienteNome}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{processo.assunto}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <div className="flex items-center gap-1.5 min-w-0 pr-2">
            <div className="w-5 h-5 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
              {processo.area.slice(0, 1)}
            </div>
            <span className="text-xs text-muted-foreground truncate">{processo.tribunal}</span>
          </div>
          
          {diasPrazo !== null && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium shrink-0",
              diasPrazo <= 7 ? "text-destructive" : diasPrazo <= 15 ? "text-warning" : "text-muted-foreground"
            )}>
              <Clock className="w-3.5 h-3.5" />
              {diasPrazo}d
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
