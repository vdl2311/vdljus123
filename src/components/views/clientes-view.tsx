"use client";

import * as React from "react";
import {
  Search,
  Plus,
  Users,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  FileText,
  ChevronRight,
  Calendar,
  Briefcase,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import type { Cliente } from "@/lib/types";
import { applyMask } from "@/lib/format";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function ClientesView() {
  const { clientes, processos, addCliente, openProcesso } = useAppStore();
  const [search, setSearch] = React.useState("");
  const [showNew, setShowNew] = React.useState(false);

  const filtered = React.useMemo(() => {
    return clientes.filter((c) => {
      const q = search.toLowerCase();
      return (
        !q ||
        c.nome.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.cpfCnpj.toLowerCase().includes(q) ||
        c.endereco.cidade.toLowerCase().includes(q)
      );
    });
  }, [clientes, search]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail, CPF/CNPJ, cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={showNew} onOpenChange={setShowNew}>
              <DialogTrigger asChild>
                <Button className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Novo Cliente
                </Button>
              </DialogTrigger>
              <NovoClienteDialog
                onSave={(c) => {
                  addCliente(c);
                  setShowNew(false);
                  toast.success("Cliente cadastrado!");
                }}
              />
            </Dialog>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{filtered.length}</span> de{" "}
              <span className="font-medium text-foreground">{clientes.length}</span> clientes
            </p>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success" />
                {clientes.filter((c) => c.status === "Ativo").length} ativos
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-info" />
                {clientes.filter((c) => c.status === "Potencial").length} potenciais
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c, idx) => (
          <ClienteCard
            key={c.id}
            cliente={c}
            totalProcessos={
              processos.filter((p) => p.clienteId === c.id).length
            }
            processosAtivos={
              processos.filter(
                (p) =>
                  p.clienteId === c.id &&
                  (p.status === "Ativo" || p.status === "Em Recurso")
              ).length
            }
            onOpenProcesso={openProcesso}
            index={idx}
          />
        ))}
      </div>
    </div>
  );
}

