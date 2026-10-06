import type { ChartOverlay } from "@/features/chart/types";
import type { ScriptPoint } from "@/lib/market-data/demo-generator";
import type { Timeframe } from "@/lib/market-data/types";

export type ConfluenceFactorKey =
  | "trend"
  | "structure"
  | "sr"
  | "supplyDemand"
  | "fibonacci"
  | "priceAction"
  | "liquidity"
  | "riskReward";

export interface FibSolution {
  /** impulse start (A) and end (B) as waypoint indices into `points` */
  a: { at: number; price: number };
  b: { at: number; price: number };
  /** where the pullback ends (C), for extension/projection exercises */
  c?: { at: number; price: number };
  direction: "up" | "down";
  /** ratios (e.g. 0.618) of the zone where the pullback actually stopped */
  pullbackRatio: number;
  note: string;
}

export interface LevelZoneSolution {
  kind: "support" | "resistance";
  top: number;
  bottom: number;
  touches: number;
  note: string;
}

export interface ConfluenceSolution {
  /** index of the last visible candle at decision time; later candles are the "what happened" reveal */
  decisionIndex: number;
  direction: "LONG" | "SHORT";
  entry: number;
  stop: number;
  target: number;
  factors: Record<ConfluenceFactorKey, { present: boolean; note: string }>;
  verdict: string;
}

export interface ScenarioDef {
  id: string;
  title: string;
  description: string;
  symbol: "YM" | "MYM" | "US30";
  timeframe: Timeframe;
  /** ISO date-time of the first bar (synthetic calendar position — DEMO). */
  startISO: string;
  seed: number;
  points: readonly ScriptPoint[];
  tail?: number;
  noise?: number;
  overrides?: readonly { at: number; ohlc: readonly [number, number, number, number] }[];
  /** Teaching annotations drawn when a lesson shows the scenario "with solution". */
  annotations?: readonly ChartOverlay[];
  /** Market structure exercise: the expected overall classification and a short rationale. */
  structure?: { answer: "BULLISH" | "BEARISH" | "RANGE"; note: string };
  levels?: { zones: readonly LevelZoneSolution[] };
  fib?: FibSolution;
  confluence?: ConfluenceSolution;
}
