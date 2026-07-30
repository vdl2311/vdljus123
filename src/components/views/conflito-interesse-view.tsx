import * as React from "react";
import { useAppStore } from "@/lib/store";
import { Search, AlertTriangle, ShieldCheck, CheckCircle2, UserCheck, Scale, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ConflitoInteresseView() {
  const { clientes, processos } = useAppStore();
  const [query, setQuery] = React.useState("");
  const [hasSearched, setHasSearched] = React.useState(false);
  const [results, setResults] = React.useState<{
    conflict: boolean;
    reason?: string;
    details?: any[];
  } | null>(null);

  const handleSearchConflict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
    const clean = query.toLowerCase().trim();

    // Check if searched name matches an existing client in CRM
    const matchingClients = clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(clean) ||
        (c.cpfCnpj && c.cpfCnpj.includes(clean))
    );

    // Check if searched name matches polo ativo, polo passivo or client name in processes
    const matchingProcesses = processos.filter(
      (p) =>
        (p.partes?.poloAtivo && p.partes.poloAtivo.toLowerCase().includes(clean)) ||
        (p.partes?.poloPassivo && p.partes.poloPassivo.toLowerCase().includes(clean)) ||
        (p.clienteNome && p.clienteNome.toLowerCase().includes(clean))
    );

    if (matchingClients.length > 0 || matchingProcesses.length > 0) {
      const reasons: string[] = [];
      if (matchingClients.length > 0) {
        reasons.push(
          `O nome pesquisado consta como CLIENTE CADASTRADO no CRM (${matchingClients.map((c) => c.nome).join(", ")}).`
        );
      }
      if (matchingProcesses.length > 0) {
        matchingProcesses.forEach((p) => {
          const relation =
            p.clienteNome?.toLowerCase().includes(clean) ||
            p.partes?.poloAtivo?.toLowerCase().includes(clean)
              ? "cliente/parte patrocinada"
              : "parte contrária / polo adverso";
          reasons.push(
            `O termo pesquisado consta como ${relation} no processo judicial CNJ nº ${p.numeroCnj} ("${p.assunto}").`
          );
        });
      }

      setResults({
        conflict: true,
        reason: reasons.join(" "),
        details: [...matchingClients, ...matchingProcesses],
      });
    } else {
      setResults({ conflict: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          Conflito de Interesses & Impedimentos Éticos
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Mapeie preventivamente impedimentos éticos da OAB (Art. 20 CED) antes de aceitar clientes ou assinar procurações.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Busca */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Painel de Auditoria Prévia
            </CardTitle>
            <CardDescription className="text-xs">
              Digite o nome de pessoa física, razão social de empresa, sócio ou testemunha para cruzar com todos os registros do escritório.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchConflict} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Nome da Parte / Razão Social
                </label>
                <Input
                  required
                  placeholder="Ex: Banco Itaú, Carlos Silva..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <Search className="h-4 w-4" />
                Investigar Impedimentos
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Painel de Resultados */}
        <div className="lg:col-span-2">
          {hasSearched && results ? (
            results.conflict ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <Card className="border-destructive/40 bg-destructive/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-destructive font-bold text-base">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      Impedimento Ético Detectado!
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-destructive-foreground leading-relaxed">
                      <strong>Atenção:</strong> O patrocínio desta causa apresenta risco ético direto sob o Art. 20 do Código de Ética e Disciplina da OAB (conflito de interesse ativo).
                    </p>
                    <div className="p-3 bg-background border border-destructive/20 rounded-lg text-xs font-medium text-foreground">
                      <strong>Motivo mapeado:</strong> {results.reason}
                    </div>
                  </CardContent>
                </Card>

                {/* Vínculos Encontrados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                      Vínculos Mapeados na Base de Dados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {results.details?.map((item: any, idx: number) => {
                      const isClient = "cpfCnpj" in item;
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-muted/40 border border-border rounded-lg flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            {isClient ? (
                              <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Scale className="h-4 w-4 text-indigo-500 shrink-0" />
                            )}
                            <div>
                              <p className="font-bold text-foreground">
                                {item.nome || item.assunto || item.numeroCnj}
                              </p>
                              <span className="text-xs text-muted-foreground block">
                                {isClient
                                  ? `Cliente CRM (${item.tipo}) - ${item.cpfCnpj}`
                                  : `Processo CNJ: ${item.numeroCnj}`}
                              </span>
                            </div>
                          </div>
                          <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                            Impedimento
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-emerald-500/40 bg-emerald-500/5 animate-in fade-in duration-200">
                <CardHeader>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                    <ShieldCheck className="h-6 w-6 shrink-0" />
                    Nenhum Impedimento Encontrado
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O termo <strong>"{query}"</strong> foi submetido a uma varredura rigorosa em todos os clientes e processos do escritório e não apresenta vínculos com partes contrárias ativas ou impedimentos éticos.
                  </p>
                  <div className="p-3 bg-background border border-emerald-500/20 rounded-lg text-xs flex items-center gap-2 text-foreground font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    Causa aprovada para formalização de procuração e contrato de honorários (Art. 39 a 47 OAB).
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="h-64 flex flex-col items-center justify-center text-center p-8">
              <Scale className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
              <p className="text-sm font-semibold text-foreground">Aguardando Parâmetros de Pesquisa</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Preencha o nome da parte no painel ao lado para auditar preventivamente possíveis impedimentos contratuais ou éticos.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
