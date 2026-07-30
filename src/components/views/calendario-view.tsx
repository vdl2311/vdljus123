"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Gavel,
  Users,
  FileText,
  AlertCircle,
  Plus,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { eventosAgendaCompletos } from "@/lib/seed-data";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const tipoConfig: Record<string, { color: string; bg: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  Audiência: { color: "text-destructive", bg: "bg-destructive", icon: Gavel, label: "Audiência" },
  Prazo: { color: "text-warning", bg: "bg-warning", icon: Clock, label: "Prazo" },
  Reunião: { color: "text-info", bg: "bg-info", icon: Users, label: "Reunião" },
  Diligência: { color: "text-primary", bg: "bg-primary", icon: FileText, label: "Diligência" },
};

export function CalendarioView() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [filtroTipo, setFiltroTipo] = React.useState<string>("todos");
  const { openProcesso } = useAppStore();

  const eventos = React.useMemo(() => {
    return eventosAgendaCompletos.filter((e) => {
      if (filtroTipo === "todos") return true;
      return e.tipo === filtroTipo;
    });
  }, [filtroTipo]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR, weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR, weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const eventosDoDia = (date: Date) =>
    eventos.filter((e) => isSameDay(parseISO(e.data), date));

  const eventosSelecionados = eventosDoDia(selectedDate).sort((a, b) => a.hora.localeCompare(b.hora));

  // Próximos eventos
  const proximosEventos = eventos
    .filter((e) => {
      const date = parseISO(e.data);
      const today = new Date();
      // Allow relative matching or any upcoming events
      return date.getTime() >= today.getTime() - 86400000;
    })
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 8);

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  // Stats
  const stats = {
    audiencias: eventos.filter((e) => e.tipo === "Audiência").length,
    prazos: eventos.filter((e) => e.tipo === "Prazo").length,
    reunioes: eventos.filter((e) => e.tipo === "Reunião").length,
    diligencias: eventos.filter((e) => e.tipo === "Diligência").length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Gavel} label="Audiências" value={stats.audiencias} color="destructive" />
        <StatCard icon={Clock} label="Prazos" value={stats.prazos} color="warning" />
        <StatCard icon={Users} label="Reuniões" value={stats.reunioes} color="info" />
        <StatCard icon={FileText} label="Diligências" value={stats.diligencias} color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendário */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4" />
                {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              <CardDescription className="text-xs capitalize">
                {eventos.length} compromissos no período
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setCurrentDate(new Date(2026, 6, 1))}>
                Hoje
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filtros por tipo */}
            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
              <Filter className="h-3 w-3 text-muted-foreground" />
              <button
                onClick={() => setFiltroTipo("todos")}
                className={cn(
                  "text-xs px-2 py-0.5 rounded border",
                  filtroTipo === "todos" ? "bg-primary/10 text-primary border-primary/30" : "border-border"
                )}
              >
                Todos
              </button>
              {Object.entries(tipoConfig).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setFiltroTipo(key)}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded border flex items-center gap-1",
                    filtroTipo === key ? "bg-primary/10 text-primary border-primary/30" : "border-border"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", cfg.bg)} />
                  {cfg.label}
                </button>
              ))}
            </div>

            {/* Cabeçalho dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-xs uppercase tracking-widest text-muted-foreground font-semibold py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid de dias */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dayEvents = eventosDoDia(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDate = isToday(day);
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square min-h-[60px] sm:min-h-[80px] p-1.5 rounded-lg border text-left transition-all relative",
                      !isCurrentMonth && "opacity-40",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : isTodayDate
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-medium block",
                        isTodayDate && "text-primary font-bold"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 3).map((e) => {
                          const cfg = tipoConfig[e.tipo];
                          return (
                            <div
                              key={e.id}
                              className={cn(
                                "h-1 rounded-full",
                                cfg.bg
                              )}
                              title={`${e.hora} ${e.titulo}`}
                            />
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{dayEvents.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detalhe do dia + próximos */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold capitalize">
                {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </CardTitle>
              <CardDescription className="text-xs">
                {eventosSelecionados.length} compromisso(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[300px] overflow-y-auto divide-y">
                {eventosSelecionados.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Sem compromissos neste dia
                  </div>
                ) : (
                  eventosSelecionados.map((e) => {
                    const cfg = tipoConfig[e.tipo];
                    return (
                      <button
                        key={e.id}
                        onClick={() => e.processoId && openProcesso(e.processoId)}
                        className="w-full flex gap-3 p-3 hover:bg-accent/40 transition-colors text-left"
                      >
                        <div className="flex flex-col items-center min-w-[48px]">
                          <span className="text-xs font-bold tabular-nums">{e.hora}</span>
                          <div className={cn("h-8 w-1 rounded-full mt-1", cfg.bg)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">{e.titulo}</p>
                          {e.clienteNome && (
                            <p className="text-xs text-muted-foreground mt-0.5">{e.clienteNome}</p>
                          )}
                          <Badge variant="outline" className="mt-1 text-xs">
                            <cfg.icon className="h-2.5 w-2.5 mr-0.5" />
                            {cfg.label}
                          </Badge>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Próximos 14 dias */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Próximos 14 dias</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[280px] overflow-y-auto divide-y">
                {proximosEventos.map((e) => {
                  const cfg = tipoConfig[e.tipo];
                  const date = parseISO(e.data);
                  return (
                    <button
                      key={e.id}
                      onClick={() => e.processoId && openProcesso(e.processoId)}
                      className="w-full flex gap-3 p-3 hover:bg-accent/40 transition-colors text-left"
                    >
                      <div className="flex flex-col items-center justify-center min-w-[44px] py-1 rounded-md bg-muted/40">
                        <span className="text-xs uppercase tracking-widest text-muted-foreground">
                          {format(date, "MMM", { locale: ptBR })}
                        </span>
                        <span className="text-base font-bold leading-none">{format(date, "dd")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{e.titulo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{e.hora} · {e.clienteNome || "—"}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          <cfg.icon className="h-2.5 w-2.5 mr-0.5" />
                          {cfg.label}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "primary" | "destructive" | "warning" | "info";
}) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            color === "primary" && "bg-primary/10 text-primary",
            color === "destructive" && "bg-destructive/10 text-destructive",
            color === "warning" && "bg-warning/15 text-warning",
            color === "info" && "bg-info/10 text-info"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-lg font-bold tabular-nums leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
