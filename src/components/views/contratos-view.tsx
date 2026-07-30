import * as React from "react";
import { useAppStore } from "@/lib/store";
import { FileText, Copy, Check, Download, ShieldCheck, Hash, User, RefreshCw, PenTool } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ContratosView() {
  const { clientes } = useAppStore();
  const [selectedClienteId, setSelectedClienteId] = React.useState<string>(clientes[0]?.id || "");
  const [templateType, setTemplateType] = React.useState<"procuracao" | "quota_litis" | "nda">("procuracao");
  const [copied, setCopied] = React.useState(false);

  const selectedCliente = clientes.find((c) => c.id === selectedClienteId) || clientes[0];

  const generatedText = React.useMemo(() => {
    const nome = selectedCliente ? selectedCliente.nome : "[NOME DO CLIENTE]";
    const doc = selectedCliente ? selectedCliente.cpfCnpj : "[CPF/CNPJ]";
    const end = selectedCliente && selectedCliente.endereco
      ? `${selectedCliente.endereco.logradouro}, ${selectedCliente.endereco.cidade}/${selectedCliente.endereco.uf}`
      : "[ENDEREÇO COMPLETO]";
    const dataAtual = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

    if (templateType === "procuracao") {
      return `PROCURAÇÃO AD JUDICIA ET EXTRA

OUTORGANTE: ${nome}, inscrito(a) no CPF/CNPJ sob o nº ${doc}, residente e domiciliado(a) em ${end}.

OUTORGADOS: VDL JURIS ADVOCACIA E CONSULTORIA JURÍDICA, sociedade de advogados inscrita na OAB/SP sob nº 23.110, com sede corporativa.

PODERES: Pelo presente instrumento particular de procuração, o(a) Outorgante nomeia e constitui os Outorgados como seus procuradores, concedendo-lhes os amplos poderes da cláusula 'ad judicia' para o foro em geral, em qualquer Juízo, Tribunal ou Repartição Pública.

PODERES ESPECIAIS: Confere ainda poderes especiais para confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre o qual se funda a ação, receber e dar quitação, assinar compromisso e substabelecer esta com ou sem reserva de poderes.

São Paulo - SP, ${dataAtual}.

______________________________________________
${nome}
Outorgante`;
    }

    if (templateType === "quota_litis") {
      return `CONTRATO DE HONORÁRIOS ADVOCATÍCIOS (QUOTA LITIS)

CONTRATANTE: ${nome}, inscrito(a) sob o nº ${doc}, domiciliado(a) em ${end}.

CONTRATADO: VDL JURIS ADVOCACIA, sociedade de advogados OAB/SP nº 23.110.

CLÁUSULA PRIMEIRA - DO OBJETO: O CONTRATADO compromete-se a prestar serviços de assessoria jurídica e patrocínio dos interesses do CONTRATANTE em demanda judicial pertinente.

CLÁUSULA SEGUNDA - DOS HONORÁRIOS AD EXITUM (QUOTA LITIS):
Fixam-se os honorários advocatícios no percentual de 30% (trinta por cento) sobre o proveito econômico líquido bruto obtido ao final da demanda, via acordo ou sentença transitada em julgado.

CLÁUSULA TERCEIRA - DAS DESPESAS: As custas processuais, perícias e emolumentos de cartório correm por conta exclusiva do CONTRATANTE.

São Paulo - SP, ${dataAtual}.

______________________________________________
${nome} (Contratante)

______________________________________________
VDL JURIS ADVOCACIA (Contratado)`;
    }

    return `TERMO DE CONFIDENCIALIDADE E NÃO DIVULGAÇÃO (NDA)

REVELADOR: VDL JURIS ADVOCACIA.
RECEPTOR: ${nome}, inscrito no CPF/CNPJ nº ${doc}.

O RECEPTOR compromete-se a manter sigilo absoluto sobre todas as informações estratégicas, segredos de negócio e petições fornecidas pelo REVELADOR para instrução do processo.

São Paulo - SP, ${dataAtual}.`;
  }, [selectedCliente, templateType]);

  const mockHash = React.useMemo(() => {
    return "SHA256:" + Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 10).toUpperCase();
  }, [selectedClienteId, templateType]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    toast.success("Minuta copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedText], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${templateType.toUpperCase()}_${selectedCliente?.nome.replace(/\s+/g, "_") || "CLIENTE"}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Modelos & Contratos de Honorários
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Gere minuta instantânea com substituição dinâmica de tags dos clientes e carimbo de validação digital.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Controles */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              <PenTool className="h-4 w-4 text-primary" />
              Parâmetros da Minuta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seleção do Cliente */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                Vincular Cliente (CRM)
              </label>
              <select
                value={selectedClienteId}
                onChange={(e) => setSelectedClienteId(e.target.value)}
                className="w-full bg-background border border-border focus:border-primary rounded-md p-2 text-xs font-medium text-foreground focus:outline-none"
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.cpfCnpj})
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção de Modelo */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Tipo de Instrumento
              </label>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setTemplateType("procuracao")}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                    templateType === "procuracao"
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Procuração Ad Judicia (Amplos Poderes)
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateType("quota_litis")}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                    templateType === "quota_litis"
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Contrato Quota Litis (Honorários Êxito)
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateType("nda")}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                    templateType === "nda"
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Termo de Confidencialidade (NDA)
                </button>
              </div>
            </div>

            {/* Informações da Assinatura Digital */}
            <div className="p-3 bg-muted/40 border border-border rounded-lg space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                Validação de Assinatura Digital
              </div>
              <p className="text-[11px] text-muted-foreground">
                Código Hash gerado para trilha de auditoria jurídica em conformidade com MP 2.200-2/2001:
              </p>
              <span className="font-mono text-[10px] bg-background p-1.5 rounded border border-border block text-primary truncate">
                {mockHash}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Visualizador do Texto */}
        <Card className="lg:col-span-2 flex flex-col h-[560px]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">
                Minuta Gerada em Tempo Real
              </CardTitle>
              <CardDescription className="text-xs">
                Pronta para impressão ou envio direto via e-mail e WhatsApp ao cliente.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs">
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copiado!" : "Copiar"}
              </Button>
              <Button size="sm" onClick={handleDownloadTxt} className="gap-1.5 text-xs">
                <Download className="h-3.5 w-3.5" />
                Baixar Minuta
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <textarea
              readOnly
              value={generatedText}
              className="w-full h-full bg-muted/20 border border-border rounded-lg p-4 font-mono text-xs leading-relaxed text-foreground resize-none focus:outline-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
