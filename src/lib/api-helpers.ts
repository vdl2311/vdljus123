import { ZodSchema, ZodError, z } from "zod";

// ============================================================================
// API Helpers — validação, rate limiting, timeout, erro sanitizado
// ============================================================================

export function sanitizeError(error: unknown): { message: string; code: string } {
  const isProd = process.env.NODE_ENV === "production";

  if (error instanceof ZodError) {
    const issues = error.issues || [];
    const details = issues
      .map((e) => {
        const path = Array.isArray(e.path) ? e.path.join(".") : "?";
        return `${path}: ${e.message}`;
      })
      .join("; ");
    return {
      message: `Dados inválidos: ${details}`,
      code: "VALIDATION_ERROR",
    };
  }

  if (error instanceof Error) {
    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return { message: "Tempo limite excedido. Tente novamente.", code: "TIMEOUT" };
    }
    return {
      message: isProd ? "Erro interno no servidor." : error.message,
      code: "INTERNAL_ERROR",
    };
  }

  return {
    message: isProd ? "Erro interno no servidor." : "Erro desconhecido",
    code: "UNKNOWN",
  };
}

export function apiError(error: unknown, status = 500) {
  const { message, code } = sanitizeError(error);
  if (status >= 500) {
    console.error(`[API_ERROR][${code}]`, error);
  }
  return { error: message, code, status };
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  return Promise.race([
    promise.finally(() => clearTimeout(timeout)),
    new Promise<T>((_, reject) => {
      controller.signal.addEventListener("abort", () => {
        reject(new Error("timeout"));
      });
    }),
  ]);
}

export const schemas = {
  aiChat: z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().min(1).max(8000),
        })
      )
      .min(1)
      .max(50),
    contextoProcesso: z.string().max(20000).optional(),
  }),

  buscaInteligente: z.object({
    query: z.string().min(3).max(500),
    processos: z.array(z.any()).max(100),
  }),

  documentoAnalise: z.object({
    texto: z.string().min(10).max(50000),
    tipoDocumento: z.string().max(100).optional(),
  }),

  gerarPeca: z.object({
    tipo: z.string().min(3).max(200),
    contexto: z.string().max(10000).optional(),
    partes: z.string().max(10000).optional(),
    fatos: z.string().max(10000).optional(),
    pedidos: z.string().max(10000).optional(),
  }),

  explicarDecisao: z.object({
    texto: z.string().min(10).max(50000),
    contexto: z.string().max(5000).optional(),
  }),

  copilotoProativo: z.object({
    processos: z.array(z.any()).max(100),
    tarefas: z.array(z.any()).max(100).optional(),
    inbox: z.array(z.any()).max(50).optional(),
    lancamentos: z.array(z.any()).max(100).optional(),
    insightsExistentes: z.array(z.any()).max(50).optional(),
  }),
};
