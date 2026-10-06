import { rewardRisk } from "@/features/calculators/logic/risk";
import type { ConfluenceFactorKey, ConfluenceSolution, ScenarioDef } from "@/modules/scenarios/types";

export interface FactorMeta {
  key: ConfluenceFactorKey;
  label: string;
  question: string;
}

/** The eight educational factors of the Confluence Score (spec §13). Each is worth +1. */
export const CONFLUENCE_FACTORS: readonly FactorMeta[] = [
  { key: "trend", label: "Alinhamento de tendência", question: "A direção do trade está alinhada com a tendência de trabalho (e com o contexto superior)?" },
  { key: "structure", label: "Market structure", question: "A estrutura (HH/HL ou LH/LL) suporta a ideia e continua intacta?" },
  { key: "sr", label: "Suporte / Resistência", question: "A entrada está numa zona de S/R relevante (incluindo níveis que mudaram de função)?" },
  { key: "supplyDemand", label: "Oferta / Procura", question: "Existe uma zona de oferta/procura fresca junto à entrada?" },
  { key: "fibonacci", label: "Fibonacci", question: "A entrada coincide com uma zona de retracement de um swing relevante?" },
  { key: "priceAction", label: "Confirmação de price action", question: "Há confirmação no candle (rejeição, engulfing, rompimento com fecho) — e não apenas a esperança?" },
  { key: "liquidity", label: "Contexto de liquidez", question: "Há liquidez evidente (equal highs/lows, máximos/mínimos do dia) varrida ou como alvo?" },
  { key: "riskReward", label: "Risk/Reward aceitável", question: "O R:R com stop técnico e alvo realista é ≥ 1,5?" },
];

export const MIN_ACCEPTABLE_RR = 1.5;

export type ConfluenceDecision = "TAKE" | "NO_TRADE";

export interface ConfluenceAnswer {
  selected: readonly ConfluenceFactorKey[];
  decision: ConfluenceDecision;
}

export function confluenceScore(selected: readonly ConfluenceFactorKey[]): number {
  return new Set(selected).size;
}

export function scenarioRewardRisk(sol: ConfluenceSolution) {
  return rewardRisk({ direction: sol.direction, entry: sol.entry, stop: sol.stop, target: sol.target });
}

export interface ConfluenceCheck {
  scorePercent: number;
  factors: { key: ConfluenceFactorKey; label: string; selected: boolean; present: boolean; correct: boolean; note: string }[];
  studentScore: number;
  trueScore: number;
  decision: ConfluenceDecision;
  recommendedDecision: ConfluenceDecision;
  decisionCorrect: boolean;
  rr: number | null;
  verdict: string;
  quality: "forte" | "média" | "fraca";
}

export function processQuality(trueScore: number): "forte" | "média" | "fraca" {
  return trueScore >= 6 ? "forte" : trueScore >= 4 ? "média" : "fraca";
}

/**
 * Grades both the analysis (are the factors identified correctly? 85%) and the decision (15%).
 * The "recommended" decision follows the PROCESS (score ≥ 6 incl. acceptable R:R) — never the outcome.
 */
export function checkConfluence(def: ScenarioDef, answer: ConfluenceAnswer): ConfluenceCheck {
  if (!def.confluence) throw new Error(`Scenario ${def.id} has no confluence solution`);
  const sol = def.confluence;
  const selected = new Set(answer.selected);
  const factors = CONFLUENCE_FACTORS.map((f) => {
    const truth = sol.factors[f.key];
    const sel = selected.has(f.key);
    return { key: f.key, label: f.label, selected: sel, present: truth.present, correct: sel === truth.present, note: truth.note };
  });
  const trueScore = factors.filter((f) => f.present).length;
  const recommendedDecision: ConfluenceDecision = trueScore >= 6 && sol.factors.riskReward.present ? "TAKE" : "NO_TRADE";
  const decisionCorrect = answer.decision === recommendedDecision;
  const accuracy = factors.filter((f) => f.correct).length / factors.length;
  return {
    scorePercent: Math.round(accuracy * 85 + (decisionCorrect ? 15 : 0)),
    factors,
    studentScore: factors.filter((f) => f.selected).length,
    trueScore,
    decision: answer.decision,
    recommendedDecision,
    decisionCorrect,
    rr: scenarioRewardRisk(sol).ratio,
    verdict: sol.verdict,
    quality: processQuality(trueScore),
  };
}

export type TradeOutcome = "TARGET" | "STOP" | "OPEN";

export interface OutcomeResult {
  outcome: TradeOutcome;
  /** bars after the decision candle until the exit (1-based), or null if still open */
  barsToExit: number | null;
  /** R-multiple of the result (target → +R:R, stop → −1, open → mark-to-market at the last close) */
  rMultiple: number;
}

/**
 * Replays the "future" candles to see what would have happened. A bar that touches both stop and target is
 * counted as a STOP (the conservative assumption — intrabar order is unknowable from OHLC).
 */
export function simulateOutcome(
  future: readonly { high: number; low: number; close: number }[],
  sol: Pick<ConfluenceSolution, "direction" | "entry" | "stop" | "target">,
): OutcomeResult {
  const risk = Math.abs(sol.entry - sol.stop);
  const long = sol.direction === "LONG";
  for (let i = 0; i < future.length; i++) {
    const c = future[i]!;
    const hitStop = long ? c.low <= sol.stop : c.high >= sol.stop;
    const hitTarget = long ? c.high >= sol.target : c.low <= sol.target;
    if (hitStop) return { outcome: "STOP", barsToExit: i + 1, rMultiple: -1 };
    if (hitTarget) return { outcome: "TARGET", barsToExit: i + 1, rMultiple: Math.round((Math.abs(sol.target - sol.entry) / risk) * 100) / 100 };
  }
  const last = future[future.length - 1];
  const open = last ? (long ? last.close - sol.entry : sol.entry - last.close) / risk : 0;
  return { outcome: "OPEN", barsToExit: null, rMultiple: Math.round(open * 100) / 100 };
}
