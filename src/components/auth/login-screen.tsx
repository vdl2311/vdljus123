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
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAppStore } from "@/lib/store";

export function LoginScreen() {
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

  React.useEffect(() => {
    setAuthError(null);
    setResetSent(false);
  }, [tab, setAuthError]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await loginWithEmail(email, password);
    setLoading(false);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !nome) return;
    if (password !== confirmPassword) {
      setAuthError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    await signUpWithEmail(email, password, nome);
    setLoading(false);
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 relative overflow-hidden">
      {/* Background Decorative Blur Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 mb-1">
            <Scale className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">JurisFlow</h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Plataforma de Gestão Jurídica Inteligente & Acompanhamento Processual
          </p>
        </div>

        {/* Main Card */}
        <Card className="border-border/80 shadow-xl backdrop-blur-sm bg-card/95 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 via-transparent to-transparent pb-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Acesso Restrito</CardTitle>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium px-2 py-0.5 rounded-full border border-amber-500/20">
                E-mail Autorizado
              </span>
            </div>
            <CardDescription className="text-xs mt-1">
              Somente usuários com e-mail pré-autorizado pelo administrador conseguem acessar.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5 space-y-4">
            {/* Error Message */}
            {authError && (
              <Alert variant="destructive" className="py-2.5 text-xs">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs font-semibold">Falha na Autenticação</AlertTitle>
                <AlertDescription className="text-[11px] mt-0.5">{authError}</AlertDescription>
              </Alert>
            )}

            {tab === "recover" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTab("login")}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span>Recuperar Senha</span>
                </div>

                {resetSent ? (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                    <div>
                      <h4 className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                        E-mail de redefinição enviado!
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Verifique a caixa de entrada de <strong className="text-foreground">{email}</strong> com as instruções para redefinir sua senha.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setTab("login")}
                    >
                      Voltar para o Login
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Seu E-mail Cadastrado</Label>
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
                        Enviaremos um link de redefinição de senha para este e-mail.
                      </p>
                    </div>

                    <Button type="submit" className="w-full gap-2 text-xs" disabled={loading}>
                      <KeyRound className="h-4 w-4" />
                      {loading ? "Enviando..." : "Enviar Instruções por E-mail"}
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
                <TabsContent value="login" className="space-y-3.5">
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

                    <Button type="submit" className="w-full text-xs gap-2 pt-1" disabled={loading}>
                      {loading ? "Autenticando..." : "Entrar no Sistema"}
                    </Button>
                  </form>
                </TabsContent>

                {/* SignUp Tab */}
                <TabsContent value="signup" className="space-y-3.5">
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
                      <Label className="text-xs">E-mail Autorizado</Label>
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
                      <p className="text-[10px] text-muted-foreground">
                        Deve ter sido previamente autorizado pelo administrador.
                      </p>
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

                    <Button type="submit" className="w-full text-xs gap-2 pt-1" disabled={loading}>
                      {loading ? "Criando conta..." : "Cadastrar Minha Conta"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            {/* Social Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">
                  Ou acesse com sua conta social
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
          </CardContent>

          <CardFooter className="bg-muted/30 border-t border-border/40 py-3 text-center justify-center">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-primary" />
              JurisFlow · Sistema protegido com criptografia ponta a ponta
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
