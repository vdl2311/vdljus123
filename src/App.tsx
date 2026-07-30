import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { CommandPalette } from "@/components/command-palette";
import { AiChatPanel } from "@/components/ai-chat-panel";
import { DashboardView } from "@/components/views/dashboard-view";
import { ProcessosView } from "@/components/views/processos-view";
import { ProcessoDetalheView } from "@/components/views/processo-detalhe-view";
import { ClientesView } from "@/components/views/clientes-view";
import { TarefasView } from "@/components/views/tarefas-view";
import { DocumentosView } from "@/components/views/documentos-view";
import { CopilotoView } from "@/components/views/copiloto-view";
import { InboxView } from "@/components/views/inbox-view";
import { BuscaView } from "@/components/views/busca-view";
import { AutomacoesView } from "@/components/views/automacoes-view";
import { PortalClienteView } from "@/components/views/portal-cliente-view";
import { ConfiguracoesView } from "@/components/views/configuracoes-view";
import { CopilotoProativoView } from "@/components/views/copiloto-proativo-view";
import { CalendarioView } from "@/components/views/calendario-view";
import { NotificacoesView } from "@/components/views/notificacoes-view";
import { PesquisaGlobalView } from "@/components/views/pesquisa-global-view";
import { FinanceiroView } from "@/components/views/financeiro-view";
import { MapaProcessosView } from "@/components/views/mapa-processos-view";
import { JurisprudenciaView } from "@/components/views/jurisprudencia-view";
import { EstrategicoView } from "@/components/views/estrategico-view";
import { EquipeView } from "@/components/views/equipe-view";
import { ConflitoInteresseView } from "@/components/views/conflito-interesse-view";
import { ComplianceView } from "@/components/views/compliance-view";
import { ContratosView } from "@/components/views/contratos-view";
import { ConhecimentoView } from "@/components/views/conhecimento-view";
import { PrazosView } from "@/components/views/prazos-view";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoginScreen } from "@/components/auth/login-screen";
import { useAppStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/sonner";

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
              transition={{ duration: 0.2 }}
            >
              <ErrorBoundary key={currentView}>{renderView()}</ErrorBoundary>
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
