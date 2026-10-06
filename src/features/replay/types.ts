import type { PerformanceStats } from "@/features/stats/logic/performance";
import type { TradeDTO } from "@/features/simulator/types";
import type { AccountSnapshot } from "@/features/trading/logic/engine";
import type { TradeEvaluation } from "@/features/trading/logic/evaluation";
import type { Candle } from "@/lib/market-data/types";
import type { ReplayReview } from "./logic/review";
import type { Drawing } from "./schemas";

export interface ReplayListItemDTO {
  id: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  status: "IN_PROGRESS" | "COMPLETED";
  trades: number;
  createdAt: string;
}

export interface ReplayStateDTO {
  id: string;
  symbol: string;
  timeframe: string;
  /** first candle of the synthetic series — a DEMO date, not a real market date */
  startDate: string;
  status: "IN_PROGRESS" | "COMPLETED";
  initialBalance: number;
  snapshot: AccountSnapshot;
  cursor: number;
  totalBars: number;
  finished: boolean;
  /** quote-space candles ending at the cursor; nothing after it is ever sent */
  candles: Candle[];
  windowStart: number;
  bids: Record<string, number>;
  basis: Record<string, number>;
  openTrades: TradeDTO[];
  closedTrades: TradeDTO[];
  evaluations: Record<string, TradeEvaluation>;
  drawings: Drawing[];
  review: ReplayReview;
  stats: PerformanceStats;
  warnings: string[];
}
