import type { Direction } from "@/features/calculators/logic/risk";
import { accountSnapshot, closeMath, costsFor, resolveBar, type Bar, type ClosedTradeMath, type ExitReasonKind } from "./engine";

export interface AdvTrade {
  id: string;
  symbol: string;
  direction: Direction;
  contracts: number;
  entryPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
}

export interface AdvClosed {
  tradeId: string;
  reason: ExitReasonKind;
  /** index within the bars passed to advance() */
  barIndex: number;
  gap: boolean;
  math: ClosedTradeMath;
}

export interface AdvInput {
  balance: number;
  peakEquity: number;
  maxDrawdown: number;
  dayStartEquity: number;
  openTrades: readonly AdvTrade[];
  /** bars in "series space" (before the instrument basis) */
  bars: readonly Bar[];
}

export interface AdvResult {
  closed: AdvClosed[];
  balance: number;
  peakEquity: number;
  maxDrawdown: number;
  stillOpen: AdvTrade[];
  /** last bar's close in series space (for marking to market) */
  lastClose: number | null;
}

const shift = (b: Bar, basis: number): Bar => (basis === 0 ? b : { open: b.open + basis, high: b.high + basis, low: b.low + basis, close: b.close + basis });

/**
 * Moves an account forward through `bars`, closing trades whose stop/target is hit (gap-aware, stop wins ties),
 * and tracking peak equity and max drawdown BAR BY BAR so intrabar-close drawdowns are not missed.
 */
export function advanceAccount(i: AdvInput): AdvResult {
  let balance = i.balance;
  let peak = i.peakEquity;
  let maxDd = i.maxDrawdown;
  let open = [...i.openTrades];
  const closed: AdvClosed[] = [];

  i.bars.forEach((bar, barIndex) => {
    for (const t of [...open]) {
      const basis = costsFor(t.symbol).basisPoints;
      const hit = resolveBar({ direction: t.direction, stop: t.stopLoss, target: t.takeProfit }, shift(bar, basis));
      if (!hit) continue;
      const math = closeMath({ symbol: t.symbol, direction: t.direction, contracts: t.contracts, entry: t.entryPrice, stop: t.stopLoss, level: hit.level });
      balance += math.net;
      open = open.filter((o) => o.id !== t.id);
      closed.push({ tradeId: t.id, reason: hit.reason, barIndex, gap: hit.gap, math });
    }
    const bids: Record<string, number> = {};
    for (const t of open) bids[t.symbol] = bar.close + costsFor(t.symbol).basisPoints;
    const snap = accountSnapshot({ balance, openTrades: open, bids, dayStartEquity: i.dayStartEquity, peakEquity: peak, maxDrawdown: maxDd });
    peak = snap.peakEquity;
    maxDd = snap.maxDrawdown;
  });

  return {
    closed,
    balance: Math.round(balance * 100) / 100,
    peakEquity: peak,
    maxDrawdown: maxDd,
    stillOpen: open,
    lastClose: i.bars.length ? i.bars[i.bars.length - 1]!.close : null,
  };
}
