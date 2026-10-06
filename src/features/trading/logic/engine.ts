import { tradePnlUsd, type Direction } from "@/features/calculators/logic/risk";
import { roundMoney, roundTo } from "@/lib/money";
import { DEMO_MARGIN, pointValueUsd } from "@/modules/instruments";

/**
 * Shared trade-execution maths for the simulator, chart replay and backtesting.
 *
 * ALL COST FIGURES ARE ILLUSTRATIVE. Real spreads, commissions and exchange/NFA fees depend on the broker and
 * the market regime; verify yours before drawing conclusions from simulated results.
 *
 * Price space: every price a student sees ("quote space") is the synthetic series plus the instrument's basis.
 *  - bid  = quote-space price of the series;  ask = bid + spread
 *  - LONG  opens at ask, exits at the stop/target level (bid space)
 *  - SHORT opens at bid, exits at level + spread (buying back at the ask)
 * so a round trip always costs exactly one spread, plus commissions.
 */
export const DEMO_COSTS: Record<string, { spreadPoints: number; commissionPerSide: number; basisPoints: number }> = {
  YM: { spreadPoints: 1, commissionPerSide: 1.5, basisPoints: 0 },
  MYM: { spreadPoints: 1, commissionPerSide: 0.5, basisPoints: 0 },
  US30: { spreadPoints: 1.5, commissionPerSide: 0, basisPoints: -15 },
};

export function costsFor(symbol: string) {
  const c = DEMO_COSTS[symbol];
  if (!c) throw new Error(`Unknown instrument ${symbol}`);
  return c;
}

