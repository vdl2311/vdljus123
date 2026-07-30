// ============================================================================
// JurisFlow — Tipos TypeScript da plataforma jurídica
// ============================================================================

export type UserRole = "socio" | "advogado" | "secretaria" | "estagiario";

export interface PapelEquipeConfig {
  value: UserRole;
  label: string;
  descricao: string;
  cor: string;
  corBg: string;
  permissoesPadrao: string[];
}

// Permissões granulares por módulo
export type Permissao =
  | "dashboard:view"
  | "processos:view"
  | "processos:edit"
  | "processos:delete"
  | "clientes:view"
  | "clientes:edit"
  | "tarefas:view"
  | "tarefas:edit"
  | "documentos:view"
  | "documentos:edit"
  | "documentos:delete"
  | "financeiro:view"
  | "financeiro:edit"
  | "equipe:view"
  | "equipe:edit"
  | "configuracoes:view"
  | "configuracoes:edit"
  | "copiloto:use"
  | "jurisprudencia:view"
  | "automacoes:edit";

export interface MembroEquipe {
  id: string;
  nome: string;
  email: string;
  papel: UserRole;
  oab?: string;
  telefone?: string;
  avatarUrl?: string;
  iniciais: string;
  status: "ativo" | "inativo" | "ferias" | "afastado";
  dataEntrada: string;
  processosAtribuidos: number;
  tarefasPendentes: number;
  produtividade: number; // 0-100
  permissoes: Permissao[];
  escritorio: string;
  ultimoAcesso?: string;
  supervisor?: string; // nome do responsável
  cargaHoraria: "Integral" | "Parcial" | "Estágio";
}

export type ViewKey =
  | "dashboard"
  | "processos"
  | "processo-detalhe"
  | "clientes"
  | "tarefas"
  | "documentos"
  | "calendario"
  | "financeiro"
  | "equipe"
  | "copiloto"
  | "copiloto-proativo"
  | "inbox"
  | "busca"
  | "pesquisa-global"
  | "automacoes"
  | "jurisprudencia"
  | "estrategico"
  | "mapa-processos"
  | "notificacoes"
  | "portal-cliente"
  | "configuracoes"
  | "conflito-interesse"
  | "compliance"
  | "contratos"
  | "conhecimento"
  | "prazos";

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  oab?: string;
  avatarUrl?: string;
  perfil: UserRole;
  escritorio: string;
  permissoes: string[];
  preferencias: {
    notificacoesDataJud: boolean;
    resumoIaAutomatico: boolean;
    tema: "light" | "dark" | "system";
  };
}

export interface Escritorio {
  id: string;
  nome: string;
  cnpj: string;
  plano: "Starter" | "Pro" | "Enterprise";
}

