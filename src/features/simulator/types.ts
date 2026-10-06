import type { AccountSnapshot } from "@/features/trading/logic/engine";
import type { PerformanceStats } from "@/features/stats/logic/performance";
import type { Candle } from "@/lib/market-data/types";

export interface TradeDTO {
  id: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  contracts: number;
  entryPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  exitPrice: number | null;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  exitReason: "TAKE_PROFIT" | "STOP_LOSS" | "MANUAL" | "END_OF_DATA" | null;
  openedAt: string;
  closedAt: string | null;
  pnl: number | null;
  fees: number;
  rMultiple: number | null;
  riskAmount: number | null;
  entryReason: string | null;
  checklistPercent: number | null;
  rewardRisk: number | null;
  thesis: string | null;
  journaled: boolean;
  openBarIndex: number | null;
}

export interface AccountSummaryDTO {
  id: string;
  name: string;
  initialBalance: number;
  balance: number;
  createdAt: string;
  openTrades: number;
}

export interface AccountStateDTO {
  id: string;
  name: string;
  timeframe: string;
  initialBalance: number;
  cursor: number;
  totalBars: number;
  finished: boolean;
  snapshot: AccountSnapshot;
  /** candle window ending at the cursor; `windowStart` is the absolute index of candles[0] */
  candles: Candle[];
  windowStart: number;
  /** bid-space price per symbol for the last visible candle */
  bids: Record<string, number>;
  basis: Record<string, number>;
  openTrades: TradeDTO[];
  closedTrades: TradeDTO[];
  stats: PerformanceStats;
  warnings: string[];
}
