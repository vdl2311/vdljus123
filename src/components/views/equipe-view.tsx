"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  TrendingUp,
  X,
  Save,
  Scale,
  UserCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/lib/store";
import {
  membrosEquipe as membrosIniciais,
  papeisEquipe,
  permissoesCatalogo,
} from "@/lib/seed-data";
import type { MembroEquipe, UserRole, Permissao, PapelEquipeConfig } from "@/lib/types";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { AuthorizedEmailsManager } from "@/components/auth/authorized-emails-manager";

const statusConfig: Record<
  MembroEquipe["status"],
  { color: string; bg: string; label: string; dot: string }
> = {
  ativo: { color: "text-success", bg: "border-success/40 bg-success/5", label: "Ativo", dot: "bg-success" },
  inativo: { color: "text-muted-foreground", bg: "border-muted-foreground/30", label: "Inativo", dot: "bg-muted-foreground" },
  ferias: { color: "text-info", bg: "border-info/40 bg-info/5", label: "Férias", dot: "bg-info" },
  afastado: { color: "text-warning", bg: "border-warning/40 bg-warning/5", label: "Afastado", dot: "bg-warning" },
};

const papelIcon: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  socio: Award,
  advogado: Scale,
  secretaria: UserCircle,
  estagiario: GraduationCap,
};

