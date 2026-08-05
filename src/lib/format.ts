// Formatadores e Máscaras utilitários para VDL Juris

import { format as fnsFormat, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

export function safeDate(dateVal: any): Date | null {
  if (!dateVal) return null;
  if (dateVal instanceof Date) {
    return isValid(dateVal) ? dateVal : null;
  }
  if (typeof dateVal === "string") {
    const parsed = parseISO(dateVal);
    if (isValid(parsed)) return parsed;
    const d = new Date(dateVal);
    if (isValid(d)) return d;
  }
  if (typeof dateVal === "number") {
    const d = new Date(dateVal);
    if (isValid(d)) return d;
  }
  return null;
}

export function formatDateSafe(
  dateVal: any,
  pattern: string = "dd/MM/yyyy",
  fallback: string = "--"
): string {
  const d = safeDate(dateVal);
  if (!d) return fallback;
  try {
    return fnsFormat(d, pattern, { locale: ptBR });
  } catch {
    return fallback;
  }
}

export type MaskType = "cnj" | "cpf" | "cnpj" | "cpf-cnpj" | "phone" | "cep" | "date" | "currency";

export function maskCNJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 20);
  if (!digits) return "";
  let res = digits;
  if (res.length > 7) {
    res = `${res.slice(0, 7)}-${res.slice(7)}`;
  }
  if (res.length > 10) {
    res = `${res.slice(0, 10)}.${res.slice(10)}`;
  }
  if (res.length > 15) {
    res = `${res.slice(0, 15)}.${res.slice(15)}`;
  }
  if (res.length > 17) {
    res = `${res.slice(0, 17)}.${res.slice(17)}`;
  }
  if (res.length > 20) {
    res = `${res.slice(0, 20)}.${res.slice(20)}`;
  }
  return res;
}

export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function maskCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return maskCPF(digits);
  }
  return maskCNPJ(digits);
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits
    .replace(/^(\d{2})(\d)/, "$1/$2")
    .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}

export function maskCurrency(value: string | number): string {
  if (typeof value === "number") {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  }
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function applyMask(value: string, mask: MaskType): string {
  switch (mask) {
    case "cnj":
      return maskCNJ(value);
    case "cpf":
      return maskCPF(value);
    case "cnpj":
      return maskCNPJ(value);
    case "cpf-cnpj":
      return maskCpfCnpj(value);
    case "phone":
      return maskPhone(value);
    case "cep":
      return maskCEP(value);
    case "date":
      return maskDate(value);
    case "currency":
      return maskCurrency(value);
    default:
      return value;
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyDetailed(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)}k`;
  }
  return formatCurrency(value);
}

export function formatCnpjCpf(value: string): string {
  return maskCpfCnpj(value);
}

export function getSaudacaoHorario(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return "Bom dia";
  } else if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
}

