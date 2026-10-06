import type { Candle } from "@/lib/market-data/types";
import type { BacktestSummary } from "./logic/summary";

export interface BacktestListItemDTO {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  strategyName: string;
  status: "IN_PROGRESS" | "COMPLETED";
  decisions: number;
  balance: number;
  initialBalance: number;
  updatedAt: string;
}

export interface DecisionDTO {
  seq: number;
  barIndex: number;
  choice: "BUY" | "SELL" | "WAIT";
  outcome: "WIN" | "LOSS" | "TIMEOUT" | "NO_TRADE";
  entry: number | null;
  stop: number | null;
  target: number | null;
  exitIndex: number | null;
  exitPrice: number | null;
  rMultiple: number | null;
  pnl: number | null;
  riskAmount: number | null;
  reason: string | null;
  note: string | null;
  rulesMet: number | null;
  rulesTotal: number | null;
}

export interface BacktestStateDTO {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  strategyKey: string;
  riskPercent: number;
  initialBalance: number;
  balance: number;
  status: "IN_PROGRESS" | "COMPLETED";
  cursor: number;
  totalBars: number;
  /** quote-space candles (instrument basis already applied) ending at the cursor — nothing after it is ever sent */
  candles: Candle[];
  windowStart: number;
  /** quote-space bid (close of the last visible candle) */
  bid: number;
  decisions: DecisionDTO[];
  summary: BacktestSummary;
}

export interface DecisionResultDTO {
  state: BacktestStateDTO;
  unlockedAchievements: { key: string; title: string }[];
  xp: number;
}
