"use client";

import React, { ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} reset={this.reset} />;
      }
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { setView } = useAppStore();
  const isProd = process.env.NODE_ENV === "production";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold mb-2">Algo deu errado</h2>
      <p className="text-sm text-muted-foreground max-w-md mb-1">
        Ocorreu um erro inesperado ao carregar esta tela.
      </p>
      {error?.message && (
        <pre className="mt-3 mb-3 p-3 rounded-lg bg-muted text-xs text-left max-w-2xl overflow-x-auto font-mono text-destructive">
          {error.message}
        </pre>
      )}
      <div className="flex gap-2 mt-4">
        <Button onClick={reset} variant="default" className="gap-1.5">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
        <Button
          onClick={() => {
            reset();
            setView("dashboard");
          }}
          variant="outline"
          className="gap-1.5"
        >
          <Home className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}
