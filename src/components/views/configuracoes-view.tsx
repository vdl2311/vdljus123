"use client";

import * as React from "react";
import {
  User,
  Bell,
  Palette,
  Shield,
  Database,
  CreditCard,
  Sparkles,
  Check,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store";
import { currentUser } from "@/lib/seed-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { AuthModal } from "@/components/auth/auth-modal";
import { AuthorizedEmailsManager } from "@/components/auth/authorized-emails-manager";
import { Mail, KeyRound } from "lucide-react";

export function ConfiguracoesView() {
  const { theme, setTheme } = useTheme();
  const { user, loginWithGoogle, loginWithGithub, logout } = useAppStore();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [notificacoes, setNotificacoes] = React.useState({
    datajud: true,
    prazos: true,
    resumoIa: true,
    email: false,
    mobile: true,
  });
  const [iaPrefs, setIaPrefs] = React.useState({
    autoResumo: true,
    autoAnaliseDoc: true,
    autoTriagemInbox: true,
    geracaoPecas: true,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Sidebar de seções */}
      <Card className="lg:col-span-1 h-fit">
        <CardContent className="p-3">
          <nav className="space-y-1">
            {[
              { id: "perfil", label: "Perfil & Conta", icon: User },
              { id: "tema", label: "Aparência", icon: Palette },
              { id: "notificacoes", label: "Notificações", icon: Bell },
              { id: "ia", label: "Preferências de IA", icon: Sparkles },
              { id: "seguranca", label: "Segurança", icon: Shield },
              { id: "integracoes", label: "Integrações", icon: Database },
              { id: "plano", label: "Plano & Faturamento", icon: CreditCard },
            ].map((s) => (
              <button
                key={s.id}
                className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent/50 transition-colors text-sm text-left"
              >
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <span>{s.label}</span>
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* Conteúdo */}
      <div className="lg:col-span-2 space-y-4">
        {/* Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <User className="h-4 w-4" />
              Perfil & Autenticação (Firebase Auth)
            </CardTitle>
            <CardDescription>Suas informações pessoais, profissional e login de conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground text-lg font-semibold">
                  {(user?.displayName || currentUser.nome)
                    .split(" ")
                    .slice(0, 2)
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-semibold">{user?.displayName || currentUser.nome}</p>
                <p className="text-xs text-muted-foreground">{user?.email || currentUser.email}</p>
                <Badge variant="outline" className="text-[10px] mt-1">
                  {user ? `Autenticado via Firebase (${user.providerData?.[0]?.providerId || 'Auth'})` : 'Sessão Local'}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground w-full mb-1">Entrar ou Vincular Conta:</p>

              <Button
                variant="default"
                size="sm"
                className="gap-2 text-xs"
                onClick={() => setShowAuthModal(true)}
              >
                <Mail className="h-4 w-4" />
                Login com E-mail / Criar Conta
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={loginWithGoogle}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs"
                onClick={loginWithGithub}
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
              </Button>

              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:bg-destructive/10"
                  onClick={logout}
                >
                  Sair
                </Button>
              )}
            </div>

            {/* Auth Modal Trigger */}
            <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />


            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nome completo</Label>
                <Input defaultValue={currentUser.nome} className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">E-mail</Label>
                <Input defaultValue={currentUser.email} className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">OAB</Label>
                <Input defaultValue={currentUser.oab} className="text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Escritório</Label>
                <Input defaultValue={currentUser.escritorio} className="text-sm" />
              </div>
            </div>
            <Button onClick={() => toast.success("Perfil atualizado!")}>Salvar alterações</Button>
          </CardContent>
        </Card>

        {/* Gerenciador de E-mails Autorizados */}
        <AuthorizedEmailsManager />

        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <Palette className="h-4 w-4" />
              Aparência
            </CardTitle>
            <CardDescription>Personalize a interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs mb-2 block">Tema</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "light", label: "Claro", icon: Sun },
                  { value: "dark", label: "Escuro", icon: Moon },
                  { value: "system", label: "Sistema", icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      theme === t.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <t.icon
                      className={cn(
                        "h-5 w-5",
                        theme === t.value ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="text-xs font-medium">{t.label}</span>
                    {theme === t.value && (
                      <Check className="h-3 w-3 text-primary absolute top-1.5 right-1.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Animações</p>
                <p className="text-xs text-muted-foreground">Transições suaves entre views</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sidebar compacta</p>
                <p className="text-xs text-muted-foreground">Reduz largura do menu lateral</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <Bell className="h-4 w-4" />
              Notificações
            </CardTitle>
            <CardDescription>Como você quer ser avisado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { key: "datajud", label: "Movimentações DataJud", desc: "Avisar sobre novas movimentações processuais" },
              { key: "prazos", label: "Prazos fatais", desc: "Alertar sobre prazos próximos" },
              { key: "resumoIa", label: "Resumos automáticos da IA", desc: "Quando a IA gerar novo resumo" },
              { key: "email", label: "E-mail de resumo diário", desc: "Receba um digest diário às 8h" },
              { key: "mobile", label: "Notificações push mobile", desc: "No celular (app JurisFlow Mobile)" },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch
                  checked={notificacoes[n.key as keyof typeof notificacoes]}
                  onCheckedChange={(v) =>
                    setNotificacoes((prev) => ({ ...prev, [n.key]: v }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preferências de IA */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              Preferências de IA
            </CardTitle>
            <CardDescription>Controle os recursos automáticos do Copiloto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {[
              { key: "autoResumo", label: "Resumo automático de processos", desc: "Gera resumo IA ao importar processo" },
              { key: "autoAnaliseDoc", label: "Análise automática de documentos", desc: "Extrai entidades ao fazer upload" },
              { key: "autoTriagemInbox", label: "Triagem automática do inbox", desc: "Classifica por prioridade de ação" },
              { key: "geracaoPecas", label: "Sugestões de peças", desc: "Sugere rascunhos no contexto do processo" },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch
                  checked={iaPrefs[n.key as keyof typeof iaPrefs]}
                  onCheckedChange={(v) =>
                    setIaPrefs((prev) => ({ ...prev, [n.key]: v }))
                  }
                />
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-medium">Modelo de IA</p>
                <p className="text-xs text-muted-foreground">GLM-4 — JurisFlow Premium</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Check className="h-3 w-3" /> Ativo
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Integrações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <Database className="h-4 w-4" />
              Integrações
            </CardTitle>
            <CardDescription>Conexões com serviços externos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                nome: "DataJud (CNJ)",
                desc: "Sincronização automática de processos",
                status: "conectado",
              },
              {
                nome: "Diário Oficial (SP/RJ/MG)",
                desc: "Monitoramento automático de publicações",
                status: "conectado",
              },
              {
                nome: "PJe / eProc",
                desc: "Peticionamento eletrônico integrado",
                status: "pendente",
              },
              {
                nome: "WhatsApp Business API",
                desc: "Notificações ao cliente via WhatsApp",
                status: "disponivel",
              },
              {
                nome: "Calendário Google / Outlook",
                desc: "Sincronização de prazos e audiências",
                status: "disponivel",
              },
            ].map((i) => (
              <div
                key={i.nome}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{i.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{i.desc}</p>
                </div>
                {i.status === "conectado" ? (
                  <Badge variant="outline" className="border-success/40 text-success gap-1">
                    <Check className="h-3 w-3" /> Conectado
                  </Badge>
                ) : i.status === "pendente" ? (
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    Configurar
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    Conectar
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Plano */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-chart-2/5">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" />
              Plano & Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Plano Pro</p>
                <p className="text-xs text-muted-foreground">Renovação em 15/08/2026</p>
              </div>
              <Badge className="bg-primary/15 text-primary border-primary/20">Ativo</Badge>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Processos</p>
                <p className="font-medium">Ilimitados</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Usuários</p>
                <p className="font-medium">8 incluídos</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">IA Copiloto</p>
                <p className="font-medium">Ilimitado</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">DataJud</p>
                <p className="font-medium">Sincronização 1h</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Gerenciar plano
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
