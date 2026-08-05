"use client";

import * as React from "react";
import {
  ArrowLeft,
  Scale,
  Clock,
  Calendar,
  DollarSign,
  User,
  Tag,
  FileText,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Database,
  Loader2,
  CheckCircle2,
  Activity,
  Building2,
  Users,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/lib/store";
import { formatCurrency, safeDate, formatDateSafe } from "@/lib/format";
import { differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { datajudService } from "@/lib/datajudService";

export function ProcessoDetalheView() {
  const { selectedProcessoId, processos, setView, setAiPanelOpen, updateProcesso, removeProcesso } = useAppStore();
  const processo = processos.find((p) => p.id === selectedProcessoId);

  const [syncing, setSyncing] = React.useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleDeleteProcesso() {
    if (!processo) return;
    setIsDeleting(true);
    try {
      await removeProcesso(processo.id);
      toast.success(`Processo ${processo.numeroCnj || ""} excluído com sucesso!`);
      setView("processos");
    } catch (e) {
      toast.error("Erro ao excluir processo.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!processo) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-muted-foreground">
          <p>Processo não encontrado.</p>
          <Button variant="link" onClick={() => setView("processos")}>
            Voltar para lista
          </Button>
        </CardContent>
      </Card>
    );
  }

  const prazoFatalDate = safeDate(processo?.datasImportantes?.prazoFatal);
  const diasPrazo = prazoFatalDate ? differenceInDays(prazoFatalDate, new Date()) : null;

  const movimentacoesOrdenadas = [...(processo?.movimentacoes || [])].sort((a, b) => {
    const da = safeDate(a.data)?.getTime() || 0;
    const db = safeDate(b.data)?.getTime() || 0;
    return db - da;
  });

  async function sincronizar() {
    if (!processo) return;
    setSyncing(true);
    try {
      const res = await datajudService.sincronizarProcesso(processo);
      updateProcesso(processo.id, {
        movimentacoes: res.processoAtualizado.movimentacoes,
        ultimaSincronizacaoDataJud: res.processoAtualizado.ultimaSincronizacaoDataJud,
        valorCausa: res.processoAtualizado.valorCausa,
      });
      toast.success(
        `Sincronização com DataJud concluída! ${res.novasMovimentacoes} nova(s) movimentação(ões) salva(s) no Firebase.`
      );
    } catch (e: any) {
      toast.error(e.message || "Erro na sincronização DataJud");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header com voltar + sincronizar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => setView("processos")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Voltar para processos
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={sincronizar}
            disabled={syncing}
            className="gap-1.5"
          >
            {syncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Sincronizar DataJud
          </Button>
          <Button size="sm" onClick={() => setAiPanelOpen(true)} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Perguntar ao Copiloto
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirmDelete(true)}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Excluir Processo
          </Button>
        </div>
      </div>

      {/* Card principal do processo */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <CardContent className="relative p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs">
                  {processo.numeroCnj}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {processo.tribunal} · {processo.comarca}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {processo.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    processo.risco === "Alto" && "border-destructive/40 text-destructive",
                    processo.risco === "Médio" && "border-warning/40 text-warning",
                    processo.risco === "Baixo" && "border-success/40 text-success"
                  )}
                >
                  Risco {processo.risco}
                </Badge>
              </div>
              <h2 className="text-xl md:text-2xl font-bold leading-tight">
                {processo.clienteNome}
              </h2>
              <p className="text-sm text-muted-foreground">
                {processo.classeProcessual} · {processo.assunto}
              </p>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {processo.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs gap-0.5">
                    <Tag className="h-2.5 w-2.5" />
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Probabilidade de êxito */}
            {processo.probabilidadeSucesso !== undefined && (
              <div className="shrink-0 rounded-2xl bg-card/80 border border-primary/15 p-4 min-w-[180px]">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold">Probabilidade de êxito</span>
                </div>
                <p className="text-3xl font-bold text-gradient-primary tabular-nums">
                  {processo.probabilidadeSucesso}%
                </p>
                <Progress value={processo.probabilidadeSucesso} className="h-1.5 mt-2" />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Análise IA baseada em {processo.movimentacoes.length} movimentações
                </p>
              </div>
            )}
          </div>

          {/* Resumo IA */}
          {processo.resumoIa && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold">Resumo do Copiloto IA</span>
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                      Auto-gerado
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed">{processo.resumoIa}</p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Linha do tempo */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <Activity className="h-4 w-4" />
              Linha do Tempo Visual
            </CardTitle>
            <CardDescription className="text-xs">
              {movimentacoesOrdenadas.length} movimentações registradas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />

              <div className="space-y-5">
                {movimentacoesOrdenadas.map((m, idx) => {
                  const date = safeDate(m.data) || new Date();
                  const isLatest = idx === 0;
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.06, 0.6) }}
                      className="relative pl-12"
                    >
                      {/* Bullet */}
                      <div
                        className={cn(
                          "absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-card",
                          m.relevancia === "Alta" && "border-destructive/40",
                          m.relevancia === "Média" && "border-warning/40",
                          m.relevancia === "Baixa" && "border-muted-foreground/30",
                          isLatest && "shadow-glow border-primary"
                        )}
                      >
                        {isLatest ? (
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              m.relevancia === "Alta" && "bg-destructive",
                              m.relevancia === "Média" && "bg-warning",
                              m.relevancia === "Baixa" && "bg-muted-foreground"
                            )}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold tabular-nums">
                            {formatDateSafe(m.data, "dd 'de' MMMM 'de' yyyy")}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {m.fonte || "Sistema"}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              m.relevancia === "Alta" && "border-destructive/40 text-destructive",
                              m.relevancia === "Média" && "border-warning/40 text-warning"
                            )}
                          >
                            {m.relevancia}
                          </Badge>
                          {isLatest && (
                            <Badge className="text-xs bg-primary text-primary-foreground">
                              Mais recente
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium leading-snug">{m.descricao}</p>
                        <p className="text-xs text-muted-foreground">{m.orgao}</p>
                        {m.alertaIa && (
                          <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                            <div className="flex items-start gap-1.5">
                              <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                              <p className="text-xs leading-snug">
                                <span className="font-semibold text-primary">Alerta IA: </span>
                                {m.alertaIa}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar info */}
        <div className="space-y-4">
          {/* Datas importantes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Datas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <DateRow
                label="Distribuição"
                value={processo.datasImportantes.distribuicao}
              />
              {processo.datasImportantes.proximaAudiencia && (
                <DateRow
                  label="Próxima audiência"
                  value={processo.datasImportantes.proximaAudiencia}
                  highlight="info"
                />
              )}
              {processo.datasImportantes.prazoFatal && (
                <DateRow
                  label="Prazo fatal"
                  value={processo.datasImportantes.prazoFatal}
                  highlight={diasPrazo !== null && diasPrazo <= 7 ? "destructive" : "warning"}
                  countdown={diasPrazo}
                />
              )}
            </CardContent>
          </Card>

          {/* Partes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Partes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Polo ativo
                </p>
                <p className="text-sm font-medium">{processo.partes.poloAtivo}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Polo passivo
                </p>
                <p className="text-sm font-medium">{processo.partes.poloPassivo}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Advogado responsável
                </p>
                <p className="text-sm font-medium">{processo.advogadoResponsavelNome}</p>
              </div>
            </CardContent>
          </Card>

          {/* Financeiro */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                Valor da Causa
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold tabular-nums">
                {formatCurrency(processo.valorCausa)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Última sincronização: {formatDateSafe(processo.ultimaSincronizacaoDataJud, "dd/MM/yyyy 'às' HH:mm")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Documentos vinculados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Documentos Vinculados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {processo.documentosIds.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                Nenhum documento vinculado a este processo.
              </p>
            ) : (
              processo.documentosIds.map((id) => (
                <DocumentoRow key={id} documentoId={id} />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmação de exclusão do processo */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Excluir Processo
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground space-y-2">
            <p>
              Tem certeza que deseja excluir o processo <strong className="font-mono text-foreground">{processo.numeroCnj}</strong>?
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-md border border-amber-500/20">
              Esta ação removerá o processo do sistema e do banco de dados do escritório.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteProcesso}
              disabled={isDeleting}
              className="gap-1.5"
            >
              {isDeleting ? "Excluindo..." : "Sim, Excluir Processo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DateRow({
  label,
  value,
  highlight,
  countdown,
}: {
  label: string;
  value: string;
  highlight?: "info" | "warning" | "destructive";
  countdown?: number | null;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">
          {formatDateSafe(value, "dd 'de' MMMM 'de' yyyy")}
        </p>
      </div>
      {countdown !== null && countdown !== undefined && (
        <Badge
          variant={highlight === "destructive" ? "destructive" : "secondary"}
          className="text-xs"
        >
          <Clock className="h-3 w-3 mr-0.5" />
          {countdown < 0 ? `${Math.abs(countdown)}d em atraso` : `${countdown}d`}
        </Badge>
      )}
    </div>
  );
}

function DocumentoRow({ documentoId }: { documentoId: string; key?: string }) {
  const { documentos, setView } = useAppStore();
  const doc = documentos.find((d) => d.id === documentoId);
  if (!doc) return null;
  return (
    <button
      onClick={() => setView("documentos")}
      className="w-full flex items-center gap-3 p-3 hover:bg-accent/40 transition-colors text-left"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
        <FileText className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{doc.nome}</p>
        <p className="text-xs text-muted-foreground">
          {doc.tipo} · {doc.tamanho} · {formatDateSafe(doc.dataUpload)}
        </p>
      </div>
      <Badge variant="outline" className="text-xs">
        {doc.statusIa === "analisado" ? (
          <>
            <CheckCircle2 className="h-3 w-3 mr-0.5" />
            IA processado
          </>
        ) : (
          "Pendente"
        )}
      </Badge>
    </button>
  );
}
