"use client";

import * as React from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  Command as CommandIcon,
  Zap,
  Settings,
  Key,
  Download,
  ExternalLink,
  Mail,
  LogIn,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ApiKeyModal } from "@/components/api-key-modal";
import { exportAllDataToExcel } from "@/lib/data-exporter";
import { getSaudacaoHorario } from "@/lib/format";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/seed-data";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const viewTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Painel Principal",
    subtitle: "Aqui está o resumo da sua operação hoje.",
  },
  processos: {
    title: "Processos",
    subtitle: "Acompanhe todos os processos do escritório.",
  },
  "processo-detalhe": {
    title: "Detalhe do Processo",
    subtitle: "Visualização completa com linha do tempo.",
  },
  clientes: {
    title: "Clientes",
    subtitle: "CRM jurídico integrado.",
  },
  tarefas: {
    title: "Tarefas & Prazos",
    subtitle: "Organize o trabalho do escritório.",
  },
  documentos: {
    title: "Documentos",
    subtitle: "Repositório com análise IA.",
  },
  calendario: {
    title: "Calendário Jurídico",
    subtitle: "Prazos, audiências e compromissos.",
  },
  financeiro: {
    title: "Financeiro",
    subtitle: "Honorários, despesas, contratos e fluxo de caixa.",
  },
  equipe: {
    title: "Gestão de Equipe",
    subtitle: "Membros, papéis e permissões do escritório.",
  },
  copiloto: {
    title: "Copiloto Jurídico IA",
    subtitle: "Seu assistente jurídico pessoal.",
  },
  "copiloto-proativo": {
    title: "Copiloto Proativo",
    subtitle: "IA que monitora continuamente seus processos.",
  },
  inbox: {
    title: "Inbox Jurídico",
    subtitle: "Triagem inteligente de comunicações.",
  },
  busca: {
    title: "Busca Jurídica Inteligente",
    subtitle: "Encontre processos em linguagem natural.",
  },
  "pesquisa-global": {
    title: "Pesquisa Global",
    subtitle: "Tudo em um só lugar: processos, clientes, documentos, jurisprudência.",
  },
  automacoes: {
    title: "Automações",
    subtitle: "Fluxos automáticos do escritório.",
  },
  jurisprudencia: {
    title: "Painel de Jurisprudência IA",
    subtitle: "Tendências dos tribunais em tempo real.",
  },
  estrategico: {
    title: "Modo Estratégico",
    subtitle: "Gargalos, produtividade e análise preditiva.",
  },
  "mapa-processos": {
    title: "Mapa de Processos",
    subtitle: "Distribuição geográfica por estado e comarca.",
  },
  notificacoes: {
    title: "Central de Notificações",
    subtitle: "Filtre por tipo e prioridade.",
  },
  "portal-cliente": {
    title: "Modo Cliente",
    subtitle: "Acompanhe seus processos com transparência.",
  },
  configuracoes: {
    title: "Configurações",
    subtitle: "Preferências e personalização.",
  },
};

import { AuthModal } from "@/components/auth/auth-modal";

export function AppHeader() {
  const { currentView, setCommandPaletteOpen, notificacoes, marcarNotificacaoLida, marcarTodasNotificacoesLidas, setView, logout, user, processos, clientes, tarefas, documentos } =
    useAppStore();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  const info = viewTitles[currentView] || viewTitles.dashboard;
  const naoLidas = notificacoes.filter((n) => !n.lida).length;
  
  // Use real user data if available, fallback to seed
  const displayName = user?.displayName || currentUser.nome;
  const email = user?.email || currentUser.email;
  const firstName = displayName.split(" ")[0] || "Advogado(a)";
  const saudacao = getSaudacaoHorario();

  const dynamicInfo = {
    ...info,
    title: currentView === "dashboard" ? `${saudacao}, ${firstName}` : info.title,
  };

  const handleExportAll = () => {
    exportAllDataToExcel({
      officeName: "VDL Juris Advocacia",
      processos,
      clientes,
      tarefas,
      documentos,
    });
    toast.success("Backup integral exportado com sucesso em Excel!");
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-border w-full max-w-full overflow-hidden">
      <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 pl-14 md:pl-6 min-w-0 max-w-full">
        {/* Title & Badges */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h1 className="text-sm sm:text-lg font-bold leading-tight tracking-tight text-foreground truncate min-w-0">
              {dynamicInfo.title}
            </h1>
            <Badge variant="outline" className="text-[10px] text-muted-foreground bg-muted/50 border-border font-mono py-0 px-1.5 h-4 sm:h-5 shrink-0">
              v2.4.0 Live
            </Badge>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate hidden sm:block">
            {dynamicInfo.subtitle}
          </p>
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 h-8 px-3 w-[200px] lg:w-[240px] rounded-lg border border-input bg-muted/40 text-xs text-muted-foreground hover:bg-muted transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 text-left truncate">Buscar ou pedir à IA...</span>
          <kbd className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded border border-border bg-background text-[10px] font-mono">
            <CommandIcon className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        {/* Chaves IA Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowApiKeyModal(true)}
          className="hidden xl:inline-flex gap-1.5 text-xs border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium h-8"
        >
          <Key className="h-3.5 w-3.5" />
          Chaves IA
        </Button>

        {/* Exportar Dados Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportAll}
          className="hidden xl:inline-flex gap-1.5 text-xs border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-medium h-8"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar Dados
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Alternar tema"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-amber-500" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {naoLidas > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive pulse-ring" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[380px] p-0">
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Notificações</span>
                {naoLidas > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {naoLidas} novas
                  </Badge>
                )}
              </div>
              <button
                onClick={marcarTodasNotificacoesLidas}
                className="text-xs text-primary hover:underline"
              >
                Marcar todas como lidas
              </button>
            </div>
            <ScrollArea className="h-[360px]">
              <div className="divide-y">
                {notificacoes.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      marcarNotificacaoLida(n.id);
                      if (n.link) setView(n.link);
                    }}
                    className={cn(
                      "w-full text-left p-3 hover:bg-accent/50 transition-colors block",
                      !n.lida && "bg-primary/5"
                    )}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "mt-1 h-2 w-2 rounded-full shrink-0",
                          n.tipo === "warning" && "bg-warning",
                          n.tipo === "success" && "bg-success",
                          n.tipo === "info" && "bg-info",
                          n.tipo === "error" && "bg-destructive",
                          n.lida && "bg-muted-foreground/30"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-tight">
                            {n.titulo}
                          </p>
                          {!n.lida && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {n.descricao}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1.5">
                          {formatDistanceToNow(new Date(n.dataHora), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="p-2 border-t">
              <button
                onClick={() => setView("notificacoes")}
                className="w-full text-center text-xs text-primary hover:underline py-1"
              >
                Ver todas as notificações →
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* New */}
        <Button
          size="sm"
          className="hidden sm:inline-flex gap-1.5"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Novo
        </Button>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-accent transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-primary-foreground text-xs font-semibold">
                {displayName
                  .split(" ")
                  .slice(0, 2)
                  .map((n: string) => n[0])
                  .join("")}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <p className="text-xs font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {currentUser.oab}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{displayName}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowAuthModal(true)}>
              <Mail className="h-4 w-4 mr-2 text-primary" /> Entrar com E-mail / Senha
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setView("configuracoes")}>
              <Settings className="h-4 w-4 mr-2" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
        <ApiKeyModal open={showApiKeyModal} onOpenChange={setShowApiKeyModal} />
      </div>
    </header>
  );
}
