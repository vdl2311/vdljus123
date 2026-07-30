import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { CommandPalette } from "@/components/command-palette";
import { AiChatPanel } from "@/components/ai-chat-panel";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoginScreen } from "@/components/auth/login-screen";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Code splitting (React.lazy) for views to improve bundle performance & UX
const DashboardView = React.lazy(() => import("@/components/views/dashboard-view").then(m => ({ default: m.DashboardView })));
const ProcessosView = React.lazy(() => import("@/components/views/processos-view").then(m => ({ default: m.ProcessosView })));
const ProcessoDetalheView = React.lazy(() => import("@/components/views/processo-detalhe-view").then(m => ({ default: m.ProcessoDetalheView })));
const ClientesView = React.lazy(() => import("@/components/views/clientes-view").then(m => ({ default: m.ClientesView })));
const TarefasView = React.lazy(() => import("@/components/views/tarefas-view").then(m => ({ default: m.TarefasView })));
const DocumentosView = React.lazy(() => import("@/components/views/documentos-view").then(m => ({ default: m.DocumentosView })));
const CopilotoView = React.lazy(() => import("@/components/views/copiloto-view").then(m => ({ default: m.CopilotoView })));
const InboxView = React.lazy(() => import("@/components/views/inbox-view").then(m => ({ default: m.InboxView })));
const BuscaView = React.lazy(() => import("@/components/views/busca-view").then(m => ({ default: m.BuscaView })));
const AutomacoesView = React.lazy(() => import("@/components/views/automacoes-view").then(m => ({ default: m.AutomacoesView })));
const PortalClienteView = React.lazy(() => import("@/components/views/portal-cliente-view").then(m => ({ default: m.PortalClienteView })));
const ConfiguracoesView = React.lazy(() => import("@/components/views/configuracoes-view").then(m => ({ default: m.ConfiguracoesView })));
const CopilotoProativoView = React.lazy(() => import("@/components/views/copiloto-proativo-view").then(m => ({ default: m.CopilotoProativoView })));
const CalendarioView = React.lazy(() => import("@/components/views/calendario-view").then(m => ({ default: m.CalendarioView })));
const NotificacoesView = React.lazy(() => import("@/components/views/notificacoes-view").then(m => ({ default: m.NotificacoesView })));
const PesquisaGlobalView = React.lazy(() => import("@/components/views/pesquisa-global-view").then(m => ({ default: m.PesquisaGlobalView })));
const FinanceiroView = React.lazy(() => import("@/components/views/financeiro-view").then(m => ({ default: m.FinanceiroView })));
const MapaProcessosView = React.lazy(() => import("@/components/views/mapa-processos-view").then(m => ({ default: m.MapaProcessosView })));
const JurisprudenciaView = React.lazy(() => import("@/components/views/jurisprudencia-view").then(m => ({ default: m.JurisprudenciaView })));
const EstrategicoView = React.lazy(() => import("@/components/views/estrategico-view").then(m => ({ default: m.EstrategicoView })));
const EquipeView = React.lazy(() => import("@/components/views/equipe-view").then(m => ({ default: m.EquipeView })));
const ConflitoInteresseView = React.lazy(() => import("@/components/views/conflito-interesse-view").then(m => ({ default: m.ConflitoInteresseView })));
const ComplianceView = React.lazy(() => import("@/components/views/compliance-view").then(m => ({ default: m.ComplianceView })));
const ContratosView = React.lazy(() => import("@/components/views/contratos-view").then(m => ({ default: m.ContratosView })));
const ConhecimentoView = React.lazy(() => import("@/components/views/conhecimento-view").then(m => ({ default: m.ConhecimentoView })));
const PrazosView = React.lazy(() => import("@/components/views/prazos-view").then(m => ({ default: m.PrazosView })));

function ViewFallback() {
  return (
    <div className="space-y-4 p-2 animate-pulse" role="status" aria-label="Carregando visualização...">
      <div className="h-8 w-48 bg-muted rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-muted/60 rounded-xl" />
        <div className="h-32 bg-muted/60 rounded-xl" />
        <div className="h-32 bg-muted/60 rounded-xl" />
      </div>
      <div className="h-64 bg-muted/40 rounded-xl" />
    </div>
  );
}

export default function App() {
  const { currentView, initFirebase, user } = useAppStore();

  React.useEffect(() => {
    initFirebase();
  }, [initFirebase]);

  if (!user) {
    return (
      <>
        <LoginScreen />
        <Toaster position="top-right" />
      </>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "processos":
        return <ProcessosView />;
      case "processo-detalhe":
        return <ProcessoDetalheView />;
      case "clientes":
        return <ClientesView />;
      case "tarefas":
        return <TarefasView />;
      case "documentos":
        return <DocumentosView />;
      case "calendario":
        return <CalendarioView />;
      case "financeiro":
        return <FinanceiroView />;
      case "equipe":
        return <EquipeView />;
      case "copiloto":
        return <CopilotoView />;
      case "copiloto-proativo":
        return <CopilotoProativoView />;
      case "inbox":
        return <InboxView />;
      case "busca":
        return <BuscaView />;
      case "pesquisa-global":
        return <PesquisaGlobalView />;
      case "automacoes":
        return <AutomacoesView />;
      case "jurisprudencia":
        return <JurisprudenciaView />;
      case "estrategico":
        return <EstrategicoView />;
      case "mapa-processos":
        return <MapaProcessosView />;
      case "notificacoes":
        return <NotificacoesView />;
      case "portal-cliente":
        return <PortalClienteView />;
      case "configuracoes":
        return <ConfiguracoesView />;
      case "conflito-interesse":
        return <ConflitoInteresseView />;
      case "compliance":
        return <ComplianceView />;
      case "contratos":
        return <ContratosView />;
      case "conhecimento":
        return <ConhecimentoView />;
      case "prazos":
        return <PrazosView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans text-foreground">
      {/* WCAG 2.4.1 Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-3 focus:bg-emerald-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Pular para o conteúdo principal
      </a>

      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppHeader />

        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6" id="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
            >
              <ErrorBoundary key={currentView}>
                <React.Suspense fallback={<ViewFallback />}>
                  {renderView()}
                </React.Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette />
      <AiChatPanel />
      <Toaster position="top-right" />
    </div>
  );
}