function ClienteCard({
  cliente,
  totalProcessos,
  processosAtivos,
  onOpenProcesso,
  index,
}: {
  key?: React.Key;
  cliente: Cliente;
  totalProcessos: number;
  processosAtivos: number;
  onOpenProcesso: (id: string) => void;
  index: number;
}) {
  const { processos, removeCliente } = useAppStore();
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const clienteProcessos = processos.filter((p) => p.clienteId === cliente.id);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await removeCliente(cliente.id);
      toast.success(`Cliente "${cliente.nome}" excluído com sucesso!`);
      setShowConfirmDelete(false);
    } catch (e) {
      toast.error("Erro ao excluir cliente");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card className="overflow-hidden hover:shadow-elevated hover:border-primary/30 transition-all">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="h-11 w-11 shrink-0">
              <AvatarFallback
                className={cn(
                  "bg-gradient-to-br text-primary-foreground font-semibold",
                  cliente.tipo === "PJ"
                    ? "from-chart-2 to-primary"
                    : "from-primary to-chart-3"
                )}
              >
                {cliente.tipo === "PJ" ? (
                  <Building2 className="h-5 w-5" />
                ) : (
                  cliente.nome
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight truncate">
                  {cliente.nome}
                </h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      cliente.status === "Ativo" && "border-success/40 text-success",
                      cliente.status === "Potencial" && "border-info/40 text-info",
                      cliente.status === "Inativo" && "border-muted-foreground/40"
                    )}
                  >
                    {cliente.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Excluir cliente"
                    onClick={() => setShowConfirmDelete(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {cliente.tipo === "PJ" ? "Pessoa Jurídica" : "Pessoa Física"} ·{" "}
                {cliente.cpfCnpj}
              </p>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-xs">
              <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate text-muted-foreground">{cliente.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">{cliente.telefone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground truncate">
                {cliente.endereco.cidade}/{cliente.endereco.uf}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Processos
              </p>
              <p className="text-base font-bold tabular-nums">{totalProcessos}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Ativos
              </p>
              <p className="text-base font-bold tabular-nums text-primary">
                {processosAtivos}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Desde
              </p>
              <p className="text-base font-bold tabular-nums">
                {format(new Date(cliente.dataCadastro), "MMM/yy", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Notas */}
          {cliente.historicoNotas && (
            <p className="text-xs text-muted-foreground mt-3 line-clamp-2 italic">
              "{cliente.historicoNotas}"
            </p>
          )}

          {/* Processos vinculados */}
          {clienteProcessos.length > 0 && (
            <div className="mt-3 pt-3 border-t space-y-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                Processos vinculados
              </p>
              {clienteProcessos.slice(0, 2).map((p) => (
                <button
                  key={p.id}
                  onClick={() => onOpenProcesso(p.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors text-left"
                >
                  <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs font-mono flex-1 truncate">{p.numeroCnj}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Excluir Cliente
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground space-y-2">
            <p>
              Tem certeza que deseja excluir o cliente <strong className="text-foreground">{cliente.nome}</strong> ({cliente.cpfCnpj})?
            </p>
            {totalProcessos > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-md border border-amber-500/20">
                Atenção: Este cliente possui <strong>{totalProcessos} processo(s) vinculado(s)</strong> no sistema.
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-1.5"
            >
              {isDeleting ? "Excluindo..." : "Sim, Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function cn(...args: any[]) {
  return args.filter(Boolean).join(" ");
}

function NovoClienteDialog({ onSave }: { onSave: (c: Cliente) => void }) {
  const [nome, setNome] = React.useState("");
  const [tipo, setTipo] = React.useState<"PF" | "PJ">("PF");
  const [cpfCnpj, setCpfCnpj] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [cidade, setCidade] = React.useState("");
  const [uf, setUf] = React.useState("");

  const handleTipoChange = (newTipo: "PF" | "PJ") => {
    setTipo(newTipo);
    if (cpfCnpj) {
      const masked = applyMask(cpfCnpj, newTipo === "PF" ? "cpf" : "cnpj");
      setCpfCnpj(masked);
    }
  };

  function salvar() {
    if (!nome || !cpfCnpj) {
      toast.error("Preencha nome e " + (tipo === "PF" ? "CPF" : "CNPJ"));
      return;
    }

    const digits = cpfCnpj.replace(/\D/g, "");
    if (tipo === "PF" && digits.length !== 11) {
      toast.error("O CPF deve conter exatamente 11 dígitos");
      return;
    }
    if (tipo === "PJ" && digits.length !== 14) {
      toast.error("O CNPJ deve conter exatamente 14 dígitos");
      return;
    }

    const novo: Cliente = {
      id: `c-${Date.now()}`,
      nome,
      tipo,
      cpfCnpj,
      email,
      telefone,
      endereco: { logradouro: "", cidade, uf, cep: "" },
      historicoNotas: "",
      processosVinculados: [],
      dataCadastro: new Date().toISOString(),
      status: "Ativo",
    };
    onSave(novo);
    setNome("");
    setCpfCnpj("");
    setEmail("");
    setTelefone("");
    setCidade("");
    setUf("");
  }

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>Cadastrar novo cliente</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3 py-2">
        <div className="grid gap-2">
          <Label htmlFor="cliente-nome">Nome / Razão Social</Label>
          <Input id="cliente-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder={tipo === "PF" ? "Ex: Ana Silva" : "Ex: TechNova Soluções S/A"} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="cliente-tipo">Tipo</Label>
            <Select value={tipo} onValueChange={(v) => handleTipoChange(v as any)}>
              <SelectTrigger id="cliente-tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PF">Pessoa Física</SelectItem>
                <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cliente-cpf-cnpj">{tipo === "PF" ? "CPF" : "CNPJ"}</Label>
            <Input
              id="cliente-cpf-cnpj"
              mask={tipo === "PF" ? "cpf" : "cnpj"}
              maxLength={tipo === "PF" ? 14 : 18}
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              placeholder={tipo === "PF" ? "000.000.000-00" : "00.000.000/0001-00"}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cliente-email">E-mail</Label>
          <Input id="cliente-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@empresa.com.br" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="cliente-telefone">Telefone</Label>
            <Input id="cliente-telefone" mask="phone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cliente-cidade">Cidade / UF</Label>
            <div className="flex gap-2">
              <Input id="cliente-cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="São Paulo" />
              <Input id="cliente-uf" aria-label="UF" value={uf} onChange={(e) => setUf(e.target.value)} placeholder="SP" maxLength={2} className="w-16" />
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={salvar}>Cadastrar cliente</Button>
      </DialogFooter>
    </DialogContent>
  );
}
