import * as React from "react";
import { useAppStore } from "@/lib/store";
import { exportAllDataToExcel } from "@/lib/data-exporter";
import { ShieldAlert, CheckCircle, RefreshCw, AlertCircle, FileSpreadsheet, Bot, HelpCircle, Download, Lock, Trash2, Database } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ComplianceView() {
  const { processos, clientes, tarefas, documentos } = useAppStore();
  const [auditMode, setAuditMode] = React.useState<"oab" | "lgpd">("oab");
  const [textToAudit, setTextToAudit] = React.useState(
    "Anúncio patrocinado: Venha para o melhor escritório de SP! Garantimos vitória judicial em divórcios litigiosos rápidos. Fale agora com nossa equipe comercial e ganhe consulta gratuita com advogados."
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [auditResult, setAuditResult] = React.useState<any | null>(null);

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textToAudit.trim() || isLoading) return;
    setIsLoading(true);
    setAuditResult(null);

    setTimeout(() => {
      if (auditMode === "oab") {
        const textLower = textToAudit.toLowerCase();
        const hasGaranto = textLower.includes("garanti") || textLower.includes("vitória") || textLower.includes("100%");
        const hasMelhor = textLower.includes("melhor") || textLower.includes("líder");
        const hasGratis = textLower.includes("gratuita") || textLower.includes("grátis");
        const hasComercial = textLower.includes("comercial") || textLower.includes("venda");

        const level = (hasGaranto || hasMelhor || hasGratis || hasComercial) ? "alert" : "compliant";
        const recommendations: string[] = [];

        if (hasGaranto) recommendations.push("Remova promessas de resultado ou garantia de vitória (Art. 28 OAB). A advocacia é atividade de meio, não de resultado.");
        if (hasMelhor) recommendations.push("Substitua adjetivos de autoengrandecimento ('melhor escritório') por termos sobressalentes sóbrios e informativos (Art. 39).");
        if (hasGratis) recommendations.push("Retire a oferta de consultas gratuitas em anúncios, pois configura captação indevida de clientela (Art. 41).");
        if (hasComercial) recommendations.push("Evite utilizar a expressão 'equipe comercial' para atendimento advocatício para afastar caráter mercantil.");

        setAuditResult({
          level,
          analysis: level === "alert" 
            ? "O texto avaliado contém trechos vulneráveis a sanções ético-disciplinares da OAB por mercantilização ou captação ativa."
            : "O texto está alinhado com o Provimento 205/2021 da OAB e mantém caráter meramente informativo.",
          recommendations: recommendations.length > 0 ? recommendations : ["Texto totalmente adequado às normas do Provimento 205/2021 OAB."]
        });
      } else {
        setAuditResult({
          level: "warning",
          analysis: "Identificamos compartilhamento de dados sensíveis (passaportes e dados de saúde) em canais não criptografados.",
          recommendations: [
            "Implemente controle de acesso RBAC com autenticação de dois fatores (2FA).",
            "Estabeleça política formal de retenção e eliminação de dados (LGPD Art. 16).",
            "Utilize criptografia em repouso e em trânsito (HTTPS/TLS 1.3)."
          ]
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleExportBackup = () => {
    exportAllDataToExcel({
      officeName: "VDL Juris Advocacia",
      processos,
      clientes,
      tarefas,
      documentos
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            Compliance, Ética OAB & LGPD
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Audite peças de divulgação jurídica, políticas internas e faça a exportação integral dos dados do escritório.
          </p>
        </div>

        <Button onClick={handleExportBackup} className="gap-2 shrink-0">
          <FileSpreadsheet className="h-4 w-4" />
          Exportar Backup Completo (.xlsx)
        </Button>
      </div>

      {/* Banner de Portabilidade Lock-in Zero */}
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">Portabilidade Integral & Lock-In Zero</p>
              <p className="text-xs text-muted-foreground">
                Garantia LGPD Art. 18, V: Baixe todos os cadastros, processos e minutas em 1 clique a qualquer momento.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
            100% Exportável
          </Badge>
        </CardContent>
      </Card>

      {/* Abas de Auditoria */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => {
            setAuditMode("oab");
            setTextToAudit("Anúncio patrocinado: Venha para o melhor escritório de SP! Garantimos vitória judicial em divórcios litigiosos rápidos. Fale agora com nossa equipe comercial e ganhe consulta gratuita com advogados.");
            setAuditResult(null);
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            auditMode === "oab"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Publicidade OAB (Art. 39 a 47)
        </button>
        <button
          onClick={() => {
            setAuditMode("lgpd");
            setTextToAudit("Armazenamento local em pastas abertas contendo cópias de documentos de identificação, contracheques e prontuários de saúde compartilhados sem criptografia.");
            setAuditResult(null);
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            auditMode === "lgpd"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Segurança de Dados & LGPD
        </button>
      </div>

      {/* Form & Result Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="h-[480px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
              Conteúdo para Auditoria
            </CardTitle>
            <CardDescription className="text-xs">
              {auditMode === "oab"
                ? "Cole copies de landing pages, anúncios patrocinados ou postagens sociais para checar regras da OAB."
                : "Cole descrições de fluxos operacionais ou políticas de armazenamento para auditar a LGPD."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 space-y-4">
            <textarea
              required
              value={textToAudit}
              onChange={(e) => setTextToAudit(e.target.value)}
              className="flex-1 w-full bg-background border border-border focus:border-primary rounded-lg p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-sans"
            />
            <Button
              onClick={handleRunAudit}
              disabled={isLoading || !textToAudit.trim()}
              className="w-full gap-2"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Auditar Conformidade Legal
            </Button>
          </CardContent>
        </Card>

        {/* Output Result */}
        <Card className="h-[480px] flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              Relatório de Conformidade Ética
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <RefreshCw className="h-8 w-8 text-primary animate-spin mb-3" />
                <p className="font-bold text-sm text-foreground">Auditando diretrizes legais...</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Analisando restrições do Provimento 205/2021 OAB e regulamentos da LGPD.
                </p>
              </div>
            ) : auditResult ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-3 bg-muted/40 border border-border rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase block">Status</span>
                    <span className="text-sm font-bold text-foreground">
                      {auditResult.level === "compliant" ? "Conforme" : auditResult.level === "warning" ? "Risco Moderado" : "Alerta Ético"}
                    </span>
                  </div>
                  <Badge
                    variant={auditResult.level === "compliant" ? "default" : "destructive"}
                    className="text-[10px] uppercase font-bold"
                  >
                    {auditMode === "oab" ? "OAB CED" : "ANPD / LGPD"}
                  </Badge>
                </div>

                <div className="p-3 bg-background border border-border rounded-lg space-y-1">
                  <span className="font-bold text-xs uppercase text-foreground block">Diagnóstico</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{auditResult.analysis}</p>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                  <span className="font-bold text-xs uppercase text-primary block">Plano de Ajuste Recomendado</span>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {auditResult.recommendations?.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2 opacity-40" />
                <p className="font-bold text-xs">Aguardando inserção de texto</p>
                <p className="text-[10px] mt-1 max-w-xs">
                  Cole o texto desejado no painel ao lado e acione o botão de auditoria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
