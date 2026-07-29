"use client";

import * as React from "react";
import {
  MapPin,
  Map as MapIcon,
  TrendingUp,
  FolderKanban,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { processosPorEstado } from "@/lib/seed-data";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function MapaProcessosView() {
  const { setView } = useAppStore();
  const [estadoSelecionado, setEstadoSelecionado] = React.useState<string | null>(null);

  const totalProcessos = processosPorEstado.reduce((acc, e) => acc + e.total, 0);
  const totalValor = processosPorEstado.reduce((acc, e) => acc + e.valorTotal, 0);
  const totalAtivos = processosPorEstado.reduce((acc, e) => acc + e.ativos, 0);

  // Coordenadas normalizadas para o Brasil (aproximação simples em SVG)
  // Brasil: lat -33 a 5, lng -73 a -34
  const toX = (lng: number) => ((lng - (-73)) / (5 - (-73))) * 100;
  const toY = (lat: number) => ((5 - lat) / (5 - (-33))) * 100;

  const estadoDetalhe = processosPorEstado.find((e) => e.uf === estadoSelecionado);

  // Tamanho do bubble proporcional ao número de processos
  const maxSize = 28;
  const minSize = 8;
  const maxTotal = Math.max(...processosPorEstado.map((e) => e.total));

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Processos</p>
              <p className="text-lg font-bold tabular-nums">{totalProcessos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ativos</p>
              <p className="text-lg font-bold tabular-nums text-success">{totalAtivos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Estados</p>
              <p className="text-lg font-bold tabular-nums">{processosPorEstado.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15 text-warning">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Valor Total</p>
              <p className="text-lg font-bold tabular-nums">{formatCurrency(totalValor).replace("R$", "").trim()}k</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mapa */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <MapIcon className="h-4 w-4" />
              Distribuição Geográfica
            </CardTitle>
            <CardDescription className="text-xs">
              Clique em um estado para ver detalhes · Tamanho do círculo = número de processos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-[4/3] rounded-xl border border-border bg-gradient-to-br from-muted/30 to-card overflow-hidden">
              {/* Mapa do Brasil estilizado (SVG simplificado) */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Silhueta aproximada do Brasil */}
                <path
                  d="M 35 8 Q 45 6 50 10 L 60 8 Q 70 12 75 20 L 80 25 Q 82 35 78 45 L 82 55 Q 80 65 75 70 L 70 78 Q 65 85 55 88 L 50 92 Q 45 88 42 80 L 38 75 Q 32 70 30 60 L 25 50 Q 22 40 25 30 L 28 20 Q 32 12 35 8 Z"
                  fill="var(--muted)"
                  fillOpacity={0.3}
                  stroke="var(--border)"
                  strokeWidth={0.5}
                />

                {/* Linhas de grade */}
                {[20, 40, 60, 80].map((y) => (
                  <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} stroke="var(--border)" strokeWidth={0.2} strokeDasharray="1 2" />
                ))}
                {[20, 40, 60, 80].map((x) => (
                  <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="100" stroke="var(--border)" strokeWidth={0.2} strokeDasharray="1 2" />
                ))}

                {/* Bubbles por estado */}
                {processosPorEstado.map((e) => {
                  const x = toX(e.coord.lng);
                  const y = toY(e.coord.lat);
                  const size = minSize + (e.total / maxTotal) * (maxSize - minSize);
                  const isSelected = estadoSelecionado === e.uf;
                  return (
                    <g
                      key={e.uf}
                      onClick={() => setEstadoSelecionado(e.uf)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={size / 2}
                        fill="var(--primary)"
                        fillOpacity={isSelected ? 0.6 : 0.35}
                        stroke="var(--primary)"
                        strokeWidth={isSelected ? 1 : 0.5}
                        className="transition-all"
                      />
                      <text
                        x={x}
                        y={y + 1.5}
                        textAnchor="middle"
                        fontSize={3}
                        fontWeight="bold"
                        fill="var(--primary-foreground)"
                        className="pointer-events-none"
                      >
                        {e.total}
                      </text>
                      <text
                        x={x}
                        y={y - size / 2 - 1.5}
                        textAnchor="middle"
                        fontSize={3}
                        fontWeight="bold"
                        fill="var(--foreground)"
                        className="pointer-events-none"
                      >
                        {e.uf}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Legenda */}
              <div className="absolute bottom-3 left-3 rounded-lg bg-card/80 backdrop-blur p-2 text-[10px] space-y-1">
                <p className="font-semibold uppercase tracking-widest text-muted-foreground">Legenda</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-primary/40 border border-primary" />
                  <span>Estado com processos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  <span>Tamanho = volume</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhe do estado */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {estadoDetalhe ? `${estadoDetalhe.estado} (${estadoDetalhe.uf})` : "Selecione um estado"}
            </CardTitle>
            <CardDescription className="text-xs">
              {estadoDetalhe ? "Distribuição por comarca" : "Clique em um círculo no mapa"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {estadoDetalhe ? (
              <div>
                <div className="grid grid-cols-3 gap-2 p-4 border-b">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total</p>
                    <p className="text-lg font-bold tabular-nums">{estadoDetalhe.total}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Ativos</p>
                    <p className="text-lg font-bold tabular-nums text-primary">{estadoDetalhe.ativos}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Valor</p>
                    <p className="text-lg font-bold tabular-nums">{formatCurrency(estadoDetalhe.valorTotal).replace("R$", "").trim()}</p>
                  </div>
                </div>
                <div className="divide-y">
                  {estadoDetalhe.comarcas.map((c) => (
                    <div key={c.nome} className="p-3 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                        {c.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{c.nome}</p>
                        <p className="text-[10px] text-muted-foreground">{c.total} processo(s)</p>
                      </div>
                      <div className="w-20">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(c.total / estadoDetalhe.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-bold tabular-nums">{c.total}</span>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs" onClick={() => setView("processos")}>
                    Ver processos deste estado <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Selecione um estado</p>
                <p className="text-xs mt-1">Clique em um círculo no mapa para ver detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de estados (top) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Ranking por estado</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {[...processosPorEstado]
              .sort((a, b) => b.total - a.total)
              .map((e, idx) => (
                <motion.button
                  key={e.uf}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => setEstadoSelecionado(e.uf)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 hover:bg-accent/40 transition-colors text-left",
                    estadoSelecionado === e.uf && "bg-primary/5"
                  )}
                >
                  <span className="text-xs font-bold text-muted-foreground tabular-nums w-6">#{idx + 1}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    {e.uf}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{e.estado}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {e.ativos} ativos · {formatCurrency(e.valorTotal).replace("R$", "").trim()} · {e.comarcas.length} comarca(s)
                    </p>
                  </div>
                  <div className="w-32 hidden sm:block">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(e.total / maxTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{e.total}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
