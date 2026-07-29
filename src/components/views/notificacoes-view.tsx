"use client";

import * as React from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { notificacoesExtras } from "@/lib/seed-data";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

const tipoConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }> = {
  error: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Erro" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/15", label: "Aviso" },
  success: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Sucesso" },
  info: { icon: Info, color: "text-info", bg: "bg-info/10", label: "Informação" },
};

export function NotificacoesView() {
  const { notificacoes, marcarNotificacaoLida, marcarTodasNotificacoesLidas, setView } = useAppStore();
  const [filtro, setFiltro] = React.useState<"todas" | "naolidas" | "error" | "warning" | "success" | "info">("todas");

  // Combinar notificações base + extras
  const todas = React.useMemo(() => {
    return [...notificacoes, ...notificacoesExtras]
      .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
  }, [notificacoes]);

  const filtradas = React.useMemo(() => {
    if (filtro === "todas") return todas;
    if (filtro === "naolidas") return todas.filter((n) => !n.lida);
    return todas.filter((n) => n.tipo === filtro);
  }, [todas, filtro]);

  const stats = {
    total: todas.length,
    naoLidas: todas.filter((n) => !n.lida).length,
    erros: todas.filter((n) => n.tipo === "error").length,
    avisos: todas.filter((n) => n.tipo === "warning").length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="text-lg font-bold tabular-nums">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(stats.naoLidas > 0 && "border-primary/30")}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <span className="h-2 w-2 rounded-full bg-primary pulse-ring" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Não lidas</p>
              <p className="text-lg font-bold tabular-nums text-primary">{stats.naoLidas}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <XCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Erros</p>
              <p className="text-lg font-bold tabular-nums text-destructive">{stats.erros}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Avisos</p>
              <p className="text-lg font-bold tabular-nums text-warning">{stats.avisos}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              {[
                { key: "todas", label: "Todas" },
                { key: "naolidas", label: "Não lidas" },
                { key: "error", label: "Erros" },
                { key: "warning", label: "Avisos" },
                { key: "success", label: "Sucessos" },
                { key: "info", label: "Informações" },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFiltro(f.key as any)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-md border transition-colors",
                    filtro === f.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                marcarTodasNotificacoesLidas();
                toast.success("Todas marcadas como lidas");
              }}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Marcar todas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <div className="space-y-2">
        {filtradas.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-success opacity-50" />
              <p className="font-medium">Nenhuma notificação nesta categoria</p>
            </CardContent>
          </Card>
        ) : (
          filtradas.map((n, idx) => {
            const cfg = tipoConfig[n.tipo] || tipoConfig.info;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              >
                <Card
                  className={cn(
                    "hover:shadow-card transition-all",
                    !n.lida && "border-primary/30 bg-primary/5"
                  )}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shrink-0", cfg.bg, cfg.color)}>
                        <cfg.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className={cn("text-sm leading-tight", !n.lida && "font-semibold")}>
                            {n.titulo}
                          </p>
                          {!n.lida && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{n.descricao}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(n.dataHora), { addSuffix: true, locale: ptBR })}
                          </span>
                          <div className="flex items-center gap-1">
                            {n.link && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => setView(n.link!)}
                              >
                                Ver
                              </Button>
                            )}
                            {!n.lida && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 gap-1"
                                onClick={() => marcarNotificacaoLida(n.id)}
                              >
                                <Check className="h-3 w-3" />
                                Marcar lida
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
