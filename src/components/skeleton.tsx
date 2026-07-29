"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("shimmer rounded-md", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Carregando">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-8" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="status">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border p-4 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-3 w-6" />
          </div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ProcessosSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300" role="status" aria-label="Carregando processos">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <Skeleton className="h-9 w-full sm:w-80 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3 bg-card">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-44 rounded-md" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/2 rounded-md" />
              </div>
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex gap-3">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function JurisprudenciaSkeleton() {
  return (
    <div className="space-y-4 animate-in fade-in duration-300" role="status" aria-label="Carregando jurisprudência">
      <div className="rounded-xl border border-border p-6 bg-card space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48 rounded-full" />
          <Skeleton className="h-7 w-80 rounded-md" />
          <Skeleton className="h-4 w-full max-w-lg rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-2 bg-muted/30">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border p-4 bg-card flex flex-col md:flex-row gap-3">
        <Skeleton className="h-9 flex-1 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3 bg-card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-32 rounded-md" />
              <Skeleton className="h-7 w-36 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinanceiroSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300" role="status" aria-label="Carregando financeiro">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3 bg-card">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border p-5 bg-card space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-60" />
          </div>
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>

      <div className="rounded-xl border border-border p-4 bg-card space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <Skeleton className="h-5 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-border/40">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
        <Icon className="h-7 w-7 opacity-50" />
      </div>
      <p className="font-semibold text-base">{title}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
