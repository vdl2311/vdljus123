"use client";

import * as React from "react";
import {
  Inbox as InboxIcon,
  Sparkles,
  Archive,
  Check,
  Clock,
  AlertTriangle,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import type { InboxClassificacao } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function InboxView() {
  const { inbox, marcarInboxLido, arquivarInbox, openProcesso, setAiPanelOpen } = useAppStore();
  const [filter, setFilter] = React.useState<"todos" | InboxClassificacao>("todos");

  const filtered = React.useMemo(() => {
    return inbox
      .filter((i) => !i.arquivado)
      .filter((i) => filter === "todos" || i.classificacaoIa === filter)
      .sort((a, b) => {
        // Ação necessária primeiro, depois por data
        const order = { "Ação Necessária": 0, Importante: 1, "Pode Esperar": 2 };
        const diff = order[a.classificacaoIa] - order[b.classificacaoIa];
        if (diff !== 0) return diff;
        return new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime();
      });
  }, [inbox, filter]);

  const counts = {
    acao: inbox.filter((i) => !i.arquivado && i.classificacaoIa === "Ação Necessária").length,
    importante: inbox.filter((i) => !i.arquivado && i.classificacaoIa === "Importante").length,
    podeEsperar: inbox.filter((i) => !i.arquivado && i.classificacaoIa === "Pode Esperar").length,
  };

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-destructive/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ação Necessária</p>
                <p className="text-lg font-bold text-destructive tabular-nums">{counts.acao}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Importante</p>
                <p className="text-lg font-bold text-warning tabular-nums">{counts.importante}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info/10 text-info">
                <InboxIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Pode Esperar</p>
                <p className="text-lg font-bold text-info tabular-nums">{counts.podeEsperar}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between">
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as classificações</SelectItem>
            <SelectItem value="Ação Necessária">Ação Necessária</SelectItem>
            <SelectItem value="Importante">Importante</SelectItem>
            <SelectItem value="Pode Esperar">Pode Esperar</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {filtered.length} item(ns) · Triagem automática IA
        </p>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.04, 0.4) }}
          >
            <Card
              className={cn(
                "hover:shadow-elevated transition-all overflow-hidden",
                !item.lido && "border-primary/30 bg-primary/5"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar com tipo */}
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback
                      className={cn(
                        "text-xs",
                        item.classificacaoIa === "Ação Necessária" && "bg-destructive/15 text-destructive",
                        item.classificacaoIa === "Importante" && "bg-warning/15 text-warning",
                        item.classificacaoIa === "Pode Esperar" && "bg-info/15 text-info"
                      )}
                    >
                      {item.tipo === "Movimentação DataJud" && "DJ"}
                      {item.tipo === "Publicação Diário Oficial" && "DO"}
                      {item.tipo === "E-mail Cliente" && "EM"}
                      {item.tipo === "Documento Recebido" && "DR"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold leading-tight">{item.titulo}</h3>
                      {!item.lido && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{item.descricao}</p>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">
                        {item.tipo}
                      </Badge>
                      <Badge
                        variant={item.classificacaoIa === "Ação Necessária" ? "destructive" : "secondary"}
                        className="text-[10px] gap-0.5"
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        {item.classificacaoIa}
                      </Badge>
                      {item.prazoSugeridoDias && (
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="h-2.5 w-2.5 mr-0.5" />
                          {item.prazoSugeridoDias}d
                        </Badge>
                      )}
                      {item.processoNumeroCnj && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {item.processoNumeroCnj.slice(0, 16)}...
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(item.dataHora), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>

                    {/* Sugestão IA */}
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        <p className="text-xs leading-relaxed">
                          <span className="font-semibold text-primary">Sugestão IA: </span>
                          {item.sugestaoAcaoIa}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      {item.processoId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs h-7"
                          onClick={() => {
                            marcarInboxLido(item.id);
                            openProcesso(item.processoId!);
                          }}
                        >
                          Abrir processo
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-7"
                        onClick={() => {
                          setAiPanelOpen(true);
                          marcarInboxLido(item.id);
                          toast.success("Enviado para o Copiloto");
                        }}
                      >
                        <Sparkles className="h-3 w-3" />
                        Perguntar à IA
                      </Button>
                      <div className="ml-auto flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs h-7"
                          onClick={() => {
                            marcarInboxLido(item.id);
                            toast.success("Marcado como lido");
                          }}
                        >
                          <Check className="h-3 w-3" />
                          Marcar lido
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs h-7"
                          onClick={() => {
                            arquivarInbox(item.id);
                            toast.success("Arquivado");
                          }}
                        >
                          <Archive className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              <InboxIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Inbox zerada!</p>
              <p className="text-xs mt-1">Nenhum item nesta categoria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