export function EquipeView() {
  const [membros, setMembros] = React.useState<MembroEquipe[]>(membrosIniciais);
  const [search, setSearch] = React.useState("");
  const [filtroPapel, setFiltroPapel] = React.useState<UserRole | "todos">("todos");
  const [showDialog, setShowDialog] = React.useState(false);
  const [editingMembro, setEditingMembro] = React.useState<MembroEquipe | null>(null);
  const [showPermissoes, setShowPermissoes] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    return membros.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        m.nome.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.oab || "").toLowerCase().includes(q);
      const matchPapel = filtroPapel === "todos" || m.papel === filtroPapel;
      return matchSearch && matchPapel;
    });
  }, [membros, search, filtroPapel]);

  // Stats por papel
  const stats = React.useMemo(() => {
    return {
      total: membros.length,
      socios: membros.filter((m) => m.papel === "socio").length,
      advogados: membros.filter((m) => m.papel === "advogado").length,
      secretarias: membros.filter((m) => m.papel === "secretaria").length,
      estagiarios: membros.filter((m) => m.papel === "estagiario").length,
      ativos: membros.filter((m) => m.status === "ativo").length,
      ferias: membros.filter((m) => m.status === "ferias").length,
      afastados: membros.filter((m) => m.status === "afastado").length,
    };
  }, [membros]);

  function handleSave(membro: MembroEquipe) {
    if (editingMembro) {
      setMembros((prev) => prev.map((m) => (m.id === membro.id ? membro : m)));
      toast.success(`Membro ${membro.nome} atualizado!`);
    } else {
      setMembros((prev) => [...prev, membro]);
      toast.success(`${membro.nome} adicionado à equipe!`);
    }
    setShowDialog(false);
    setEditingMembro(null);
  }

  function handleDelete(id: string) {
    const membro = membros.find((m) => m.id === id);
    if (window.confirm(`Tem certeza que deseja remover ${membro?.nome || "este membro"}?`)) {
      setMembros((prev) => prev.filter((m) => m.id !== id));
      toast.success(`${membro?.nome || "Membro"} removido da equipe`);
    }
  }

  function handleEdit(membro: MembroEquipe) {
    setEditingMembro(membro);
    setShowDialog(true);
  }

  function handleNovo() {
    setEditingMembro(null);
    setShowDialog(true);
  }

  return (
    <div className="space-y-4">
      {/* Stats por papel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <PapelStatCard
          icon={Award}
          label="Sócios"
          value={stats.socios}
          color="primary"
          onClick={() => setFiltroPapel("socio")}
          active={filtroPapel === "socio"}
        />
        <PapelStatCard
          icon={Scale}
          label="Advogados"
          value={stats.advogados}
          color="chart-2"
          onClick={() => setFiltroPapel("advogado")}
          active={filtroPapel === "advogado"}
        />
        <PapelStatCard
          icon={UserCircle}
          label="Secretárias"
          value={stats.secretarias}
          color="info"
          onClick={() => setFiltroPapel("secretaria")}
          active={filtroPapel === "secretaria"}
        />
        <PapelStatCard
          icon={GraduationCap}
          label="Estagiários"
          value={stats.estagiarios}
          color="warning"
          onClick={() => setFiltroPapel("estagiario")}
          active={filtroPapel === "estagiario"}
        />
      </div>

      {/* Header com busca + novo */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail, OAB..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filtroPapel}
                onValueChange={(v) => setFiltroPapel(v as UserRole | "todos")}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os papéis</SelectItem>
                  {papeisEquipe.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="gap-1.5" onClick={handleNovo}>
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Adicionar Membro</span>
                <span className="sm:hidden">Adicionar</span>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>
                <span className="font-medium text-foreground">{filtered.length}</span> de{" "}
                <span className="font-medium text-foreground">{membros.length}</span> membros
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success" />
                {stats.ativos} ativos
              </span>
              {stats.ferias > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-info" />
                  {stats.ferias} férias
                </span>
              )}
              {stats.afastados > 0 && (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-warning" />
                  {stats.afastados} afastados
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de membros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((m, idx) => (
            <MembroCard
              key={m.id}
              membro={m}
              onEdit={() => handleEdit(m)}
              onDelete={() => handleDelete(m.id)}
              onShowPermissoes={() => setShowPermissoes(m.id)}
              index={idx}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum membro encontrado</p>
            <p className="text-xs mt-1">Ajuste a busca ou adicione um novo membro.</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de adicionar/editar */}
      <MembroDialog
        open={showDialog}
        onOpenChange={(v) => {
          setShowDialog(v);
          if (!v) setEditingMembro(null);
        }}
        membro={editingMembro}
        onSave={handleSave}
      />

      {/* Dialog de permissões */}
      <Dialog open={!!showPermissoes} onOpenChange={(v) => !v && setShowPermissoes(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Permissões — {membros.find((m) => m.id === showPermissoes)?.nome}
            </DialogTitle>
          </DialogHeader>
          <PermissoesView membro={membros.find((m) => m.id === showPermissoes)} />
        </DialogContent>
      </Dialog>

      {/* Gerenciamento de E-mails Autorizados */}
      <AuthorizedEmailsManager />
    </div>
  );
}

function PapelStatCard({
  icon: Icon,
  label,
  value,
  color,
  onClick,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "primary" | "chart-2" | "info" | "warning";
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button onClick={onClick} className="text-left">
      <Card
        className={cn(
          "transition-all hover:shadow-elevated",
          active && "ring-2 ring-primary/30 border-primary/40"
        )}
      >
        <CardContent className="p-3 flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              color === "primary" && "bg-primary/10 text-primary",
              color === "chart-2" && "bg-chart-2/10 text-chart-2",
              color === "info" && "bg-info/10 text-info",
              color === "warning" && "bg-warning/15 text-warning"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-xl font-bold tabular-nums leading-tight">{value}</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function MembroCard({
  membro,
  onEdit,
  onDelete,
  onShowPermissoes,
  index,
}: {
  key?: React.Key;
  membro: MembroEquipe;
  onEdit: () => void;
  onDelete: () => void;
  onShowPermissoes: () => void;
  index: number;
}) {
  const papelCfg = papeisEquipe.find((p) => p.value === membro.papel)!;
  const statusCfg = statusConfig[membro.status];
  const Icon = papelIcon[membro.papel];
  const ultimoAcesso = membro.ultimoAcesso
    ? formatDistanceToNow(new Date(membro.ultimoAcesso), { addSuffix: true, locale: ptBR })
    : "Nunca";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
    >
      <Card className="overflow-hidden hover:shadow-elevated transition-all h-full">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <Avatar className="h-11 w-11 shrink-0">
                <AvatarFallback
                  className={cn(
                    "bg-gradient-to-br text-primary-foreground font-semibold",
                    membro.papel === "socio" && "from-primary to-chart-2",
                    membro.papel === "advogado" && "from-chart-2 to-chart-3",
                    membro.papel === "secretaria" && "from-info to-chart-2",
                    membro.papel === "estagiario" && "from-warning to-chart-4"
                  )}
                >
                  {membro.iniciais}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm leading-tight truncate">{membro.nome}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Icon className={cn("h-3 w-3", papelCfg.cor)} />
                  <span className={cn("text-xs font-medium", papelCfg.cor)}>{papelCfg.label}</span>
                  {membro.oab && (
                    <span className="text-xs text-muted-foreground font-mono">· {membro.oab}</span>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground p-1 -mt-1 -mr-1">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onShowPermissoes}>
                  <Shield className="h-3.5 w-3.5 mr-2" /> Permissões
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-1.5 mb-3">
            <Badge variant="outline" className={cn("text-xs", statusCfg.color, statusCfg.bg)}>
              <span className={cn("h-1.5 w-1.5 rounded-full mr-1", statusCfg.dot)} />
              {statusCfg.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {membro.cargaHoraria}
            </Badge>
          </div>

          {/* Contato */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate text-muted-foreground">{membro.email}</span>
            </div>
            {membro.telefone && (
              <div className="flex items-center gap-2 text-xs">
                <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{membro.telefone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs">
              <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground truncate">{membro.escritorio}</span>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Processos</p>
              <p className="text-base font-bold tabular-nums">{membro.processosAtribuidos}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Tarefas</p>
              <p className="text-base font-bold tabular-nums text-warning">{membro.tarefasPendentes}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Produtiv.</p>
              <p className={cn(
                "text-base font-bold tabular-nums",
                membro.produtividade >= 85 ? "text-success" : membro.produtividade >= 70 ? "text-warning" : "text-muted-foreground"
              )}>
                {membro.produtividade}%
              </p>
            </div>
          </div>

          {/* Barra de produtividade */}
          {membro.status === "ativo" && (
            <div className="mt-2">
              <Progress value={membro.produtividade} className="h-1" />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-2.5 w-2.5" />
              Desde {format(parseISO(membro.dataEntrada), "MMM/yy", { locale: ptBR })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {ultimoAcesso}
            </span>
          </div>

          {membro.supervisor && (
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
              Supervisor: <span className="font-medium">{membro.supervisor}</span>
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MembroDialog({
  open,
  onOpenChange,
  membro,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  membro: MembroEquipe | null;
  onSave: (m: MembroEquipe) => void;
}) {
  const [nome, setNome] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [papel, setPapel] = React.useState<UserRole>("advogado");
  const [oab, setOab] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [status, setStatus] = React.useState<MembroEquipe["status"]>("ativo");
  const [cargaHoraria, setCargaHoraria] = React.useState<MembroEquipe["cargaHoraria"]>("Integral");
  const [supervisor, setSupervisor] = React.useState("");
  const [permissoes, setPermissoes] = React.useState<Permissao[]>([]);

  // Reset/sync quando abrir
  React.useEffect(() => {
    if (open) {
      if (membro) {
        setNome(membro.nome);
        setEmail(membro.email);
        setPapel(membro.papel);
        setOab(membro.oab || "");
        setTelefone(membro.telefone || "");
        setStatus(membro.status);
        setCargaHoraria(membro.cargaHoraria);
        setSupervisor(membro.supervisor || "");
        setPermissoes(membro.permissoes);
      } else {
        setNome("");
        setEmail("");
        setPapel("advogado");
        setOab("");
        setTelefone("");
        setStatus("ativo");
        setCargaHoraria("Integral");
        setSupervisor("");
        // Aplica permissões padrão do papel selecionado
        const cfg = papeisEquipe.find((p) => p.value === "advogado")!;
        setPermissoes(cfg.permissoesPadrao as Permissao[]);
      }
    }
  }, [open, membro]);

  // Quando muda o papel, aplica permissões padrão (apenas se for novo membro)
  function handlePapelChange(novoPapel: UserRole) {
    setPapel(novoPapel);
    if (!membro) {
      const cfg = papeisEquipe.find((p) => p.value === novoPapel)!;
      setPermissoes(cfg.permissoesPadrao as Permissao[]);
    }
  }

  function togglePermissao(perm: Permissao) {
    setPermissoes((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }

  function handleSave() {
    if (!nome.trim() || !email.trim()) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }
    if (papel === "socio" || papel === "advogado") {
      if (!oab.trim()) {
        toast.error("OAB é obrigatória para sócios e advogados");
        return;
      }
    }

    const iniciais = nome
      .split(" ")
      .filter((n) => n.length > 2)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    const novoMembro: MembroEquipe = {
      id: membro?.id || `me-${Date.now()}`,
      nome: nome.trim(),
      email: email.trim(),
      papel,
      oab: oab.trim() || undefined,
      telefone: telefone.trim() || undefined,
      iniciais: iniciais || "?",
      status,
      dataEntrada: membro?.dataEntrada || new Date().toISOString().slice(0, 10),
      processosAtribuidos: membro?.processosAtribuidos || 0,
      tarefasPendentes: membro?.tarefasPendentes || 0,
      produtividade: membro?.produtividade || 0,
      permissoes,
      escritorio: membro?.escritorio || "Vidal & Associados — Sede São Paulo",
      supervisor: supervisor.trim() || undefined,
      cargaHoraria,
    };
    onSave(novoMembro);
  }

  const papelCfg = papeisEquipe.find((p) => p.value === papel)!;
  const gruposPermissao = ["Geral", "Processos", "Clientes", "Tarefas", "Documentos", "Financeiro", "Equipe", "Configurações"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {membro ? "Editar membro" : "Adicionar novo membro"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          {/* Seleção de papel */}
          <div className="grid gap-2">
            <Label>Papel na equipe *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {papeisEquipe.map((p) => {
                const Icon = papelIcon[p.value];
                const isSelected = papel === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handlePapelChange(p.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground italic">{papelCfg.descricao}</p>
          </div>

          <Separator />

          {/* Dados pessoais */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2 col-span-2 md:col-span-1">
              <Label>Nome completo *</Label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Dr. João Silva"
              />
            </div>
            <div className="grid gap-2 col-span-2 md:col-span-1">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@escritorio.com.br"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>
                OAB {(papel === "socio" || papel === "advogado") && "*"}
              </Label>
              <Input
                value={oab}
                onChange={(e) => setOab(e.target.value)}
                placeholder="SP 123.456"
                disabled={papel === "secretaria" || papel === "estagiario"}
              />
            </div>
            <div className="grid gap-2">
              <Label>Telefone</Label>
              <Input
                mask="phone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as MembroEquipe["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="ferias">Férias</SelectItem>
                  <SelectItem value="afastado">Afastado</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Carga horária</Label>
              <Select
                value={cargaHoraria}
                onValueChange={(v) => setCargaHoraria(v as MembroEquipe["cargaHoraria"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Integral">Integral</SelectItem>
                  <SelectItem value="Parcial">Parcial</SelectItem>
                  <SelectItem value="Estágio">Estágio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Supervisor (opcional)</Label>
            <Input
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="Ex: Advogado(a) Sênior"
            />
          </div>

          <Separator />

          {/* Permissões */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Permissões de acesso ({permissoes.length}/{permissoesCatalogo.length})
              </Label>
              <button
                type="button"
                onClick={() => {
                  if (permissoes.length === permissoesCatalogo.length) {
                    setPermissoes([]);
                  } else {
                    setPermissoes(permissoesCatalogo.map((p) => p.value));
                  }
                }}
                className="text-xs text-primary hover:underline"
              >
                {permissoes.length === permissoesCatalogo.length ? "Desmarcar todas" : "Marcar todas"}
              </button>
            </div>

            <div className="rounded-lg border border-border p-3 space-y-3 max-h-[200px] overflow-y-auto">
              {gruposPermissao.map((grupo) => {
                const permsGrupo = permissoesCatalogo.filter((p) => p.grupo === grupo);
                if (permsGrupo.length === 0) return null;
                return (
                  <div key={grupo}>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">
                      {grupo}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {permsGrupo.map((p) => {
                        const checked = permissoes.includes(p.value);
                        return (
                          <label
                            key={p.value}
                            className={cn(
                              "flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors",
                              checked ? "bg-primary/5" : "hover:bg-accent/40"
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => togglePermissao(p.value)}
                            />
                            <span className="text-xs">{p.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              💡 Ao criar um novo membro, as permissões padrão do papel são aplicadas automaticamente. Você pode ajustar individualmente acima.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1.5" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1.5" />
            {membro ? "Salvar alterações" : "Adicionar à equipe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissoesView({ membro }: { membro?: MembroEquipe }) {
  if (!membro) return null;
  const papelCfg = papeisEquipe.find((p) => p.value === membro.papel)!;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40">
        <Avatar className="h-9 w-9">
          <AvatarFallback className={cn("text-xs", papelCfg.corBg, papelCfg.cor)}>
            {membro.iniciais}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{membro.nome}</p>
          <p className="text-xs text-muted-foreground">
            {papelCfg.label} · {membro.permissoes.length} permissões ativas
          </p>
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {["Geral", "Processos", "Clientes", "Tarefas", "Documentos", "Financeiro", "Equipe", "Configurações"].map((grupo) => {
          const permsGrupo = permissoesCatalogo.filter((p) => p.grupo === grupo);
          if (permsGrupo.length === 0) return null;
          return (
            <div key={grupo}>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">
                {grupo}
              </p>
              <div className="space-y-1">
                {permsGrupo.map((p) => {
                  const has = membro.permissoes.includes(p.value);
                  return (
                    <div
                      key={p.value}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md",
                        has ? "bg-success/5" : "bg-muted/30 opacity-60"
                      )}
                    >
                      {has ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className="text-xs flex-1">{p.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
