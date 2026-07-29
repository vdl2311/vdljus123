"use client";

import * as React from "react";
import {
  Scale,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    loginWithEmail,
    signUpWithEmail,
    resetPassword,
    loginWithGoogle,
    loginWithGithub,
    authError,
    setAuthError,
  } = useAppStore();

  const [tab, setTab] = React.useState<"login" | "signup" | "recover">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [nome, setNome] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [resetSent, setResetSent] = React.useState(false);

  // Clear error on tab change
  React.useEffect(() => {
    setAuthError(null);
    setResetSent(false);
  }, [tab, setAuthError]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const res = await loginWithEmail(email, password);
    setLoading(false);
    if (res.success) {
      onOpenChange(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !nome) return;
    if (password !== confirmPassword) {
      setAuthError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const res = await signUpWithEmail(email, password, nome);
    setLoading(false);
    if (res.success) {
      onOpenChange(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const res = await resetPassword(email);
    setLoading(false);
    if (res.success) {
      setResetSent(true);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border-border shadow-2xl">
        <div className="bg-gradient-to-b from-primary/10 via-background to-background p-6 border-b border-border">
          <DialogHeader className="space-y-2 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
              <Scale className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              JurisFlow · Acesso Seguro
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Sistema de Gestão Jurídica com Controle de Acesso Restrito
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          {/* Admin authorization policy banner */}
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs flex items-start gap-2.5 text-amber-700 dark:text-amber-400">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold leading-tight">Acesso por E-mail Autorizado</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Somente e-mails previamente liberados pelo administrador têm permissão de acesso ao sistema.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {authError && (
            <Alert variant="destructive" className="py-2.5 text-xs">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-xs font-semibold">Acesso Bloqueado</AlertTitle>
              <AlertDescription className="text-[11px]">{authError}</AlertDescription>
            </Alert>
          )}

          {tab === "recover" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setTab("login")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span>Recuperação de Senha</span>
              </div>

              {resetSent ? (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                    Instruções Enviadas!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enviamos um e-mail para <strong className="text-foreground">{email}</strong> com o link para redefinir sua senha.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs w-full"
                    onClick={() => setTab("login")}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">E-mail Cadastrado</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        required
                        placeholder="seu.email@escritorio.com.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 text-xs"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Você receberá um e-mail com instruções para criar uma nova senha.
                    </p>
                  </div>

                  <Button type="submit" className="w-full gap-2 text-xs" disabled={loading}>
                    <KeyRound className="h-4 w-4" />
                    {loading ? "Enviando..." : "Enviar E-mail de Redefinição"}
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="text-xs">
                  Entrar com E-mail
                </TabsTrigger>
                <TabsTrigger value="signup" className="text-xs">
                  Criar Conta
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        required
                        placeholder="seu.email@escritorio.com.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Senha</Label>
                      <button
                        type="button"
                        onClick={() => setTab("recover")}
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 pr-9 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full text-xs gap-2 mt-1" disabled={loading}>
                    {loading ? "Entrando..." : "Acessar Sistema"}
                  </Button>
                </form>
              </TabsContent>

              {/* SignUp Tab */}
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        required
                        placeholder="Dra. Mariana Vidal"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="pl-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">E-mail (Deve estar pré-autorizado)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        required
                        placeholder="seu.email@escritorio.com.br"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Senha</Label>
                      <Input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Confirmar Senha</Label>
                      <Input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full text-xs gap-2 mt-1" disabled={loading}>
                    {loading ? "Criando conta..." : "Criar Minha Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {/* Social Auth Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">
                Ou acesse com provedor social
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-2"
              onClick={loginWithGoogle}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
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
              className="text-xs gap-2"
              onClick={loginWithGithub}
            >
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
