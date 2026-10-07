import { resolveBar } from "@/features/trading/logic/engine";
import { pointValueUsd } from "@/modules/instruments";
import type { Candle } from "@/lib/market-data/types";
import { roundMoney, roundTo } from "@/lib/money";
import { ASSESSMENT_SYMBOL, type Answers } from "../schemas";
import { planMetrics } from "./evaluate";

/**
 * "What happened next" — shown AFTER submission as information. It is never an input to the score.
 * Simplified and optimistic-free: the plan is treated as a pending order at `entry`; on the fill bar the worst case is assumed
 * (a stop inside that bar fills the stop); afterwards stop and target are resolved bar by bar with the shared engine rules
 * (gap fills at the open, stop wins ties). No spread/commission: figures are indicative.
 */

export const FILL_WINDOW = 40;

export type OutcomeStatus = "NOT_FILLED" | "TARGET" | "STOP" | "OPEN_AT_END" | "INVALID";

export interface OutcomeReveal {
  status: OutcomeStatus;
  /** absolute indices */
  fillIndex: number | null;
  exitIndex: number | null;
  exitPrice: number | null;
  points: number | null;
  r: number | null;
  /** indicative P&L with the student's contracts (no costs) */
  pnl: number | null;
  /** was the decision TAKE? (WAIT results are hypothetical: "o que teria acontecido") */
  hypothetical: boolean;
  note: string;
}

export function revealOutcome(a: Answers, future: readonly Candle[], firstFutureIndex: number): OutcomeReveal {
  const hypothetical = a.decision !== "TAKE";
  const base = { fillIndex: null, exitIndex: null, exitPrice: null, points: null, r: null, pnl: null, hypothetical } as const;
  const plan = planMetrics(a);
  if (!plan.valid || a.direction === null || a.entry === null || a.stop === null || plan.stopPoints === null) {
    return { ...base, status: "INVALID", note: "O plano tem um erro de coerência (lados do stop/alvo), por isso não é possível simular o que teria acontecido." };
  }
  const long = a.direction === "LONG";
  const entry = a.entry;
  const stop = a.stop;
  const target = a.target;
  const contracts = a.contracts ?? 0;

  let fill = -1;
  for (let i = 0; i < Math.min(FILL_WINDOW, future.length); i++) {
    const b = future[i]!;
    if (b.low <= entry && entry <= b.high) {
      fill = i;
      break;
    }
  }
  if (fill < 0) return { ...base, status: "NOT_FILLED", note: `O preço não chegou ao teu nível de entrada (${entry}) nas ${Math.min(FILL_WINDOW, future.length)} barras seguintes: a ordem não teria sido executada. Não entrar também é um resultado possível de um plano.` };

  const finish = (status: "TARGET" | "STOP" | "OPEN_AT_END", idx: number, exitPrice: number, note: string): OutcomeReveal => {
    const points = roundTo(long ? exitPrice - entry : entry - exitPrice, 2);
    return {
      status,
      fillIndex: firstFutureIndex + fill,
      exitIndex: firstFutureIndex + idx,
      exitPrice: roundTo(exitPrice, 2),
      points,
      r: roundTo(points / plan.stopPoints!, 2),
      pnl: roundMoney(points * pointValueUsd(ASSESSMENT_SYMBOL) * contracts),
      hypothetical,
      note,
    };
  };

  const fillBar = future[fill]!;
  if (long ? fillBar.low <= stop : fillBar.high >= stop) return finish("STOP", fill, stop, "Na barra da entrada o preço também tocou o stop; assume-se o pior caso (stop).");

  for (let i = fill + 1; i < future.length; i++) {
    const hit = resolveBar({ direction: a.direction, stop, target }, future[i]!);
    if (hit) {
      const exit = hit.level;
      if (hit.reason === "STOP_LOSS") return finish("STOP", i, exit, hit.gap ? "O stop foi ultrapassado por um gap: saída no preço de abertura (pior do que o stop)." : "O stop foi atingido.");
      return finish("TARGET", i, exit, hit.gap ? "O alvo foi ultrapassado por um gap: saída no preço de abertura (melhor do que o alvo)." : "O alvo foi atingido.");
    }
  }
  const last = future[future.length - 1]!;
  return finish("OPEN_AT_END", future.length - 1, last.close, "Nem o stop nem o alvo foram atingidos no período mostrado; resultado marcado ao último fecho.");
}