export interface Bar {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Quote {
  bid: number;
  ask: number;
}

export function quoteFor(symbol: string, bid: number): Quote {
  return { bid, ask: roundTo(bid + costsFor(symbol).spreadPoints, 4) };
}

export function entryFill(symbol: string, direction: Direction, bid: number): number {
  const q = quoteFor(symbol, bid);
  return direction === "LONG" ? q.ask : q.bid;
}

/** Price actually obtained when a LONG/SHORT position is closed at `level` (bid space). */
export function exitFill(symbol: string, direction: Direction, level: number): number {
  return direction === "LONG" ? level : roundTo(level + costsFor(symbol).spreadPoints, 4);
}

export interface PositionLevels {
  direction: Direction;
  stop: number | null;
  target: number | null;
}

export type ExitReasonKind = "STOP_LOSS" | "TAKE_PROFIT";

export interface BarHit {
  reason: ExitReasonKind;
  /** level price in bid space (before the spread on shorts) */
  level: number;
  gap: boolean;
}

/**
 * Decides whether a bar closes a position.
 *  1. Gaps at the open come first: the open is the first traded price, so a gap THROUGH the stop fills at the
 *     open (worse than the stop) and a gap beyond the target fills at the open (better than the target).
 *  2. Inside the bar, if both stop and target are reachable the STOP wins — OHLC cannot tell the order and the
 *     conservative assumption keeps backtests from flattering the student.
 */
export function resolveBar(p: PositionLevels, bar: Bar): BarHit | null {
  const long = p.direction === "LONG";
  const stopHitAtOpen = p.stop !== null && (long ? bar.open <= p.stop : bar.open >= p.stop);
  const targetHitAtOpen = p.target !== null && (long ? bar.open >= p.target : bar.open <= p.target);
  if (stopHitAtOpen) return { reason: "STOP_LOSS", level: bar.open, gap: true };
  if (targetHitAtOpen) return { reason: "TAKE_PROFIT", level: bar.open, gap: true };

  const stopHit = p.stop !== null && (long ? bar.low <= p.stop : bar.high >= p.stop);
  const targetHit = p.target !== null && (long ? bar.high >= p.target : bar.low <= p.target);
  if (stopHit) return { reason: "STOP_LOSS", level: p.stop!, gap: false };
  if (targetHit) return { reason: "TAKE_PROFIT", level: p.target!, gap: false };
  return null;
}

export interface ScanResult {
  hit: BarHit | null;
  /** index (within `bars`) of the bar that closed the position */
  barIndex: number | null;
}

export function scanBars(p: PositionLevels, bars: readonly Bar[]): ScanResult {
  for (let i = 0; i < bars.length; i++) {
    const hit = resolveBar(p, bars[i]!);
    if (hit) return { hit, barIndex: i };
  }
  return { hit: null, barIndex: null };
}

export interface ClosedTradeMath {
  exitPrice: number;
  points: number;
  gross: number;
  fees: number;
  net: number;
  /** R-multiple vs the initial stop distance; null when no stop was defined */
  rMultiple: number | null;
}

/** P&L of a position closed at `level` (bid space) — applies the exit spread and round-turn commissions. */
export function closeMath(i: { symbol: string; direction: Direction; contracts: number; entry: number; stop: number | null; level: number }): ClosedTradeMath {
  const exitPrice = exitFill(i.symbol, i.direction, i.level);
  const r = tradePnlUsd({
    symbol: i.symbol,
    direction: i.direction,
    entry: i.entry,
    exit: exitPrice,
    contracts: i.contracts,
    commissionRoundTurn: costsFor(i.symbol).commissionPerSide * 2,
  });
  const risk = i.stop === null ? 0 : Math.abs(i.entry - i.stop);
  return {
    exitPrice,
    points: r.points,
    gross: r.gross,
    fees: r.fees,
    net: r.net,
    rMultiple: risk > 0 ? roundTo(r.points / risk, 2) : null,
  };
}

/** Dollar risk at entry for a stop (market risk only — excludes commissions and slippage). */
export function riskAtEntry(symbol: string, contracts: number, entry: number, stop: number): number {
  return roundMoney(Math.abs(entry - stop) * pointValueUsd(symbol) * contracts);
}

export interface OpenTradeLike {
  symbol: string;
  direction: Direction;
  contracts: number;
  entryPrice: number;
}

export interface AccountSnapshotInput {
  balance: number;
  openTrades: readonly OpenTradeLike[];
  /** current bid-space price of each symbol */
  bids: Readonly<Record<string, number>>;
  dayStartEquity: number;
  peakEquity: number;
  maxDrawdown: number;
}

export interface AccountSnapshot {
  balance: number;
  equity: number;
  openPnl: number;
  usedMargin: number;
  freeMargin: number;
  dailyPnl: number;
  drawdown: number;
  peakEquity: number;
  maxDrawdown: number;
}

/** Mark-to-market at the price the position could be closed at (bid for longs, ask for shorts). */
export function accountSnapshot(i: AccountSnapshotInput): AccountSnapshot {
  let openPnl = 0;
  let usedMargin = 0;
  for (const t of i.openTrades) {
    const bid = i.bids[t.symbol];
    if (bid === undefined) continue;
    const exit = exitFill(t.symbol, t.direction, bid);
    const pts = t.direction === "LONG" ? exit - t.entryPrice : t.entryPrice - exit;
    openPnl += pts * pointValueUsd(t.symbol) * t.contracts;
    usedMargin += (DEMO_MARGIN[t.symbol] ?? 0) * t.contracts;
  }
  const equity = roundMoney(i.balance + openPnl);
  const peakEquity = Math.max(i.peakEquity, equity);
  const drawdown = roundMoney(peakEquity - equity);
  return {
    balance: roundMoney(i.balance),
    equity,
    openPnl: roundMoney(openPnl),
    usedMargin: roundMoney(usedMargin),
    freeMargin: roundMoney(equity - usedMargin),
    dailyPnl: roundMoney(equity - i.dayStartEquity),
    drawdown,
    peakEquity: roundMoney(peakEquity),
    maxDrawdown: roundMoney(Math.max(i.maxDrawdown, drawdown)),
  };
}

export function marginRequired(symbol: string, contracts: number): number {
  return roundMoney((DEMO_MARGIN[symbol] ?? 0) * contracts);
}