export interface Cliente {
  id: string;
  nome: string;
  tipo: "PF" | "PJ";
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco: {
    logradouro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  historicoNotas: string;
  processosVinculados: string[];
  dataCadastro: string;
  status: "Ativo" | "Inativo" | "Potencial";
  fotoUrl?: string;
}

export type MovimentacaoFonte = "DataJud" | "Manual" | "Diário Oficial";
export type MovimentacaoRelevancia = "Alta" | "Média" | "Baixa";

export interface MovimentacaoProcessual {
  id: string;
  data: string;
  descricao: string;
  orgao: string;
  fonte: MovimentacaoFonte;
  relevancia: MovimentacaoRelevancia;
  alertaIa?: string;
}

export type ProcessoStatus =
  | "Ativo"
  | "Arquivado"
  | "Suspenso"
  | "Em Recurso"
  | "Acordo";

export type ProcessoFase = 
  | "Triagem"
  | "Petição Inicial"
  | "Instrução"
  | "Sentença"
  | "Recursal"
  | "Execução";

export type ProcessoRisco = "Alto" | "Médio" | "Baixo";
export type ProcessoArea = "Trabalhista" | "Cível" | "Tributário" | "Empresarial" | "Família" | "Criminal" | "Previdenciário";

export interface Processo {
  id: string;
  numeroCnj: string;
  tribunal: string;
  comarca: string;
  classeProcessual: string;
  assunto: string;
  area: ProcessoArea;
  fase?: ProcessoFase;
  risco: ProcessoRisco;
  partes: {
    poloAtivo: string;
    poloPassivo: string;
  };
  advogadoResponsavelId: string;
  advogadoResponsavelNome: string;
  clienteId: string;
  clienteNome: string;
  status: ProcessoStatus;
  movimentacoes: MovimentacaoProcessual[];
  documentosIds: string[];
  tags: string[];
  datasImportantes: {
    distribuicao: string;
    proximaAudiencia?: string;
    prazoFatal?: string;
  };
  valorCausa: number;
  ultimaSincronizacaoDataJud: string;
  resumoIa?: string;
  probabilidadeSucesso?: number;
}

export interface Documento {
  id: string;
  tipo:
    | "Contrato"
    | "Procuração"
    | "Petição Inicial"
    | "Sentença"
    | "Contestação"
    | "Recurso"
    | "Outro";
  nome: string;
  arquivoUrl: string;
  tamanho: string;
  dataUpload: string;
  processoId?: string;
  processoNumeroCnj?: string;
  clienteId?: string;
  resumoIa?: string;
  entidadesExtraidas?: {
    datas?: string[];
    valores?: string[];
    clausulasCriticas?: string[];
    partesCitadas?: string[];
  };
  statusIa: "analisado" | "pendente" | "processando";
}

export type TarefaPrioridade = "Urgente" | "Alta" | "Média" | "Baixa";
export type TarefaStatus = "Pendente" | "Em Andamento" | "Concluído" | "Atrasado";
export type TarefaCategoria = "Prazo Processual" | "Audiência" | "Diligência" | "Reunião" | "Interno";

export interface Tarefa {
  id: string;
  descricao: string;
  processoId?: string;
  processoNumeroCnj?: string;
  responsavelId: string;
  responsavelNome: string;
  dataLimite: string;
  prioridade: TarefaPrioridade;
  status: TarefaStatus;
  categoria: TarefaCategoria;
}

export interface AiChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  contexto?: string;
  sugestoes?: string[];
}

export interface DataJudImportResult {
  numeroCnj: string;
  tribunal: string;
  comarca: string;
  classe: string;
  assunto: string;
  poloAtivo: string;
  poloPassivo: string;
  valorCausa: number;
  dataDistribuicao: string;
  movimentacoesExtraidas: Array<{
    data: string;
    descricao: string;
    orgao: string;
  }>;
}

export type InboxTipo =
  | "Publicação Diário Oficial"
  | "Movimentação DataJud"
  | "E-mail Cliente"
  | "Documento Recebido";

export type InboxClassificacao = "Ação Necessária" | "Importante" | "Pode Esperar";

export interface InboxJuridicoItem {
  id: string;
  tipo: InboxTipo;
  titulo: string;
  descricao: string;
  dataHora: string;
  processoId?: string;
  processoNumeroCnj?: string;
  clienteNome?: string;
  classificacaoIa: InboxClassificacao;
  sugestaoAcaoIa: string;
  prazoSugeridoDias?: number;
  lido: boolean;
  arquivado: boolean;
}

export interface Automacao {
  id: string;
  nome: string;
  descricao: string;
  gatilho: string;
  acao: string;
  ativa: boolean;
  execucoesUltimos30Dias: number;
  ultimaExecucao: string;
  tipo: "Prazo" | "Movimentação" | "Documento" | "Cliente" | "Agendada";
}

export interface Notificacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "info" | "warning" | "success" | "error";
  lida: boolean;
  dataHora: string;
  link?: ViewKey;
}

export interface EventoAgenda {
  id: string;
  titulo: string;
  data: string;
  hora: string;
  tipo: "Audiência" | "Reunião" | "Prazo" | "Diligência";
  processoId?: string;
  clienteNome?: string;
}

// ---- Financeiro ------------------------------------------------------------

export type LancamentoTipo = "Receita" | "Despesa" | "Honorário" | "Custa";
export type LancamentoStatus = "Pago" | "Pendente" | "Atrasado" | "Agendado";

export interface LancamentoFinanceiro {
  id: string;
  tipo: LancamentoTipo;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: LancamentoStatus;
  categoria: string;
  clienteId?: string;
  clienteNome?: string;
  processoId?: string;
  processoNumeroCnj?: string;
  formaPagamento?: "Boleto" | "PIX" | "Transferência" | "Cartão" | "Dinheiro";
  recorrente?: boolean;
}

