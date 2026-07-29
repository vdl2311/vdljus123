"use client";

import * as React from "react";
import {
  Scale,
  FolderKanban,
  Clock,
  Calendar,
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Phone,
  Mail,
  Sparkles,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function PortalClienteView() {
  const { processos, setView, user } = useAppStore();

  // Simula login como cliente "Construtora Horizonte"
  const clienteId = "c-001";
  const clienteNome = "Construtora Horizonte Ltda";
  const processosCliente = processos.filter((p) => p.clienteId === clienteId);
  const ativos = processosCliente.filter(
    (p) => p.status === "Ativo" || p.status === "Em Recurso"
  );

  return (
    <div className="space-y-4">
      {/* Aviso de modo */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-chart-2/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Você está visualizando como cliente</p>
                <p className="text-xs text-muted-foreground">
                  Esta é a experiência que seus clientes têm ao acessar o portal
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setView("dashboard")} className="gap-1.5">
              Sair do modo cliente
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header cliente */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <CardContent className="relative p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-gradient-to-br from-chart-2 to-primary text-primary-foreground font-bold text-lg">
                  CH
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Bem-vindo(a)
                </p>
                <h2 className="text-xl md:text-2xl font-bold leading-tight">{clienteNome}</h2>
                <p className="text-xs text-muted-foreground">
                  Cliente desde março de 2019 · CNPJ 12.345.678/0001-90
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums">{processosCliente.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Processos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums text-primary">{ativos.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Ativos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold tabular-nums">2</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Prazos 30d</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem do escritório */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground text-xs">
                MV
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm font-semibold">{user?.displayName || "Advogado(a) Responsável"}</p>
                <Badge variant="outline" className="text-xs">Sócia responsável</Badge>
                <span className="text-xs text-muted-foreground ml-auto">há 2 horas</span>
              </div>
              <p className="text-sm leading-relaxed">
                Olá! Recebemos os cartões de ponto eletrônicos e já estamos analisando.
                A audiência do processo Bezerra foi mantida para 05/08. Qualquer dúvida,
                estamos à disposição.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processos do cliente */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <FolderKanban className="h-4 w-4" />
            Seus processos
          </h3>
          <Button variant="ghost" size="sm" className="text-xs">
            Ver todos <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {processosCliente.map((p, idx) => {
            const diasPrazo = p.datasImportantes.prazoFatal
              ? differenceInDays(new Date(p.datasImportantes.prazoFatal), new Date())
              : null;
            const ultimaMov = p.movimentacoes[0];
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="cursor-pointer hover:shadow-elevated hover:border-primary/30 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-muted-foreground">{p.numeroCnj}</p>
                        <p className="text-sm font-semibold mt-0.5">{p.assunto}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs shrink-0",
                          p.status === "Ativo" && "border-success/40 text-success",
                          p.status === "Em Recurso" && "border-warning/40 text-warning"
                        )}
                      >
                        {p.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-muted-foreground">Tribunal: </span>
                        <strong>{p.tribunal}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor: </span>
                        <strong>{formatCurrency(p.valorCausa)}</strong>
                      </div>
                    </div>

                    {ultimaMov && (
                      <div className="rounded-md bg-muted/40 p-2 text-xs">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">
                          Última movimentação · {format(parseISO(ultimaMov.data), "dd/MM/yyyy")}
                        </p>
                        <p className="line-clamp-2">{ultimaMov.descricao}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {diasPrazo !== null && (
                        <Badge
                          variant={diasPrazo <= 7 ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          <Clock className="h-2.5 w-2.5 mr-0.5" />
                          Próximo prazo: {diasPrazo}d
                        </Badge>
                      )}
                      {p.datasImportantes.proximaAudiencia && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-2.5 w-2.5 mr-0.5" />
                          Audiência {format(parseISO(p.datasImportantes.proximaAudiencia), "dd/MM")}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: MessageSquare, label: "Enviar mensagem", color: "primary" as const },
          { icon: FileText, label: "Solicitar documento", color: "chart-2" as const },
          { icon: Calendar, label: "Agendar reunião", color: "info" as const },
          { icon: Phone, label: "Solicitar retorno", color: "warning" as const },
        ].map((a) => (
          <button
            key={a.label}
            className="rounded-lg border border-border hover:border-primary/30 hover:shadow-card transition-all p-4 text-left"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg mb-2",
                a.color === "primary" && "bg-primary/10 text-primary",
                a.color === "chart-2" && "bg-chart-2/10 text-chart-2",
                a.color === "info" && "bg-info/10 text-info",
                a.color === "warning" && "bg-warning/15 text-warning"
              )}
            >
              <a.icon className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium">{a.label}</p>
          </button>
        ))}
      </div>

      {/* Próximos compromissos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Próximos compromissos
          </CardTitle>
          <CardDescription className="text-xs">Datas importantes dos seus processos</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {processosCliente
              .filter((p) => p.datasImportantes.proximaAudiencia || p.datasImportantes.prazoFatal)
              .map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3">
                  <div className="flex flex-col items-center justify-center min-w-[48px] py-1 rounded-md bg-muted/40">
                    {(p.datasImportantes.proximaAudiencia || p.datasImportantes.prazoFatal) && (
                      <>
                        <span className="text-xs uppercase tracking-widest text-muted-foreground">
                          {format(parseISO(p.datasImportantes.proximaAudiencia || p.datasImportantes.prazoFatal!), "MMM", { locale: ptBR })}
                        </span>
                        <span className="text-base font-bold leading-none">
                          {format(parseISO(p.datasImportantes.proximaAudiencia || p.datasImportantes.prazoFatal!), "dd")}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {p.datasImportantes.proximaAudiencia ? "Audiência" : "Prazo processual"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{p.assunto}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {p.datasImportantes.proximaAudiencia ? "Audiência" : "Prazo"}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
