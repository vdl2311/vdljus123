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
  UserCircle,
  Settings,
  Scale,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Calendar,
  DollarSign,
  Bot,
  Map as MapIcon,
  TrendingUp,
  Globe,
  UserCog,
  AlarmClock,
  ShieldCheck,
  Library,
  FileSignature,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ViewKey } from "@/lib/types";

interface NavItem {
  key: ViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  group: "principal" | "inteligencia" | "config";
}

export function AppSidebar() {
  const { currentView, setView, sidebarCollapsed, toggleSidebar, inbox, tarefas, setAiPanelOpen } =
    useAppStore();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const inboxNaoLidos = inbox.filter((i) => !i.lido && !i.arquivado).length;
  const tarefasPendentes = tarefas.filter(
    (t) => t.status === "Pendente" || t.status === "Em Andamento"
  ).length;

  const navItems: NavItem[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      group: "principal",
    },
    {
      key: "processos",
      label: "Processos",
      icon: FolderKanban,
      group: "principal",
    },
    {
      key: "calendario",
      label: "Calendário",
      icon: Calendar,
      group: "principal",
    },
    {
      key: "clientes",
      label: "Clientes",
      icon: Users,
      group: "principal",
    },
    {
      key: "tarefas",
      label: "Tarefas",
      icon: CheckSquare,
      badge: tarefasPendentes,
      group: "principal",
    },
    {
      key: "prazos",
      label: "Controle de Prazos",
      icon: AlarmClock,
      group: "principal",
    },
    {
      key: "conflito-interesse",
      label: "Conflito de Interesses",
      icon: Scale,
      group: "principal",
    },
    {
      key: "compliance",
      label: "Compliance & LGPD",
      icon: ShieldCheck,
      group: "principal",
    },
    {
      key: "contratos",
      label: "Modelos & Contratos",
      icon: FileSignature,
      group: "principal",
    },
    {
      key: "conhecimento",
      label: "Base de Conhecimento",
      icon: Library,
      group: "principal",
    },
    {
      key: "documentos",
      label: "Documentos",
      icon: FileText,
      group: "principal",
    },
    {
      key: "financeiro",
      label: "Financeiro",
      icon: DollarSign,
      group: "principal",
    },
    {
      key: "equipe",
      label: "Equipe",
      icon: UserCog,
      group: "principal",
    },
    {
      key: "copiloto-proativo",
      label: "Copiloto Proativo",
      icon: Bot,
      group: "inteligencia",
    },
    {
      key: "inbox",
      label: "Inbox Jurídico",
      icon: Inbox,
      badge: inboxNaoLidos,
      group: "inteligencia",
    },
    {
      key: "copiloto",
      label: "Copiloto IA",
      icon: Sparkles,
      group: "inteligencia",
    },
    {
      key: "pesquisa-global",
      label: "Pesquisa Global",
      icon: Globe,
      group: "inteligencia",
    },
    {
      key: "busca",
      label: "Busca Inteligente",
      icon: Search,
      group: "inteligencia",
    },
    {
      key: "jurisprudencia",
      label: "Jurisprudência IA",
      icon: Scale,
      group: "inteligencia",
    },
    {
      key: "estrategico",
      label: "Modo Estratégico",
      icon: TrendingUp,
      group: "inteligencia",
    },
    {
      key: "mapa-processos",
      label: "Mapa de Processos",
      icon: MapIcon,
      group: "inteligencia",
    },
    {
      key: "automacoes",
      label: "Automações",
      icon: Zap,
      group: "inteligencia",
    },
    {
      key: "portal-cliente",
      label: "Modo Cliente",
      icon: UserCircle,
      group: "config",
    },
    {
      key: "configuracoes",
      label: "Configurações",
      icon: Settings,
      group: "config",
    },
  ];

  const grouped = {
    principal: navItems.filter((i) => i.group === "principal"),
    inteligencia: navItems.filter((i) => i.group === "inteligencia"),
    config: navItems.filter((i) => i.group === "config"),
  };

  // Mobile drawer
  if (isMobile) {
    return (
      <>
        {/* Trigger flutuante mobile */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-background/90 border border-border shadow-md backdrop-blur-md text-foreground hover:bg-accent"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5 text-primary" />
        </button>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <aside
              className="absolute left-0 top-0 h-full w-[280px] bg-sidebar border-r border-sidebar-border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Scale className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-base">VDL Juris</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <SidebarContent
                items={grouped}
                currentView={currentView}
                onSelect={(v) => {
                  setView(v);
                  setMobileOpen(false);
                }}
                onOpenAi={() => {
                  setAiPanelOpen(true);
                  setMobileOpen(false);
                }}
                collapsed={false}
              />
            </aside>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  const collapsed = sidebarCollapsed;
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-hidden sticky top-0 z-20",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      <SidebarContent
        items={grouped}
        currentView={currentView}
        onSelect={setView}
        onOpenAi={() => setAiPanelOpen(true)}
        collapsed={collapsed}
      />
    </aside>
  );
}

interface SidebarContentProps {
  items: Record<string, NavItem[]>;
  currentView: ViewKey;
  onSelect: (v: ViewKey) => void;
  onOpenAi: () => void;
  collapsed: boolean;
}

function SidebarContent({
  items,
  currentView,
  onSelect,
  onOpenAi,
  collapsed,
}: SidebarContentProps) {
  const { toggleSidebar } = useAppStore();

  return (
    <div className="flex flex-col h-full min-h-0 w-full overflow-hidden">
      {/* Header do Menu */}
      <div className="flex items-center justify-between px-3.5 h-16 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <Scale className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none overflow-hidden">
              <span className="font-bold text-[15px] tracking-tight truncate">
                VDL Juris
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                v2 · 2026
              </span>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-sidebar-accent shrink-0 ml-auto"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Botão Copiloto */}
      <div className="px-3 pt-3 shrink-0">
        <Button
          onClick={onOpenAi}
          className={cn(
            "w-full justify-start gap-2 bg-gradient-to-r from-primary to-chart-2 hover:opacity-90 text-primary-foreground shadow-glow",
            collapsed && "px-0 justify-center"
          )}
          size={collapsed ? "icon" : "default"}
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Pergunte ao Copiloto</span>}
        </Button>
      </div>

      {/* Lista de Navegação com Rolagem Suave */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-5">
        <NavGroup
          title={collapsed ? "" : "Operação"}
          items={items.principal}
          currentView={currentView}
          onSelect={onSelect}
          collapsed={collapsed}
        />
        <NavGroup
          title={collapsed ? "" : "Inteligência"}
          items={items.inteligencia}
          currentView={currentView}
          onSelect={onSelect}
          collapsed={collapsed}
        />
        <NavGroup
          title={collapsed ? "" : "Conta"}
          items={items.config}
          currentView={currentView}
          onSelect={onSelect}
          collapsed={collapsed}
        />
      </div>
    </div>
  );
}

function NavGroup({
  title,
  items,
  currentView,
  onSelect,
  collapsed,
}: {
  title: string;
  items: NavItem[];
  currentView: ViewKey;
  onSelect: (v: ViewKey) => void;
  collapsed: boolean;
}) {
  return (
    <div>
      {title && (
        <div className="px-3 mb-1.5 text-xs uppercase tracking-widest text-muted-foreground/70 font-semibold">
          {title}
        </div>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = currentView === item.key;
          const Icon = item.icon;
          return (
            <li key={item.key}>
              <button
                onClick={() => onSelect(item.key)}
                className={cn(
                  "w-full group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive && "text-primary"
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge ? (
                      <Badge
                        variant={isActive ? "default" : "secondary"}
                        className={cn(
                          "h-5 px-1.5 text-xs tabular-nums",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    ) : null}
                  </>
                )}
                {collapsed && item.badge ? (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