export interface ContratoHonorarios {
  id: string;
  clienteId: string;
  clienteNome: string;
  processoId?: string;
  tipo: "Exit" | "Mensal" | "Sucesso" | "Fixo" | "Misto";
  valorBase: number;
  percentualSucesso?: number;
  vigenciaInicio: string;
  vigenciaFim?: string;
  status: "Ativo" | "Encerrado" | "Suspenso";
  proximoVencimento?: string;
  valorProximaParcela?: number;
}

// ---- Jurisprudência IA -----------------------------------------------------

export interface JurisprudenciaItem {
  id: string;
  tribunal: string;
  classe: string;
  relator: string;
  dataJulgamento: string;
  ementa: string;
  tese: string;
  area: string;
  favoravel: boolean;
  processoOrigem: string;
  relevanceScore: number;
}

export interface TendenciaJurisprudencial {
  area: string;
  tribunal: string;
  tendencia: "Favorável" | "Contrária" | "Neutra";
  percentualFavoravel: number;
  totalDecisoes: number;
  variacaoMes: number;
  tesePredominante: string;
}

// ---- Insights do Copiloto Proativo ----------------------------------------

export type InsightTipo =
  | "prazo_urgente"
  | "cliente_sem_contato"
  | "documento_faltante"
  | "movimentacao_importante"
  | "oportunidade_sucesso"
  | "risco_perda"
  | "oportunidade_acordo"
  | "gargalo_produto";

export type InsightSeveridade = "critica" | "alta" | "media" | "baixa";

export interface InsightProativo {
  id: string;
  tipo: InsightTipo;
  severidade: InsightSeveridade;
  titulo: string;
  descricao: string;
  acaoSugerida: string;
  processoId?: string;
  processoNumeroCnj?: string;
  clienteNome?: string;
  prazoDias?: number;
  impactoFinanceiro?: number;
  probabilidadeSucesso?: number;
}

// ---- Mapa de Processos -----------------------------------------------------

export interface ProcessosPorEstado {
  uf: string;
  estado: string;
  total: number;
  ativos: number;
  valorTotal: number;
  comarcas: { nome: string; total: number }[];
  coord: { lat: number; lng: number };
}

// ---- Chat com Processo -----------------------------------------------------

export interface ChatProcessoPergunta {
  id: string;
  pergunta: string;
  resposta: string;
  timestamp: string;
}

// ---- Pesquisa Global -------------------------------------------------------

export type ResultadoTipo = "processo" | "cliente" | "documento" | "jurisprudencia" | "tarefa";

export interface ResultadoGlobal {
  tipo: ResultadoTipo;
  id: string;
  titulo: string;
  descricao: string;
  meta?: string;
  score: number;
}

// ---- Modo Estratégico ------------------------------------------------------

export interface GargaloEscritorio {
  categoria: string;
  descricao: string;
  impacto: "Alto" | "Médio" | "Baixo";
  metrica: string;
  valorAtual: number;
  valorMeta: number;
  recomendacao: string;
}

export interface AnalisePreditiva {
  processoId: string;
  processoNumeroCnj: string;
  clienteNome: string;
  probabilidadeMovimentacao30d: number;
  riscoPerdaPrazo: number;
  diasSemMovimentacao: number;
  recomendacao: string;
}

// ---- DataJud Integration Service -------------------------------------------

export interface DataJudMovimentacao {
  id?: string;
  data: string;
  descricao: string;
  orgao: string;
  fonte?: MovimentacaoFonte;
  relevancia?: MovimentacaoRelevancia;
}

export interface DataJudConsultaResult {
  numeroCnj: string;
  tribunal: string;
  comarca: string;
  classe: string;
  assunto: string;
  area: ProcessoArea;
  poloAtivo: string;
  poloPassivo: string;
  valorCausa: number;
  dataDistribuicao: string;
  movimentacoes: DataJudMovimentacao[];
  statusProcesso?: ProcessoStatus;
  orgaoJulgador?: string;
  grau?: string;
  fonteUrl?: string;
}

export interface DataJudConsulta {
  id: string;
  numeroCnj: string;
  dataConsulta: string;
  usuarioId?: string;
  usuarioEmail?: string;
  resultado: DataJudConsultaResult;
  status: "sucesso" | "erro" | "nao_encontrado";
  mensagemErro?: string;
  processoVinculadoId?: string;
}

