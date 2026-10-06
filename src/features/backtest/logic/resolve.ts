import { positionSize, type Direction } from "@/features/calculators/logic/risk";
import { advanceAccount } from "@/features/trading/logic/advance";
import { closeMath, costsFor, entryFill, riskAtEntry, type Bar } from "@/features/trading/logic/engine";
import { roundTo } from "@/lib/money";

/** A decision that is never closed by its stop/target is closed at the market after this many bars. */
export const MAX_HOLD_BARS = 200;
/** How far the feed advances when the student chooses WAIT. */
export const WAIT_STEP = 5;

export type BacktestOutcomeKind = "WIN" | "LOSS" | "TIMEOUT";

export interface TakeTradeInput {
  symbol: string;
  direction: Direction;
  balance: number;
  riskPercent: number;
  /** series-space close of the last visible candle */
  lastClose: number;
  stopPoints: number;
  /** target as a multiple of the stop distance; null = no target (only the stop or the time limit closes it) */
  targetR: number | null;
  /** bars AFTER the last visible one, in series space (before the instrument basis) */
  futureBars: readonly Bar[];
}

export interface TakeTradeError {
  ok: false;
  message: string;
}

export interface TakeTradeResult {
  ok: true;
  entry: number;
  stop: number;
  target: number | null;
  contracts: number;
  riskAmount: number;
  riskPercentActual: number;
  outcome: BacktestOutcomeKind;
  /** offset into `futureBars` of the bar that closed the trade */
  exitOffset: number;
  exitReason: "STOP_LOSS" | "TAKE_PROFIT" | "TIMEOUT";
  gap: boolean;
  exitPrice: number;
  pnl: number;
  fees: number;
  rMultiple: number | null;
}

/**
 * Sizes the trade from the risk budget, opens it at the market (spread included) on the last visible candle and
 * replays the future bars through the SAME execution engine as the simulator: gap-aware fills and the stop wins any
 * bar in which both stop and target are reachable.
 */
export function takeTrade(i: TakeTradeInput): TakeTradeResult | TakeTradeError {
  if (!(i.stopPoints > 0)) return { ok: false, message: "Define uma distância de stop maior que zero." };
  if (i.targetR !== null && !(i.targetR > 0)) return { ok: false, message: "O alvo em R tem de ser maior que zero." };
  if (i.futureBars.length === 0) return { ok: false, message: "Já não há mais barras para simular este trade." };

  const costs = costsFor(i.symbol);
  const bid = i.lastClose + costs.basisPoints;
  const entry = entryFill(i.symbol, i.direction, bid);
  const long = i.direction === "LONG";
  const stop = roundTo(long ? entry - i.stopPoints : entry + i.stopPoints, 4);
  const target = i.targetR === null ? null : roundTo(long ? entry + i.stopPoints * i.targetR : entry - i.stopPoints * i.targetR, 4);
  if (stop <= 0 || (target !== null && target <= 0)) return { ok: false, message: "Stop ou alvo ficam fora de preços válidos." };

  const size = positionSize({ balance: i.balance, riskPercent: i.riskPercent, symbol: i.symbol, direction: i.direction, entry, stop, target, commissionRoundTurn: costs.commissionPerSide * 2 });
  if (!size.valid) return { ok: false, message: size.errors[0] ?? "Parâmetros inválidos." };
  if (size.contracts < 1) return { ok: false, message: size.warnings[0] ?? "Nenhum tamanho inteiro respeita o risco definido." };

  const bars = i.futureBars.slice(0, MAX_HOLD_BARS);
  const adv = advanceAccount({
    balance: i.balance,
    peakEquity: i.balance,
    maxDrawdown: 0,
    dayStartEquity: i.balance,
    openTrades: [{ id: "bt", symbol: i.symbol, direction: i.direction, contracts: size.contracts, entryPrice: entry, stopLoss: stop, takeProfit: target }],
    bars,
  });

  const riskAmount = riskAtEntry(i.symbol, size.contracts, entry, stop);
  const base = { ok: true as const, entry, stop, target, contracts: size.contracts, riskAmount, riskPercentActual: roundTo((riskAmount / i.balance) * 100, 2) };
  const hit = adv.closed[0];
  if (hit) {
    return {
      ...base,
      outcome: hit.reason === "TAKE_PROFIT" ? "WIN" : "LOSS",
      exitOffset: hit.barIndex,
      exitReason: hit.reason,
      gap: hit.gap,
      exitPrice: hit.math.exitPrice,
      pnl: hit.math.net,
      fees: hit.math.fees,
      rMultiple: hit.math.rMultiple,
    };
  }

  // Neither stop nor target reached: close at the last simulated bar's close.
  const last = bars[bars.length - 1]!;
  const math = closeMath({ symbol: i.symbol, direction: i.direction, contracts: size.contracts, entry, stop, level: last.close + costs.basisPoints });
  return { ...base, outcome: "TIMEOUT", exitOffset: bars.length - 1, exitReason: "TIMEOUT", gap: false, exitPrice: math.exitPrice, pnl: math.net, fees: math.fees, rMultiple: math.rMultiple };
}
