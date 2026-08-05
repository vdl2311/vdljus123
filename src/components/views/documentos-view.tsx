"use client";

import * as React from "react";
import {
  FileText,
  Search,
  Upload,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Tag,
  FileSearch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function DocumentosView() {
  const { documentos, openProcesso } = useAppStore();
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<string | null>(documentos[0]?.id || null);
  const [showUpload, setShowUpload] = React.useState(false);

  // Sync selection if current selected is invalid
  React.useEffect(() => {
    if (documentos.length > 0 && (!selected || !documentos.some((d) => d.id === selected))) {
      setSelected(documentos[0].id);
    }
  }, [documentos, selected]);

  const filtered = React.useMemo(() => {
    return documentos.filter((d) => {
      const q = search.toLowerCase();
      return (
        !q ||
        d.nome.toLowerCase().includes(q) ||
        d.tipo.toLowerCase().includes(q) ||
        (d.processoNumeroCnj || "").toLowerCase().includes(q)
      );
    });
  }, [documentos, search]);

  const docSelecionado = documentos.find((d) => d.id === selected);

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <Card className="w-full max-w-full overflow-hidden">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs sm:text-sm"
              />
            </div>
            <Button className="gap-1.5 w-full sm:w-auto text-xs sm:text-sm" onClick={() => setShowUpload(true)}>
              <Upload className="h-4 w-4" />
              Analisar documento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-full">
        <MiniStat label="Total" value={documentos.length.toString()} icon={FileText} color="primary" />
        <MiniStat
          label="Analisados IA"
          value={documentos.filter((d) => d.statusIa === "analisado").length.toString()}
          icon={CheckCircle2}
          color="success"
        />
        <MiniStat
          label="Pendentes"
          value={documentos.filter((d) => d.statusIa === "pendente").length.toString()}
          icon={AlertTriangle}
          color="warning"
        />
        <MiniStat label="Este mês" value="8" icon={Calendar} color="info" />
      </div>

      {/* Lista de documentos e Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-full">
        {/* Card Lista */}
        <Card className="lg:col-span-1 w-full max-w-full overflow-hidden">
          <CardHeader className="p-3.5 sm:p-4 pb-2 border-b">
            <CardTitle className="text-sm font-semibold">Documentos</CardTitle>
            <CardDescription className="text-xs">
              {filtered.length} arquivo(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[500px] lg:max-h-[600px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  Nenhum documento encontrado
                </div>
              ) : (
                filtered.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelected(d.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3.5 hover:bg-accent/40 transition-colors text-left min-w-0",
                      selected === d.id && "bg-primary/5 font-medium border-l-2 border-primary"
                    )}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold leading-snug break-words line-clamp-2 text-foreground">
                        {d.nome}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-[11px] text-muted-foreground">
                        <span>{d.tipo}</span>
                        <span>·</span>
                        <span>{d.tamanho}</span>
                        <span>·</span>
                        <span>{format(new Date(d.dataUpload), "dd/MM/yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0 h-4 font-normal",
                            d.statusIa === "analisado" && "border-success/40 text-success bg-success/5",
                            d.statusIa === "pendente" && "border-warning/40 text-warning bg-warning/5",
                            d.statusIa === "processando" && "border-info/40 text-info bg-info/5"
                          )}
                        >
                          {d.statusIa === "analisado" && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                          {d.statusIa === "pendente" && <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />}
                          {d.statusIa === "processando" && <Loader2 className="h-2.5 w-2.5 mr-0.5 animate-spin" />}
                          {d.statusIa}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detalhe do documento */}
        <Card className="lg:col-span-2 w-full max-w-full overflow-hidden">
          {docSelecionado ? (
            <>
              <CardHeader className="p-3.5 sm:p-5 pb-3 border-b">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm sm:text-base font-bold leading-snug break-words text-foreground">
                        {docSelecionado.nome}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1 break-words">
                        {docSelecionado.tipo} · {docSelecionado.tamanho} ·{" "}
                        {format(new Date(docSelecionado.dataUpload), "dd/MM/yyyy", { locale: ptBR })}
                      </CardDescription>
                    </div>
                  </div>
                  {docSelecionado.processoNumeroCnj && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs shrink-0 self-start sm:self-auto h-8"
                      onClick={() => {
                        const proc = useAppStore
                          .getState()
                          .processos.find((p) => p.numeroCnj === docSelecionado.processoNumeroCnj);
                        if (proc) openProcesso(proc.id);
                      }}
                    >
                      Ver processo
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3.5 sm:p-5 space-y-4 min-w-0">
                {/* Resumo IA */}
                {docSelecionado.resumoIa && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 sm:p-4 min-w-0 overflow-hidden"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-chart-2 text-primary-foreground shrink-0 mt-0.5">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-primary mb-1">Resumo IA</p>
                        <p className="text-xs sm:text-sm leading-relaxed text-foreground break-words">{docSelecionado.resumoIa}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Entidades extraídas */}
                {docSelecionado.entidadesExtraidas && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                    {docSelecionado.entidadesExtraidas.datas && docSelecionado.entidadesExtraidas.datas.length > 0 && (
                      <EntityCard
                        title="Datas"
                        icon={Calendar}
                        items={docSelecionado.entidadesExtraidas.datas}
                        color="info"
                      />
                    )}
                    {docSelecionado.entidadesExtraidas.valores && docSelecionado.entidadesExtraidas.valores.length > 0 && (
                      <EntityCard
                        title="Valores"
                        icon={DollarSign}
                        items={docSelecionado.entidadesExtraidas.valores}
                        color="success"
                      />
                    )}
                    {docSelecionado.entidadesExtraidas.partesCitadas && docSelecionado.entidadesExtraidas.partesCitadas.length > 0 && (
                      <EntityCard
                        title="Partes citadas"
                        icon={Users}
                        items={docSelecionado.entidadesExtraidas.partesCitadas}
                        color="chart-2"
                      />
                    )}
                    {docSelecionado.entidadesExtraidas.clausulasCriticas && docSelecionado.entidadesExtraidas.clausulasCriticas.length > 0 && (
                      <EntityCard
                        title="Cláusulas críticas"
                        icon={AlertTriangle}
                        items={docSelecionado.entidadesExtraidas.clausulasCriticas}
                        color="destructive"
                      />
                    )}
                  </div>
                )}

                {docSelecionado.statusIa === "pendente" && (
                  <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 sm:p-6 text-center min-w-0">
                    <AlertTriangle className="h-8 w-8 mx-auto text-warning mb-2" />
                    <p className="text-sm font-semibold">Documento pendente de análise IA</p>
                    <p className="text-xs text-muted-foreground mt-1 break-words">
                      Cole o texto do documento para análise automática de entidades e riscos.
                    </p>
                    <Button
                      size="sm"
                      className="mt-3 gap-1.5 text-xs"
                      onClick={() => setShowUpload(true)}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Analisar agora
                    </Button>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="p-8 text-center text-muted-foreground min-w-0">
              <FileSearch className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-sm">Selecione um documento</p>
              <p className="text-xs mt-1">Veja o resumo IA e entidades extraídas.</p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Dialog de análise */}
      <AnaliseDialog open={showUpload} onOpenChange={setShowUpload} />
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "success" | "warning" | "info";
}) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="p-2.5 sm:p-3 flex items-center gap-2 sm:gap-2.5 min-w-0">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            color === "primary" && "bg-primary/10 text-primary",
            color === "success" && "bg-success/10 text-success",
            color === "warning" && "bg-warning/15 text-warning",
            color === "info" && "bg-info/10 text-info"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">{label}</p>
          <p className="text-base sm:text-lg font-bold tabular-nums leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EntityCard({
  title,
  icon: Icon,
  items,
  color,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  color: "primary" | "success" | "warning" | "info" | "destructive" | "chart-2";
}) {
  return (
    <div className="rounded-lg border p-3 min-w-0 overflow-hidden bg-card">
      <div className="flex items-center gap-1.5 mb-2 min-w-0">
        <Icon
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            color === "primary" && "text-primary",
            color === "success" && "text-success",
            color === "warning" && "text-warning",
            color === "info" && "text-info",
            color === "destructive" && "text-destructive",
            color === "chart-2" && "text-chart-2"
          )}
        />
        <p className="text-xs font-semibold truncate">{title}</p>
        <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-auto shrink-0">
          {items.length}
        </Badge>
      </div>
      <ul className="space-y-1 min-w-0">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground leading-snug break-words">
            · {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnaliseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [texto, setTexto] = React.useState("");
  const [tipo, setTipo] = React.useState("Contrato");
  const [loading, setLoading] = React.useState(false);
  const [resultado, setResultado] = React.useState<any>(null);

  async function analisar() {
    if (!texto.trim()) {
      toast.error("Cole o texto do documento");
      return;
    }
    setLoading(true);
    setResultado(null);
    try {
      const res = await fetch("/api/ai/documento-analise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, tipoDocumento: tipo }),
      });
      const text = await res.text();
      let data: any = null;
      if (text) {
        try { data = JSON.parse(text); } catch {}
      }
      if (!res.ok || !data) throw new Error(data?.error || "Erro na análise do documento");
      setResultado(data);
      toast.success("Análise concluída!");
    } catch {
      toast.error("Erro na análise");
    } finally {
      setLoading(false);
    }
  }

  function fechar() {
    onOpenChange(false);
    setTexto("");
    setResultado(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) fechar(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Análise IA de Documento
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid gap-2">
            <Label>Tipo de documento</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Contrato">Contrato</SelectItem>
                <SelectItem value="Petição Inicial">Petição Inicial</SelectItem>
                <SelectItem value="Contestação">Contestação</SelectItem>
                <SelectItem value="Sentença">Sentença</SelectItem>
                <SelectItem value="Procuração">Procuração</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Texto do documento</Label>
            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Cole aqui o texto do documento para análise..."
              rows={6}
              className="font-mono text-xs"
            />
          </div>

          {resultado && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-success/30 bg-success/5 p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Análise concluída</span>
              </div>
              {resultado.resumo && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Resumo</p>
                  <p className="text-xs">{resultado.resumo}</p>
                </div>
              )}
              {resultado.alertas && resultado.alertas.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Alertas</p>
                  <ul className="text-xs space-y-0.5">
                    {resultado.alertas.map((a: string, i: number) => (
                      <li key={i}>· {a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {resultado.proximosPassos && resultado.proximosPassos.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Próximos passos</p>
                  <ul className="text-xs space-y-0.5">
                    {resultado.proximosPassos.map((a: string, i: number) => (
                      <li key={i}>→ {a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={fechar}>
            Fechar
          </Button>
          <Button onClick={analisar} disabled={loading} className="gap-1.5">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? "Analisando..." : "Analisar com IA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
