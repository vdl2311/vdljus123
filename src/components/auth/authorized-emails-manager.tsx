"use client";

import * as React from "react";
import { ShieldCheck, Plus, Trash2, Mail, Check, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

export function AuthorizedEmailsManager() {
  const { emailsAutorizados, addEmailAutorizado, removeEmailAutorizado, user } = useAppStore();
  const [newEmail, setNewEmail] = React.useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    await addEmailAutorizado(newEmail);
    setNewEmail("");
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-semibold">
                E-mails Autorizados pelo Administrador
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Controle quem tem permissão para criar conta ou fazer login via e-mail e senha
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
            {emailsAutorizados.length} autorizados
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Adicionar novo e-mail */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="novo.usuario@escritorio.com.br"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <Button type="submit" size="sm" className="gap-1.5 text-xs">
            <Plus className="h-4 w-4" />
            Autorizar E-mail
          </Button>
        </form>

        <div className="rounded-lg border border-border divide-y divide-border max-h-[260px] overflow-y-auto">
          {emailsAutorizados.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Nenhum e-mail pré-autorizado. Cadastre o primeiro acima.
            </div>
          ) : (
            emailsAutorizados.map((email) => {
              const isCurrentUser = user?.email?.toLowerCase() === email.toLowerCase();
              return (
                <div
                  key={email}
                  className="flex items-center justify-between p-3 hover:bg-accent/40 transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium truncate">{email}</span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs py-0 px-1.5 h-4">
                        Sua conta
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeEmailAutorizado(email)}
                    title="Remover autorização"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-md">
          <Info className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
          <p>
            Tentativas de login ou cadastro com e-mails que não constam na lista acima serão automaticamente recusadas e a sessão será bloqueada.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
