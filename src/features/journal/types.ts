import type { GroupStats, PerformanceStats } from "@/features/stats/logic/performance";
import type { BehaviorSummary } from "@/features/trading/logic/behavior";

export interface JournalEntryDTO {
  id: string;
  tradeId: string | null;
  tradeDate: string;
  instrument: string;
  direction: "LONG" | "SHORT";
  timeframe: string;
  setup: string;
  session: string | null;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number | null;
  exitPrice: number | null;
  contracts: number;
  riskAmount: number;
  result: number;
  rMultiple: number;
  emotionalState: string;
  mistakes: string[];
  mistakeNote: string | null;
  lesson: string | null;
  notes: string | null;
  followedPlan: boolean | null;
  processRating: number | null;
  screenshotBeforeId: string | null;
  screenshotAfterId: string | null;
}

export interface JournalStatsDTO {
  stats: PerformanceStats;
  bySetup: GroupStats[];
  bySession: GroupStats[];
  byEmotion: GroupStats[];
  bestSetup: GroupStats | null;
  worstSetup: GroupStats | null;
  bestSession: GroupStats | null;
  worstSession: GroupStats | null;
  mistakes: { key: string; count: number }[];
  avgProcessRating: number | null;
  followedPlanPercent: number | null;
  /** results split by process quality vs. outcome: the "good process / bad outcome" grid */
  processVsOutcome: { goodProcessWin: number; goodProcessLoss: number; poorProcessWin: number; poorProcessLoss: number };
  behavior: BehaviorSummary;
}
