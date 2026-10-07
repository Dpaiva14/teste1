import type { Candle } from "@/lib/market-data/types";
import type { FibLeg, FactLevel, LiquidityPool, ZoneCandidate } from "./logic/analysis";
import type { AssessmentEvaluation } from "./logic/evaluate";
import type { OutcomeReveal } from "./logic/outcome";
import type { Answers } from "./schemas";

export type AssessmentStatus = "IN_PROGRESS" | "COMPLETED";

export interface AssessmentListItemDTO {
  id: string;
  status: AssessmentStatus;
  processScore: number | null;
  grade: string | null;
  createdAt: string;
  submittedAt: string | null;
}

export interface AssessmentOverviewDTO {
  unlocked: boolean;
  /** progress of the level that gates the assessment (level 9), shown while it is locked */
  gate: { level: number; completedLessons: number; totalLessons: number; neededLessons: number };
  attempts: AssessmentListItemDTO[];
  inProgressId: string | null;
  bestScore: number | null;
  passed: boolean;
}

/** Reference reading computed from the visible chart: shown AFTER submission, to compare with the student's work. */
export interface ReferenceDTO {
  levels: FactLevel[];
  pools: LiquidityPool[];
  zones: ZoneCandidate[];
  legs: FibLeg[];
}

export interface StoredReview {
  version: 1;
  decisionIndex: number;
  evaluation: AssessmentEvaluation;
  outcome: OutcomeReveal;
  reference: ReferenceDTO;
}

export interface AssessmentReportDTO {
  processScore: number;
  passed: boolean;
  evaluation: AssessmentEvaluation;
  outcome: OutcomeReveal;
  reference: ReferenceDTO;
  /** candles after the decision point (revealed only once submitted) */
  revealCandles: Candle[];
  submittedAt: string;
  xpAwarded: number;
  newAchievements: string[];
}

export interface AssessmentStateDTO {
  id: string;
  status: AssessmentStatus;
  symbol: string;
  timeframe: string;
  account: { balance: number; riskPercent: number; riskBudget: number };
  /** quote-space candles up to the decision point only (nothing after it until submission) */
  candles: Candle[];
  windowStart: number;
  /** absolute index of the first revealed (future) candle = number of visible candles */
  decisionIndex: number;
  atr: number;
  lastClose: number;
  answers: Answers;
  report: AssessmentReportDTO | null;
}
