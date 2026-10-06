import { roundMoney, roundTo } from "@/lib/money";
import { mean } from "@/lib/utils";

/** Shared performance maths for the journal, backtests and the simulator. Pure, no I/O. */

export interface PerfTrade {
  /** net P&L in account currency (after costs) */
  pnl: number;
  /** result in R (units of initial risk), when known */
  r: number | null;
}

export interface PerformanceStats {
  trades: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number; // %
  lossRate: number; // %
  avgWin: number;
  avgLoss: number; // negative number
  /** avg win ÷ |avg loss| */
  payoff: number | null;
  /** money per trade */
  expectancy: number;
  /** R per trade (mean of known R values) */
  avgR: number | null;
  totalPnl: number;
  profitFactor: number | null; // null = no losses (infinite) or no trades
  maxDrawdown: number; // money, positive
  maxDrawdownPercent: number | null; // of peak equity, needs startingBalance
  maxDrawdownR: number | null;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  /** positive = current winning streak, negative = losing streak */
  currentStreak: number;
  best: number;
  worst: number;
  equityCurve: number[]; // starts with startingBalance (or 0)
}

export function performanceStats(trades: readonly PerfTrade[], opts: { startingBalance?: number } = {}): PerformanceStats {
  const start = opts.startingBalance ?? 0;
  const n = trades.length;
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const grossWin = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = losses.reduce((s, t) => s + t.pnl, 0);

  // Equity & drawdown
  let equity = start;
  let peak = start;
  let maxDd = 0;
  let maxDdPct = 0;
  const curve = [start];
  for (const t of trades) {
    equity += t.pnl;
    curve.push(roundMoney(equity));
    peak = Math.max(peak, equity);
    const dd = peak - equity;
    if (dd > maxDd) {
      maxDd = dd;
      maxDdPct = peak > 0 ? (dd / peak) * 100 : 0;
    }
  }

  // R drawdown on the cumulative-R curve
  const rs = trades.map((t) => t.r).filter((r): r is number => r !== null);
  let cumR = 0;
  let peakR = 0;
  let maxDdR = 0;
  for (const r of rs) {
    cumR += r;
    peakR = Math.max(peakR, cumR);
    maxDdR = Math.max(maxDdR, peakR - cumR);
  }

  // Streaks
  let curW = 0;
  let curL = 0;
  let maxW = 0;
  let maxL = 0;
  for (const t of trades) {
    if (t.pnl > 0) {
      curW++;
      curL = 0;
    } else if (t.pnl < 0) {
      curL++;
      curW = 0;
    } else {
      curW = 0;
      curL = 0;
    }
    maxW = Math.max(maxW, curW);
    maxL = Math.max(maxL, curL);
  }

  const avgWin = wins.length ? grossWin / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;
  return {
    trades: n,
    wins: wins.length,
    losses: losses.length,
    breakeven: n - wins.length - losses.length,
    winRate: n ? roundTo((wins.length / n) * 100, 1) : 0,
    lossRate: n ? roundTo((losses.length / n) * 100, 1) : 0,
    avgWin: roundMoney(avgWin),
    avgLoss: roundMoney(avgLoss),
    payoff: avgLoss < 0 ? roundTo(avgWin / Math.abs(avgLoss), 2) : null,
    expectancy: n ? roundMoney((grossWin + grossLoss) / n) : 0,
    avgR: rs.length ? roundTo(mean(rs), 2) : null,
    totalPnl: roundMoney(grossWin + grossLoss),
    profitFactor: grossLoss < 0 ? roundTo(grossWin / Math.abs(grossLoss), 2) : null,
    maxDrawdown: roundMoney(maxDd),
    maxDrawdownPercent: opts.startingBalance ? roundTo(maxDdPct, 2) : null,
    maxDrawdownR: rs.length ? roundTo(maxDdR, 2) : null,
    maxConsecutiveWins: maxW,
    maxConsecutiveLosses: maxL,
    currentStreak: curW > 0 ? curW : curL > 0 ? -curL : 0,
    best: n ? roundMoney(Math.max(...trades.map((t) => t.pnl))) : 0,
    worst: n ? roundMoney(Math.min(...trades.map((t) => t.pnl))) : 0,
    equityCurve: curve,
  };
}

export interface GroupStats {
  key: string;
  trades: number;
  winRate: number;
  totalPnl: number;
  avgR: number | null;
  expectancy: number;
}

export function groupPerformance<T extends PerfTrade>(trades: readonly T[], keyOf: (t: T) => string | null | undefined): GroupStats[] {
  const groups = new Map<string, T[]>();
  for (const t of trades) {
    const k = keyOf(t);
    if (!k) continue;
    groups.set(k, [...(groups.get(k) ?? []), t]);
  }
  return [...groups.entries()].map(([key, list]) => {
    const s = performanceStats(list);
    return { key, trades: s.trades, winRate: s.winRate, totalPnl: s.totalPnl, avgR: s.avgR, expectancy: s.expectancy };
  });
}

/**
 * Best/worst group by expectancy (avg R when available, otherwise money). Groups with fewer than `minTrades`
 * are excluded: a "best setup" built on one trade is noise. Returns null when no group qualifies.
 */
export function bestAndWorst(groups: readonly GroupStats[], minTrades = 3): { best: GroupStats; worst: GroupStats } | null {
  const eligible = groups.filter((g) => g.trades >= minTrades);
  if (eligible.length === 0) return null;
  const score = (g: GroupStats) => g.avgR ?? g.expectancy;
  const sorted = [...eligible].sort((a, b) => score(b) - score(a));
  return { best: sorted[0]!, worst: sorted[sorted.length - 1]! };
}

/** Compounding equity curve for R-based results with a fixed % risk per trade. */
export function equityFromR(initialBalance: number, riskPercent: number, rs: readonly number[]): number[] {
  const curve = [initialBalance];
  let bal = initialBalance;
  for (const r of rs) {
    bal += bal * (riskPercent / 100) * r;
    curve.push(roundMoney(bal));
  }
  return curve;
}
