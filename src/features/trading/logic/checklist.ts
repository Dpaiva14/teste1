export type ChecklistKey =
  | "htfAnalysed"
  | "structureIdentified"
  | "keyLevel"
  | "trendIdentified"
  | "entryZone"
  | "confluence"
  | "confirmation"
  | "stopDefined"
  | "riskCalculated"
  | "rrAcceptable"
  | "newsChecked"
  | "noEmotion";

export interface ChecklistItem {
  key: ChecklistKey;
  label: string;
  /** can be verified automatically from the order ticket */
  auto?: boolean;
  why: string;
}

/** Spec §29 — the pre-trade checklist. Missing items produce an educational warning, never a block. */
export const CHECKLIST: readonly ChecklistItem[] = [
  { key: "htfAnalysed", label: "Higher timeframe analisado", why: "O timeframe superior dá o contexto: estás a operar a favor ou contra ele?" },
  { key: "structureIdentified", label: "Market structure identificada", why: "Sem estrutura clara, não sabes o que invalida a ideia." },
  { key: "keyLevel", label: "Nível-chave identificado", why: "Os níveis dão sentido à entrada, ao stop e ao alvo." },
  { key: "trendIdentified", label: "Tendência identificada", why: "Operar a favor da tendência (ou saber que estás contra) é uma decisão consciente." },
  { key: "entryZone", label: "Zona de entrada definida", why: "Uma zona antecipada evita perseguir o preço." },
  { key: "confluence", label: "Confluência identificada", why: "Uma entrada não deve depender de uma única razão." },
  { key: "confirmation", label: "Confirmação presente", why: "Esperar confirmação reduz entradas por esperança." },
  { key: "stopDefined", label: "Stop Loss definido", auto: true, why: "Sem stop, o risco é ilimitado e a decisão de sair fica entregue à emoção." },
  { key: "riskCalculated", label: "Risco calculado", auto: true, why: "O tamanho deve resultar do risco definido, não do desejo de ganhar." },
  { key: "rrAcceptable", label: "R:R aceitável (≥ 1,5)", auto: true, why: "Um R:R baixo exige uma taxa de acerto alta só para empatar." },
  { key: "newsChecked", label: "Notícias económicas verificadas", why: "Eventos de alto impacto alteram spread, slippage e volatilidade." },
  { key: "noEmotion", label: "Nenhuma razão emocional para entrar", why: "FOMO, vingança e tédio são más razões. Sê honesto contigo." },
];

export type ChecklistAnswers = Partial<Record<ChecklistKey, boolean>>;

export interface ChecklistEvaluation {
  checked: number;
  total: number;
  missing: ChecklistItem[];
  complete: boolean;
  /** 0..100 */
  percent: number;
  warning: string | null;
}

export const MIN_RR = 1.5;

/** Items verifiable from the ticket are computed from facts, so a student cannot "tick" a stop that does not exist. */
export function autoChecks(t: { stop: number | null; contracts: number; rewardRisk: number | null }): Pick<Record<ChecklistKey, boolean>, "stopDefined" | "riskCalculated" | "rrAcceptable"> {
  return {
    stopDefined: t.stop !== null,
    riskCalculated: t.stop !== null && t.contracts > 0,
    rrAcceptable: t.rewardRisk !== null && t.rewardRisk >= MIN_RR,
  };
}

export function evaluateChecklist(answers: ChecklistAnswers): ChecklistEvaluation {
  const missing = CHECKLIST.filter((i) => !answers[i.key]);
  const checked = CHECKLIST.length - missing.length;
  return {
    checked,
    total: CHECKLIST.length,
    missing,
    complete: missing.length === 0,
    percent: Math.round((checked / CHECKLIST.length) * 100),
    warning: missing.length
      ? `Faltam ${missing.length} de ${CHECKLIST.length} itens: ${missing.map((m) => m.label.toLowerCase()).join(", ")}. Podes avançar — mas regista o que sentiste: faltou-te informação ou pressa?`
      : null,
  };
}
