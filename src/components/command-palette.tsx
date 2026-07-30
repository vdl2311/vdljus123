"use client";

import * as React from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  FileText,
  Sparkles,
  Inbox,
  Search,
  Zap,
  Plus,
  FileSearch,
  Scale,
  ArrowRight,
  Bell,
  Calendar,
  DollarSign,
  Bot,
  Map as MapIcon,
  TrendingUp,
  Globe,
  AlarmClock,
  ShieldCheck,
  Library,
  FileSignature,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAppStore } from "@/lib/store";
import { useAppStore as useStore } from "@/lib/store";
import type { ViewKey } from "@/lib/types";

interface CommandItemDef {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  group: string;
  keywords?: string;
}

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setView,
    setAiPanelOpen,
    processos,
    openProcesso,
  } = useAppStore();

  // Atalho ⌘K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const go = (v: ViewKey) => {
    setView(v);
    setCommandPaletteOpen(false);
  };

  const items: CommandItemDef[] = [
    {
      id: "go-dashboard",
      label: "Ir para Dashboard",
      icon: LayoutDashboard,
      group: "Navegação",
      onSelect: () => go("dashboard"),
      keywords: "home inicio tela",
    },
    {
      id: "go-processos",
      label: "Ir para Processos",
      icon: FolderKanban,
      group: "Navegação",
      onSelect: () => go("processos"),
    },
    {
      id: "go-clientes",
      label: "Ir para Clientes",
      icon: Users,
      group: "Navegação",
      onSelect: () => go("clientes"),
    },
    {
      id: "go-tarefas",
      label: "Ir para Tarefas",
      icon: CheckSquare,
      group: "Navegação",
      onSelect: () => go("tarefas"),
    },
    {
      id: "go-prazos",
      label: "Controle de Prazos Fatais",
      icon: AlarmClock,
      group: "Navegação",
      onSelect: () => go("prazos"),
      keywords: "preclusao revelia prazo intimacao",
    },
    {
      id: "go-conflito-interesse",
      label: "Conflito de Interesses & OAB",
      icon: Scale,
      group: "Navegação",
      onSelect: () => go("conflito-interesse"),
      keywords: "impedimento etico artigo 20 partes",
    },
    {
      id: "go-compliance",
      label: "Compliance & LGPD",
      icon: ShieldCheck,
      group: "Navegação",
      onSelect: () => go("compliance"),
      keywords: "publicidade provimento 205 oab backup",
    },
    {
      id: "go-contratos",
      label: "Modelos & Contratos Quota Litis",
      icon: FileSignature,
      group: "Navegação",
      onSelect: () => go("contratos"),
      keywords: "procuracao minuta assinatura digital hash",
    },
    {
      id: "go-conhecimento",
      label: "Base de Conhecimento & Súmulas",
      icon: Library,
      group: "Navegação",
      onSelect: () => go("conhecimento"),
      keywords: "sumula acordoes tese artigo julgados",
    },
    {
      id: "go-documentos",
      label: "Ir para Documentos",
      icon: FileText,
      group: "Navegação",
      onSelect: () => go("documentos"),
    },
    {
      id: "go-calendario",
      label: "Ir para Calendário",
      icon: Calendar,
      group: "Navegação",
      onSelect: () => go("calendario"),
    },
    {
      id: "go-financeiro",
      label: "Ir para Financeiro",
      icon: DollarSign,
      group: "Navegação",
      onSelect: () => go("financeiro"),
    },
    {
      id: "go-equipe",
      label: "Ir para Equipe",
      hint: "membros e permissões",
      icon: Users,
      group: "Navegação",
      onSelect: () => go("equipe"),
    },
    {
      id: "go-inbox",
      label: "Abrir Inbox Jurídico",
      icon: Inbox,
      group: "Navegação",
      onSelect: () => go("inbox"),
    },
    {
      id: "go-copiloto-proativo",
      label: "Copiloto Proativo",
      hint: "monitora 24/7",
      icon: Bot,
      group: "IA",
      onSelect: () => go("copiloto-proativo"),
    },
    {
      id: "go-busca",
      label: "Busca Inteligente",
      hint: "linguagem natural",
      icon: Search,
      group: "IA",
      onSelect: () => go("busca"),
    },
    {
      id: "go-pesquisa-global",
      label: "Pesquisa Global Unificada",
      hint: "processos+clientes+docs+jurisprudência",
      icon: Globe,
      group: "IA",
      onSelect: () => go("pesquisa-global"),
    },
    {
      id: "ask-copilot",
      label: "Perguntar ao Copiloto IA",
      hint: "Cmd+J",
      icon: Sparkles,
      group: "IA",
      onSelect: () => {
        setAiPanelOpen(true);
        setCommandPaletteOpen(false);
      },
    },
    {
      id: "go-jurisprudencia",
      label: "Painel de Jurisprudência IA",
      icon: Scale,
      group: "IA",
      onSelect: () => go("jurisprudencia"),
    },
    {
      id: "go-estrategico",
      label: "Modo Estratégico",
      hint: "gargalos + preditivo",
      icon: TrendingUp,
      group: "IA",
      onSelect: () => go("estrategico"),
    },
    {
      id: "go-mapa",
      label: "Mapa de Processos",
      icon: MapIcon,
      group: "IA",
      onSelect: () => go("mapa-processos"),
    },
    {
      id: "go-automacoes",
      label: "Gerenciar Automações",
      icon: Zap,
      group: "IA",
      onSelect: () => go("automacoes"),
    },
    {
      id: "go-portal-cliente",
      label: "Modo Cliente",
      icon: Users,
      group: "Conta",
      onSelect: () => go("portal-cliente"),
    },
    {
      id: "go-config",
      label: "Configurações",
      icon: Scale,
      group: "Conta",
      onSelect: () => go("configuracoes"),
    },
  ];

  // Adiciona processo direto
  const processItems: CommandItemDef[] = processos.slice(0, 6).map((p) => ({
    id: `proc-${p.id}`,
    label: `Processo ${p.numeroCnj}`,
    hint: p.clienteNome,
    icon: FileSearch,
    group: "Processos recentes",
    onSelect: () => {
      openProcesso(p.id);
      setCommandPaletteOpen(false);
    },
    keywords: p.clienteNome + " " + p.assunto + " " + p.tribunal,
  }));

  // Agrupa
  const groups = Array.from(
    new Set([...items, ...processItems].map((i) => i.group))
  );

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <CommandInput placeholder="Buscar ações, processos ou perguntar à IA..." />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        {groups.map((g) => (
          <CommandGroup key={g} heading={g}>
            {[...items, ...processItems]
              .filter((i) => i.group === g)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.keywords || ""} ${item.hint || ""}`}
                    onSelect={item.onSelect}
                    className="cursor-pointer"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{item.label}</span>
                    {item.hint && (
                      <span className="text-xs text-muted-foreground">
                        {item.hint}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
          </CommandGroup>
        ))}
        <CommandSeparator />
        <CommandGroup heading="Ações rápidas">
          <CommandItem
            onSelect={() => {
              go("processos");
            }}
          >
            <Plus className="h-4 w-4 text-primary" />
            <span className="flex-1">Cadastrar novo processo</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
