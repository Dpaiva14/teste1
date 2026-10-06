import { positionSize, type Direction, type PositionSizeResult } from "@/features/calculators/logic/risk";
import { costsFor, entryFill } from "@/features/trading/logic/engine";
import { roundTo } from "@/lib/money";

export interface PreviewInput {
  symbol: string;
  choice: "BUY" | "SELL";
  balance: number;
  riskPercent: number;
  /** quote-space bid (close of the last visible candle) */
  bid: number;
  stopPoints: number;
  targetR: number | null;
}

export interface PreviewPlan {
  direction: Direction;
  entry: number;
  stop: number;
  target: number | null;
  sizing: PositionSizeResult;
}

/**
 * What the ticket shows BEFORE the student commits. It uses the same fill, stop/target and sizing rules as the
 * server (`takeTrade`), so the preview and the executed trade cannot disagree.
 */
export function previewPlan(i: PreviewInput): PreviewPlan | null {
  if (!(i.stopPoints > 0) || !(i.bid > 0)) return null;
  const direction: Direction = i.choice === "BUY" ? "LONG" : "SHORT";
  const entry = entryFill(i.symbol, direction, i.bid);
  const long = direction === "LONG";
  const stop = roundTo(long ? entry - i.stopPoints : entry + i.stopPoints, 4);
  const target = i.targetR === null || !(i.targetR > 0) ? null : roundTo(long ? entry + i.stopPoints * i.targetR : entry - i.stopPoints * i.targetR, 4);
  const sizing = positionSize({ balance: i.balance, riskPercent: i.riskPercent, symbol: i.symbol, direction, entry, stop, target, commissionRoundTurn: costsFor(i.symbol).commissionPerSide * 2 });
  return { direction, entry, stop, target, sizing };
}
