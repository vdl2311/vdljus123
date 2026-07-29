"use client";

import * as React from "react";
import { toast } from "sonner";

// ============================================================================
// Hook useFetch — wrapper para fetch com loading, erro, retry e mensagens
// ============================================================================

interface UseFetchOptions {
  // Mensagem exibida no toast em caso de erro
  errorMessage?: string;
  // Mensagem exibida no toast em caso de sucesso (opcional)
  successMessage?: string;
  // Se true, não exibe toast de erro automático
  silent?: boolean;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (body?: unknown) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook para chamadas POST com estado de loading/erro gerenciado.
 * Sanitiza mensagens de erro do backend antes de exibir ao usuário.
 */
export function useFetch<T = unknown>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const execute = React.useCallback(
    async (body?: unknown): Promise<T | null> => {
      // Cancela request anterior se ainda em andamento
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        const json = await res.json();

        if (!res.ok) {
          // Sanitiza mensagem de erro do backend
          const msg =
            typeof json.error === "string"
              ? json.error
              : res.status === 429
              ? "Muitas requisições. Aguarde alguns segundos."
              : res.status === 500
              ? "Erro interno no servidor. Tente novamente."
              : `Erro ${res.status}`;
          throw new Error(msg);
        }

        setData(json);
        if (options.successMessage) {
          toast.success(options.successMessage);
        }
        return json;
      } catch (err) {
        // AbortError = request cancelada, não mostrar erro
        if (err instanceof Error && err.name === "AbortError") return null;

        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(msg);
        if (!options.silent) {
          toast.error(options.errorMessage || msg);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [url, options.errorMessage, options.successMessage, options.silent]
  );

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Cleanup ao desmontar
  React.useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return { data, loading, error, execute, reset };
}
