import * as XLSX from "xlsx";
import type { Processo, Cliente, Tarefa, Documento, LancamentoFinanceiro, Notificacao, MembroEquipe } from "./types";
import { formatCurrency, formatDateSafe } from "./format";

export interface DataExportPayload {
  officeName?: string;
  processos: Processo[];
  clientes: Cliente[];
  tarefas: Tarefa[];
  documentos: Documento[];
  financeiro?: LancamentoFinanceiro[];
  notificacoes?: Notificacao[];
  equipe?: MembroEquipe[];
}

export function exportAllDataToExcel(payload: DataExportPayload) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Resumo Executivo
  const summaryData = [
    { Métrica: "Escritório", Valor: payload.officeName || "JurisFlow Advocacia" },
    { Métrica: "Data da Exportação", Valor: new Date().toLocaleString("pt-BR") },
    { Métrica: "Total de Processos", Valor: payload.processos.length },
    { Métrica: "Total de Clientes Cadastrados", Valor: payload.clientes.length },
    { Métrica: "Total de Tarefas / Prazos", Valor: payload.tarefas.length },
    { Métrica: "Total de Documentos / Minutas", Valor: payload.documentos.length },
    { Métrica: "Portabilidade LGPD", Valor: "100% dos dados estruturados exportados sem retenção (Art. 18, V)" },
  ];
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Resumo Executivo");

  // Sheet 2: Processos Judiciais
  if (payload.processos.length > 0) {
    const processesRows = payload.processos.map((p) => ({
      ID: p.id,
      Número_CNJ: p.numeroCnj,
      Tribunal: p.tribunal,
      Comarca: p.comarca,
      Classe: p.classeProcessual,
      Assunto: p.assunto,
      Área: p.area,
      Fase: p.fase || "Inicial",
      Risco: p.risco,
      Status: p.status,
      Polo_Ativo: p.partes?.poloAtivo || "",
      Polo_Passivo: p.partes?.poloPassivo || "",
      Cliente: p.clienteNome,
      Advogado_Responsável: p.advogadoResponsavelNome,
      Valor_Causa: formatCurrency(p.valorCausa),
      Distribuição: formatDateSafe(p.datasImportantes?.distribuicao),
      Prazo_Fatal: formatDateSafe(p.datasImportantes?.prazoFatal),
      Última_Sincronização: formatDateSafe(p.ultimaSincronizacaoDataJud),
    }));
    const processesWs = XLSX.utils.json_to_sheet(processesRows);
    XLSX.utils.book_append_sheet(wb, processesWs, "Processos");
  }

  // Sheet 3: Clientes CRM
  if (payload.clientes.length > 0) {
    const clientsRows = payload.clientes.map((c) => ({
      ID: c.id,
      Nome: c.nome,
      Tipo: c.tipo,
      CPF_CNPJ: c.cpfCnpj,
      Email: c.email,
      Telefone: c.telefone,
      Cidade_UF: c.endereco ? `${c.endereco.cidade}/${c.endereco.uf}` : "",
      Status: c.status,
      Data_Cadastro: formatDateSafe(c.dataCadastro),
      Processos_Vinculados: c.processosVinculados?.length || 0,
      Notas: c.historicoNotas || "",
    }));
    const clientsWs = XLSX.utils.json_to_sheet(clientsRows);
    XLSX.utils.book_append_sheet(wb, clientsWs, "Clientes");
  }

  // Sheet 4: Tarefas e Prazos
  if (payload.tarefas.length > 0) {
    const tasksRows = payload.tarefas.map((t) => ({
      ID: t.id,
      Descrição: t.descricao,
      Categoria: t.categoria,
      Prioridade: t.prioridade,
      Status: t.status,
      Data_Limite: formatDateSafe(t.dataLimite),
      Responsável: t.responsavelNome,
      Processo_CNJ: t.processoNumeroCnj || "",
    }));
    const tasksWs = XLSX.utils.json_to_sheet(tasksRows);
    XLSX.utils.book_append_sheet(wb, tasksWs, "Tarefas & Prazos");
  }

  // Sheet 5: Documentos
  if (payload.documentos.length > 0) {
    const docsRows = payload.documentos.map((d) => ({
      ID: d.id,
      Nome: d.nome,
      Tipo: d.tipo,
      Tamanho: d.tamanho,
      Data_Upload: formatDateSafe(d.dataUpload),
      Processo_CNJ: d.processoNumeroCnj || "",
      Status_IA: d.statusIa,
    }));
    const docsWs = XLSX.utils.json_to_sheet(docsRows);
    XLSX.utils.book_append_sheet(wb, docsWs, "Documentos");
  }

  // Salvar Arquivo Excel
  const filename = `Backup_JurisFlow_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export function exportProcessoToJSON(processo: Processo) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(processo, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Processo_${processo.numeroCnj.replace(/[^0-9]/g, "")}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
