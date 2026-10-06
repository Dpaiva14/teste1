import { MIN_RR } from "./checklist";

/**
 * Process evaluation: judges HOW a trade was prepared and managed — never whether it made money.
 * Used by Chart Replay (per trade) and the Final Assessment.
 */
export interface TradeEvaluationInput {
  hasStop: boolean;
  rewardRisk: number | null;
  /** % of balance risked at entry (null if unknown / no stop) */
  riskPercent: number | null;
  checklistPercent: number | null;
  /** did the student mark at least one level/zone/structure/fib BEFORE entering? */
  prepared: boolean;
  entryReason: string | null;
  exitedBy: "STOP_LOSS" | "TAKE_PROFIT" | "MANUAL" | "END_OF_DATA" | null;
  /** has a written thesis (why am I considering this trade) */
  hasThesis?: boolean;
}

export interface CriterionResult {
  key: string;
  label: string;
  earned: number;
  max: number;
  comment: string;
}

export interface TradeEvaluation {
  score: number; // 0..100
  criteria: CriterionResult[];
  grade: "excelente" | "bom" | "a melhorar" | "fraco";
}

export function gradeOf(score: number): TradeEvaluation["grade"] {
  return score >= 85 ? "excelente" : score >= 70 ? "bom" : score >= 50 ? "a melhorar" : "fraco";
}

export const MAX_RISK_PERCENT = 2;

export function evaluateTrade(t: TradeEvaluationInput): TradeEvaluation {
  const c: CriterionResult[] = [];
  const add = (key: string, label: string, earned: number, max: number, comment: string) => c.push({ key, label, earned: Math.round(earned * 10) / 10, max, comment });

  add("stop", "Stop Loss definido", t.hasStop ? 20 : 0, 20, t.hasStop ? "Definiste onde a ideia fica invalidada antes de entrar." : "Sem stop, o risco é ilimitado e a saída fica entregue à emoção.");

  const rrOk = t.rewardRisk !== null && t.rewardRisk >= MIN_RR;
  add(
    "rr",
    `R:R ≥ ${MIN_RR}`,
    rrOk ? 15 : t.rewardRisk !== null && t.rewardRisk >= 1 ? 7 : 0,
    15,
    t.rewardRisk === null ? "Sem alvo definido não há R:R planeado." : rrOk ? `R:R planeado de ${t.rewardRisk}:1.` : `R:R planeado de ${t.rewardRisk}:1 — exige uma taxa de acerto alta só para empatar.`,
  );

  const riskOk = t.riskPercent !== null && t.riskPercent <= MAX_RISK_PERCENT;
  add(
    "risk",
    `Risco ≤ ${MAX_RISK_PERCENT}% da conta`,
    riskOk ? 15 : t.riskPercent !== null && t.riskPercent <= 3 ? 7 : 0,
    15,
    t.riskPercent === null ? "Não foi possível medir o risco (sem stop)." : `Arriscaste ${t.riskPercent}% da conta.${riskOk ? "" : " Perdas seguidas esgotam a conta depressa a este nível."}`,
  );

  const cp = t.checklistPercent ?? 0;
  add("checklist", "Checklist pré-trade", (cp / 100) * 15, 15, t.checklistPercent === null ? "Checklist não preenchida." : cp >= 100 ? "Checklist completa." : `Checklist ${cp}% completa — itens em falta são hipóteses não verificadas.`);

  add("prep", "Preparação no gráfico", t.prepared ? 15 : 0, 15, t.prepared ? "Marcaste níveis/estrutura antes de entrar." : "Não marcaste níveis, zonas, estrutura ou Fibonacci antes de entrar: a entrada ficou sem referências.");

  const reasonScore = t.entryReason === "SETUP_VALID" ? 10 : t.entryReason === "OTHER" ? 4 : 0;
  add(
    "reason",
    "Razão de entrada",
    reasonScore,
    10,
    t.entryReason === "SETUP_VALID" ? "Entraste por um setup que considerou válido." : t.entryReason === "OTHER" ? "Razão não especificada: tenta descrevê-la." : "Razão emocional (FOMO, vingança, tédio ou medo): um sinal para parar e rever as regras.",
  );

  const exit = t.exitedBy === "STOP_LOSS" || t.exitedBy === "TAKE_PROFIT" ? 10 : t.exitedBy === "MANUAL" ? 5 : t.exitedBy === "END_OF_DATA" ? 5 : 0;
  add("exit", "Disciplina de saída", exit, 10, exit === 10 ? "Saíste pelo plano (stop ou alvo)." : "Saída manual/discricionária: legítima, mas pergunta-te se foi plano ou emoção.");

  const score = Math.round(c.reduce((s, x) => s + x.earned, 0));
  return { score, criteria: c, grade: gradeOf(score) };
}

export function averageEvaluation(evals: readonly TradeEvaluation[]): number | null {
  if (evals.length === 0) return null;
  return Math.round(evals.reduce((s, e) => s + e.score, 0) / evals.length);
}
