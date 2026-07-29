"use client";

import * as React from "react";
import {
  Zap,
  Plus,
  Clock,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  Activity,
  Sparkles,
  Settings2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store";
import { automacoes } from "@/lib/seed-data";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

const tipoIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  Prazo: Clock,
  Movimentação: Activity,
  Documento: FileText,
  Cliente: Users,
  Agendada: Calendar,
};

export function AutomacoesView() {
  const [items, setItems] = React.useState(automacoes);

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ativa: !a.ativa } : a))
    );
    const a = items.find((x) => x.id === id);
    toast.success(
      a && !a.ativa ? "Automação ativada" : "Automação pausada"
    );
  }

  const totalExecucoes = items.reduce((acc, a) => acc + a.execucoesUltimos30Dias, 0);
  const ativas = items.filter((a) => a.ativa).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Ativas</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{ativas}/{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-success/10 text-success">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Execuções 30d</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">{totalExecucoes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-info/10 text-info">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Tempo economizado</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">42h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/15 text-warning">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Precisão IA</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">94%</p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Fluxos automáticos</p>
          <p className="text-xs text-muted-foreground">
            Automações que executam em segundo plano 24/7
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => toast.info("Criação de automação em breve")}>
          <Plus className="h-3.5 w-3.5" />
          Nova automação
        </Button>
      </div>

      {/* Lista de automações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((a, idx) => {
          const Icon = tipoIcon[a.tipo] || Zap;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.4) }}
            >
              <Card
                className={cn(
                  "hover:shadow-elevated transition-all overflow-hidden",
                  !a.ativa && "opacity-70"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
                        a.ativa
                          ? "bg-gradient-to-br from-primary to-chart-2 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm leading-tight">{a.nome}</h3>
                          <Badge variant="outline" className="text-xs mt-0.5">
                            {a.tipo}
                          </Badge>
                        </div>
                        <Switch checked={a.ativa} onCheckedChange={() => toggle(a.id)} />
                      </div>

                      <p className="text-xs text-muted-foreground mt-2 mb-3">{a.descricao}</p>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="text-xs uppercase tracking-widest text-muted-foreground min-w-[60px] mt-0.5">
                            Gatilho
                          </span>
                          <span className="flex-1">{a.gatilho}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs uppercase tracking-widest text-muted-foreground min-w-[60px] mt-0.5">
                            Ação
                          </span>
                          <span className="flex-1">{a.acao}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {a.execucoesUltimos30Dias} execuções / 30d
                          </span>
                          {a.ultimaExecucao && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(a.ultimaExecucao), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-0.5">
                          <Settings2 className="h-3 w-3" />
                          Configurar
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Sugeridas */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Automações sugeridas pela IA</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              {
                nome: "Lembrete de faturamento mensal",
                desc: "Cria tarefa de emissão de fatura para clientes recorrentes no dia 1º",
              },
              {
                nome: "Triagem de e-mails de clientes",
                desc: "Classifica e-mails recebidos e cria tarefa quando identificado pedido",
              },
              {
                nome: "Atualização de planilha de honorários",
                desc: "Atualiza planilha ao registrar novo processo ou acordo",
              },
              {
                nome: "Backup automático de documentos",
                desc: "Realiza backup semanal de todos os documentos anexados",
              },
            ].map((s) => (
              <button
                key={s.nome}
                onClick={() => toast.success(`"${s.nome}" ativada como nova automação`)}
                className="text-left p-3 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-accent/30 transition-all"
              >
                <p className="text-xs font-medium">{s.nome}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
