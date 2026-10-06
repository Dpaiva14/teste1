import type { Difficulty, QuestionType } from "@/database/generated/enums";
import type { Candle } from "@/lib/market-data/types";
import type { ChartOverlay } from "@/features/chart/types";

/* ─────────────────────────── Visuals ─────────────────────────── */

export type VisualSpec =
  /** A DEMO chart from the scenario catalogue, optionally with the teaching annotations switched on. */
  | { kind: "scenario"; scenarioId: string; annotations?: "solution" | "none"; caption?: string; height?: number }
  /** Hand-crafted candles (OHLC tuples) for pattern illustrations. Always an illustration, never "data". */
  | { kind: "candles"; candles: readonly (readonly [open: number, high: number, low: number, close: number])[]; overlays?: readonly ChartOverlay[]; caption?: string; height?: number }
  /** Built-in explanatory diagram component (see features/academy/components/diagrams). */
  | { kind: "diagram"; id: DiagramId; caption?: string };

export type DiagramId =
  | "candle-anatomy"
  | "timeframes-cascade"
  | "confluence-stack"
  | "session-timeline"
  | "futures-vs-cfd"
  | "risk-ladder"
  | "process-loop";

/* ─────────────────────────── Practice ─────────────────────────── */

export type ExerciseSpec =
  | { kind: "structure"; scenarioId: string; prompt?: string }
  | { kind: "levels"; scenarioId: string; prompt?: string }
  | { kind: "fibonacci"; scenarioId: string; prompt?: string }
  | { kind: "confluence"; scenarioId: string; prompt?: string }
  | { kind: "calculator"; tool: "tick-value" | "leverage" | "costs" | "risk" | "position-size" | "rr"; prompt?: string }
  | { kind: "reflection"; prompt: string; placeholder?: string }
  | { kind: "link"; href: string; label: string; prompt: string };

/* ─────────────────────────── Quiz ─────────────────────────── */

export type QuestionDef =
  | {
      type: Extract<QuestionType, "MULTIPLE_CHOICE" | "TRUE_FALSE" | "CHART_ANALYSIS" | "IDENTIFY_STRUCTURE" | "IDENTIFY_TREND" | "IDENTIFY_SUPPORT_RESISTANCE" | "VALID_SETUP">;
      prompt: string;
      options: readonly { text: string; correct: boolean; why?: string }[];
      explanation: string;
      /** Scenario id (see modules/scenarios.ts) shown above the question for chart-based types. */
      chartRef?: string;
    }
  | {
      type: Extract<QuestionType, "NUMERIC" | "POSITION_SIZE" | "CALCULATE_RR">;
      prompt: string;
      answer: number;
      tolerance: number;
      unit?: string;
      explanation: string;
    };

export interface QuizDef {
  title: string;
  passScore?: number;
  questions: readonly QuestionDef[];
}

/* ─────────────────────────── Curriculum ─────────────────────────── */

export interface LessonDef {
  slug: string;
  title: string;
  summary: string;
  difficulty?: Difficulty;
  minutes?: number;
  /** Markdown. Main explanation. */
  content: string;
  /** Markdown. Realistic worked example (numbers!). */
  example?: string;
  visual?: VisualSpec;
  exercise?: ExerciseSpec;
  /** 3–5 bullet points. */
  takeaways: readonly string[];
  /** Lesson quiz (3 for micro-lessons, 5 for standard lessons). */
  quiz: readonly QuestionDef[];
  videoUrl?: string;
}

export interface ModuleDef {
  slug: string;
  number: number;
  level: number;
  title: string;
  summary: string;
  difficulty: Difficulty;
  icon: string;
  lessons: readonly LessonDef[];
  /** Module-level quiz (8–10 questions, mixed types). */
  quiz: QuizDef;
}

export type { Candle };
