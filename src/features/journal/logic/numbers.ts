import { rMultiple, tradePnlUsd } from "@/features/calculators/logic/risk";
import { roundMoney, roundTo } from "@/lib/money";
import { pointValueUsd } from "@/modules/instruments";
import type { JournalInput } from "../schemas";

export class MissingResultError extends Error {
  constructor() {
    super("Indica o preço de saída ou o resultado ($).");
  }
}

/**
 * Computes the fields a student should not have to calculate (risk $, result $, R). Values supplied by the user
 * (e.g. broker P&L with real fees) win over the computed ones.
 */
export function computeEntryNumbers(i: Pick<JournalInput, "instrument" | "direction" | "entryPrice" | "stopLoss" | "exitPrice" | "contracts" | "riskAmount" | "result">) {
  const pv = pointValueUsd(i.instrument);
  const stopPoints = Math.abs(i.entryPrice - i.stopLoss);
  const riskAmount = i.riskAmount ?? roundMoney(stopPoints * pv * i.contracts);
  let result = i.result ?? null;
  let r: number | null = null;
  if (i.exitPrice != null) {
    if (result === null) result = tradePnlUsd({ symbol: i.instrument, direction: i.direction, entry: i.entryPrice, exit: i.exitPrice, contracts: i.contracts }).net;
    r = rMultiple({ direction: i.direction, entry: i.entryPrice, stop: i.stopLoss, exit: i.exitPrice });
  }
  if (r === null && result !== null && riskAmount > 0) r = roundTo(result / riskAmount, 2);
  if (result === null) throw new MissingResultError();
  return { riskAmount, result: roundMoney(result), rMultiple: r ?? 0 };
}

