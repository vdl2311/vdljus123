import { collection, doc, setDoc, addDoc, getDocs, query, where, orderBy, limit, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { DataJudConsulta, DataJudConsultaResult, Processo, MovimentacaoProcessual } from "./types";
import { logger } from "./logger";

// Mapping of CNJ Tribunal codes to Tribunal Names and Public API slugs
const TRIBUNAL_MAP: Record<string, { nome: string; sigla: string; apiSlug: string; area: "Cível" | "Trabalhista" | "Tributário" | "Criminal" | "Empresarial" }> = {
  // Justiça do Trabalho (Segmento 5)
  "5.01": { nome: "Tribunal Regional do Trabalho da 1ª Região (RJ)", sigla: "TRT1", apiSlug: "trt1", area: "Trabalhista" },
  "5.02": { nome: "Tribunal Regional do Trabalho da 2ª Região (SP)", sigla: "TRT2", apiSlug: "trt2", area: "Trabalhista" },
  "5.03": { nome: "Tribunal Regional do Trabalho da 3ª Região (MG)", sigla: "TRT3", apiSlug: "trt3", area: "Trabalhista" },
  "5.04": { nome: "Tribunal Regional do Trabalho da 4ª Região (RS)", sigla: "TRT4", apiSlug: "trt4", area: "Trabalhista" },
  "5.15": { nome: "Tribunal Regional do Trabalho da 15ª Região (Campinas/SP)", sigla: "TRT15", apiSlug: "trt15", area: "Trabalhista" },

  // Justiça Estadual (Segmento 8)
  "8.26": { nome: "Tribunal de Justiça do Estado de São Paulo", sigla: "TJSP", apiSlug: "tjsp", area: "Cível" },
  "8.19": { nome: "Tribunal de Justiça do Estado do Rio de Janeiro", sigla: "TJRJ", apiSlug: "tjrj", area: "Cível" },
  "8.13": { nome: "Tribunal de Justiça do Estado de Minas Gerais", sigla: "TJMG", apiSlug: "tjmg", area: "Cível" },
  "8.21": { nome: "Tribunal de Justiça do Estado do Rio Grande do Sul", sigla: "TJRS", apiSlug: "tjrs", area: "Cível" },
  "8.16": { nome: "Tribunal de Justiça do Estado do Paraná", sigla: "TJPR", apiSlug: "tjpr", area: "Cível" },
  "8.09": { nome: "Tribunal de Justiça do Estado de Goiás", sigla: "TJGO", apiSlug: "tjgo", area: "Cível" },
  "8.05": { nome: "Tribunal de Justiça do Estado da Bahia", sigla: "TJBA", apiSlug: "tjba", area: "Cível" },
  "8.07": { nome: "Tribunal de Justiça do Distrito Federal e Territórios", sigla: "TJDFT", apiSlug: "tjdft", area: "Cível" },

  // Justiça Federal (Segmento 4)
  "4.01": { nome: "Tribunal Regional Federal da 1ª Região", sigla: "TRF1", apiSlug: "trf1", area: "Tributário" },
  "4.02": { nome: "Tribunal Regional Federal da 2ª Região", sigla: "TRF2", apiSlug: "trf2", area: "Tributário" },
  "4.03": { nome: "Tribunal Regional Federal da 3ª Região", sigla: "TRF3", apiSlug: "trf3", area: "Tributário" },
  "4.04": { nome: "Tribunal Regional Federal da 4ª Região", sigla: "TRF4", apiSlug: "trf4", area: "Tributário" },
  "4.05": { nome: "Tribunal Regional Federal da 5ª Região", sigla: "TRF5", apiSlug: "trf5", area: "Tributário" },
};

export interface CNJInfo {
  numeroLimpo: string;
  valido: boolean;
  numeroSequencial: string;
  digitoVerificador: string;
  ano: string;
  segmentoJustica: string;
  codigoTribunal: string;
  orgaoOrigem: string;
  tribunalInfo?: { nome: string; sigla: string; apiSlug: string; area: "Cível" | "Trabalhista" | "Tributário" | "Criminal" | "Empresarial" };
}

/**
 * Normaliza e analisa a estrutura de um número CNJ (NNNNNNN-DD.AAAA.J.TR.OOOO)
 */
export function extrairInfoCNJ(cnjRaw: string): CNJInfo {
  const limpo = cnjRaw.replace(/\D/g, "");
  if (limpo.length !== 20) {
    return {
      numeroLimpo: limpo,
      valido: false,
      numeroSequencial: "",
      digitoVerificador: "",
      ano: "",
      segmentoJustica: "",
      codigoTribunal: "",
      orgaoOrigem: "",
    };
  }

  const numeroSequencial = limpo.substring(0, 7);
  const digitoVerificador = limpo.substring(7, 9);
  const ano = limpo.substring(9, 13);
  const segmentoJustica = limpo.substring(13, 14);
  const tribunalDigitos = limpo.substring(14, 16);
  const codigoTribunal = `${segmentoJustica}.${tribunalDigitos}`;
  const orgaoOrigem = limpo.substring(16, 20);

  const tribunalInfo = TRIBUNAL_MAP[codigoTribunal] || {
    nome: `Tribunal Regional / Justiça (Código ${codigoTribunal})`,
    sigla: segmentoJustica === "5" ? `TRT` : segmentoJustica === "4" ? `TRF` : `TJ`,
    apiSlug: `tj`,
    area: segmentoJustica === "5" ? "Trabalhista" : segmentoJustica === "4" ? "Tributário" : "Cível",
  };

  return {
    numeroLimpo: limpo,
    valido: true,
    numeroSequencial,
    digitoVerificador,
    ano,
    segmentoJustica,
    codigoTribunal,
    orgaoOrigem,
    tribunalInfo,
  };
}

/**
 * Serviço principal de integração com DataJud + Firebase
 */
export const datajudService = {
  /**
   * Executa a consulta pública no DataJud via servidor backend ou API direta,
   * e armazena o resultado na coleção 'datajud_consultas' do Firebase Firestore.
   */
  consultar: async (numeroCnj: string): Promise<DataJudConsultaResult> => {
    const user = auth.currentUser;
    const cnjInfo = extrairInfoCNJ(numeroCnj);

    logger.action("Consulta DataJud iniciada", { numeroCnj, valido: cnjInfo.valido });

    try {
      const response = await fetch("/api/datajud/consulta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroCnj }),
      });

      const responseText = await response.text();
      let responseData: any = null;
      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          // Content was not valid JSON
        }
      }

      if (!response.ok) {
        const errorMsg = responseData?.error || `Erro ${response.status}: Falha na comunicação com o serviço DataJud.`;
        throw new Error(errorMsg);
      }

      if (!responseData) {
        throw new Error("Serviço DataJud retornou resposta em branco.");
      }

      const resultado: DataJudConsultaResult = responseData;

      // Salva a consulta no Firebase Firestore para auditoria e histórico
      const consultaId = `dj-${Date.now()}`;
      const registroConsulta: DataJudConsulta = {
        id: consultaId,
        numeroCnj: resultado.numeroCnj || numeroCnj,
        dataConsulta: new Date().toISOString(),
        usuarioId: user?.uid || null,
        usuarioEmail: user?.email || null,
        resultado,
        status: "sucesso",
      };

      try {
        await setDoc(doc(db, "datajud_consultas", consultaId), registroConsulta);
        logger.info("system", "Consulta DataJud armazenada no Firebase", { consultaId, numeroCnj });
      } catch (fsError) {
        console.warn("Não foi possível salvar histórico de consulta no Firestore:", fsError);
      }

      return resultado;
    } catch (error: any) {
      logger.error("system", "Erro ao consultar DataJud", error);

      // Registra falha de consulta no Firebase
      const consultaId = `dj-err-${Date.now()}`;
      const registroErro: Partial<DataJudConsulta> = {
        id: consultaId,
        numeroCnj,
        dataConsulta: new Date().toISOString(),
        usuarioId: user?.uid || null,
        usuarioEmail: user?.email || null,
        status: "erro",
        mensagemErro: error.message || "Erro desconhecido",
      };
      setDoc(doc(db, "datajud_consultas", consultaId), registroErro).catch(() => {});

      throw error;
    }
  },

  /**
   * Sincroniza um processo específico cadastrado no Firebase Firestore com o DataJud
   */
  sincronizarProcesso: async (processo: Processo): Promise<{ novasMovimentacoes: number; processoAtualizado: Processo }> => {
    if (!processo.numeroCnj) {
      throw new Error("Processo não possui número CNJ cadastrado");
    }

    const resultado = await datajudService.consultar(processo.numeroCnj);

    // Identifica movimentações inéditas
    const movimentacoesExistentes = new Set(
      processo.movimentacoes.map((m) => `${m.data}_${m.descricao.trim().toLowerCase()}`)
    );

    const novas: MovimentacaoProcessual[] = [];
    for (const movDatajud of resultado.movimentacoes) {
      const chave = `${movDatajud.data}_${movDatajud.descricao.trim().toLowerCase()}`;
      if (!movimentacoesExistentes.has(chave)) {
        novas.push({
          id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          data: movDatajud.data,
          descricao: movDatajud.descricao,
          orgao: movDatajud.orgao || resultado.comarca || "DataJud",
          fonte: "DataJud",
          relevancia: "Alta",
          alertaIa: "Nova movimentação capturada automaticamente via DataJud CNJ",
        });
      }
    }

    const movimentacoesAtualizadas = [...novas, ...processo.movimentacoes].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    const patch: Partial<Processo> = {
      movimentacoes: movimentacoesAtualizadas,
      ultimaSincronizacaoDataJud: new Date().toISOString(),
      valorCausa: resultado.valorCausa || processo.valorCausa,
      tribunal: resultado.tribunal || processo.tribunal,
    };

    const processoAtualizado: Processo = {
      ...processo,
      ...patch,
    };

    // Persiste atualização no Firebase Firestore
    try {
      await updateDoc(doc(db, "processos", processo.id), patch as any);
      logger.action("Sincronização DataJud concluída para o processo", {
        processoId: processo.id,
        novasMovimentacoes: novas.length,
      });
    } catch (e) {
      logger.error("system", "Erro ao atualizar processo no Firestore pós DataJud", e);
    }

    return {
      novasMovimentacoes: novas.length,
      processoAtualizado,
    };
  },

  /**
   * Obtém o histórico de consultas DataJud salvas no Firebase Firestore
   */
  obterHistoricoConsultas: async (): Promise<DataJudConsulta[]> => {
    try {
      const q = query(collection(db, "datajud_consultas"), orderBy("dataConsulta", "desc"), limit(30));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as DataJudConsulta);
    } catch (error) {
      console.warn("Erro ao buscar histórico de consultas no Firestore:", error);
      return [];
    }
  },
};
