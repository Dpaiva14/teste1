import { z } from "@/lib/zod";
import { ENTRY_REASON_KEYS } from "@/features/trading/schemas";

/**
 * Final Assessment (spec §46). The student receives an UNKNOWN historical DEMO chart and walks through 12 decision steps.
 * The evaluation judges the PROCESS (coherence, rule application, risk) — never whether the trade would have won.
 */

export const ASSESSMENT_SYMBOL = "MYM";
/** MYM and YM trade the same index; the DEMO feed is generated as YM (basis 0). */
export const ASSESSMENT_FEED_SYMBOL = "YM";
export const ASSESSMENT_TIMEFRAME = "M15" as const;
export const ACCOUNT_BALANCE = 10_000;
export const RISK_PERCENT = 1;
/** Bars generated: the student sees the first `decisionIndex` ones; the rest is the "what happened next" reveal. */
export const TOTAL_BARS = 520;
export const REVEAL_BARS = 120;
export const MIN_DECISION_INDEX = 240;
export const MAX_DECISION_INDEX = TOTAL_BARS - REVEAL_BARS - 20;
/** Candles sent to the browser (older ones are not needed to take the decision). */
export const VISIBLE_WINDOW = 220;
export const PASS_SCORE = 70;
export const MAX_ATTEMPTS_IN_PROGRESS = 1;
export const MAX_ATTEMPTS = 20;

export const STEP_KEYS = ["trend", "structure", "sr", "supplyDemand", "fibonacci", "confluence", "liquidity", "entry", "stop", "target", "size", "reason"] as const;
export type StepKey = (typeof STEP_KEYS)[number];

export const STEP_META: Record<StepKey, { n: number; title: string; question: string }> = {
  trend: { n: 1, title: "Tendência", question: "Qual é a tendência de trabalho neste gráfico?" },
  structure: { n: 2, title: "Market structure", question: "Que estrutura formam os últimos swings (HH/HL, LH/LL ou lateral)?" },
  sr: { n: 3, title: "Suporte / Resistência", question: "Marca no gráfico os níveis de S/R mais relevantes (cada clique é um nível)." },
  supplyDemand: { n: 4, title: "Oferta e procura", question: "Marca as zonas de oferta e de procura (arrasta para desenhar uma zona)." },
  fibonacci: { n: 5, title: "Fibonacci", question: "Aplica o Fibonacci ao movimento dominante (arrasta do início ao fim do impulso)." },
  confluence: { n: 6, title: "Confluência", question: "Que fatores independentes se alinham com a tua ideia? Marca apenas os que consegues apontar no gráfico." },
  liquidity: { n: 7, title: "Liquidez", question: "Onde estão os stops óbvios (equal highs/lows)? Marca os níveis ou indica que não há." },
  entry: { n: 8, title: "Entrada", question: "Define a direção e o preço de entrada do teu plano." },
  stop: { n: 9, title: "Stop loss", question: "Onde é que a ideia fica invalidada?" },
  target: { n: 10, title: "Take profit", question: "Qual é o alvo e que R:R resulta?" },
  size: { n: 11, title: "Tamanho da posição", question: "Quantos contratos MYM respeitam o risco definido?" },
  reason: { n: 12, title: "Razão do trade", question: "Porque estás a considerar este trade, o que o invalida e vais tomá-lo?" },
};

export const FACTOR_KEYS = ["trend", "structure", "sr", "supplyDemand", "fibonacci", "priceAction", "liquidity", "riskReward"] as const;
export type FactorKey = (typeof FACTOR_KEYS)[number];

const price = z.number().finite().min(1).max(1_000_000);
const barIndex = z.number().int().min(0).max(100_000);
const id = z.string().regex(/^[a-z0-9-]{1,24}$/);
const point = z.object({ index: barIndex, price });

export const answersSchema = z.object({
  trend: z.enum(["UP", "DOWN", "RANGE"]).nullable().default(null),
  structure: z.enum(["BULLISH", "BEARISH", "RANGE"]).nullable().default(null),
  sr: z.array(z.object({ id, price })).max(8).default([]),
  zones: z.array(z.object({ id, role: z.enum(["supply", "demand"]), top: price, bottom: price, fromIndex: barIndex })).max(6).default([]),
  fib: z.object({ from: point, to: point }).nullable().default(null),
  confluence: z.array(z.enum(FACTOR_KEYS)).max(8).default([]),
  liquidity: z.object({ levels: z.array(z.object({ id, price })).max(4).default([]), none: z.boolean().default(false) }).default({ levels: [], none: false }),
  direction: z.enum(["LONG", "SHORT"]).nullable().default(null),
  entry: price.nullable().default(null),
  stop: price.nullable().default(null),
  target: price.nullable().default(null),
  contracts: z.number().int().min(0).max(1000).nullable().default(null),
  decision: z.enum(["TAKE", "WAIT"]).nullable().default(null),
  entryReason: z.enum(ENTRY_REASON_KEYS).nullable().default(null),
  reason: z.string().trim().max(1200).default(""),
  invalidation: z.string().trim().max(600).default(""),
  /** Steps the student has consciously confirmed ("Continuar"). Empty answers (e.g. no liquidity) only count once confirmed. */
  done: z.array(z.enum(STEP_KEYS)).max(12).default([]),
});
export type Answers = z.infer<typeof answersSchema>;

export const EMPTY_ANSWERS: Answers = answersSchema.parse({});

export const saveDraftSchema = z.object({ answers: answersSchema });

/** What is still missing before the assessment can be submitted (empty = ready). */
export function completenessProblems(a: Answers): string[] {
  const out: string[] = [];
  const done = new Set(a.done);
  for (const k of STEP_KEYS) if (!done.has(k)) out.push(`Passo ${STEP_META[k].n} (${STEP_META[k].title}) por confirmar.`);
  if (a.trend === null) out.push("Indica a tendência.");
  if (a.structure === null) out.push("Indica a estrutura.");
  if (a.direction === null || a.entry === null) out.push("Define a direção e o preço de entrada.");
  if (a.stop === null) out.push("Define o stop loss.");
  if (a.target === null) out.push("Define o take profit.");
  if (a.contracts === null) out.push("Indica o número de contratos.");
  if (a.decision === null) out.push("Indica se vais tomar o trade ou esperar.");
  if (a.entryReason === null) out.push("Indica a razão da entrada.");
  if (a.reason.trim().length < 10) out.push("Escreve a razão do trade (mínimo 10 caracteres).");
  if (a.invalidation.trim().length < 5) out.push("Escreve o que invalida a tua tese.");
  return out;
}
