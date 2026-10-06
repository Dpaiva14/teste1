import { z } from "zod";
import { TIMEFRAMES } from "@/lib/market-data/types";
import { idSchema } from "@/lib/http-schemas";

export const EMOTIONS = ["CALM", "CONFIDENT", "ANXIOUS", "FOMO", "FRUSTRATED", "BORED", "EUPHORIC", "TIRED"] as const;
export const MISTAKES = ["MOVED_STOP", "OVERSIZED", "EARLY_EXIT", "NO_PLAN", "CHASED", "REVENGE", "NO_STOP", "OVERTRADED", "OTHER"] as const;

export const EMOTION_LABEL: Record<(typeof EMOTIONS)[number], string> = {
  CALM: "Calmo", CONFIDENT: "Confiante", ANXIOUS: "Ansioso", FOMO: "FOMO", FRUSTRATED: "Frustrado", BORED: "Entediado", EUPHORIC: "Eufórico", TIRED: "Cansado",
};
export const MISTAKE_LABEL: Record<(typeof MISTAKES)[number], string> = {
  MOVED_STOP: "Mexi no stop", OVERSIZED: "Tamanho excessivo", EARLY_EXIT: "Saí cedo demais", NO_PLAN: "Sem plano", CHASED: "Persegui o preço", REVENGE: "Revenge trading", NO_STOP: "Sem stop", OVERTRADED: "Overtrading", OTHER: "Outro",
};

export const SETUP_SUGGESTIONS = ["Trend Pullback", "Breakout + Retest", "Liquidity Sweep", "S/R Reversal", "Fibonacci Confluence", "Outro"] as const;

const num = z.number().finite();
const price = num.min(1).max(1_000_000);

export const journalInputSchema = z.object({
  tradeId: idSchema.nullable().optional(),
  tradeDate: z.coerce.date(),
  instrument: z.enum(["YM", "MYM", "US30"]),
  direction: z.enum(["LONG", "SHORT"]),
  timeframe: z.enum(TIMEFRAMES),
  setup: z.string().trim().min(1, "Indica o setup.").max(60),
  entryPrice: price,
  stopLoss: price,
  takeProfit: price.nullable().optional(),
  exitPrice: price.nullable().optional(),
  contracts: z.number().int().min(1).max(500),
  /** Optional overrides when the broker's numbers differ from the computed ones. */
  riskAmount: num.min(0).max(10_000_000).nullable().optional(),
  result: num.min(-10_000_000).max(10_000_000).nullable().optional(),
  emotionalState: z.enum(EMOTIONS),
  mistakes: z.array(z.enum(MISTAKES)).max(9).default([]),
  mistakeNote: z.string().trim().max(500).optional(),
  lesson: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(2000).optional(),
  followedPlan: z.boolean().nullable().optional(),
  processRating: z.number().int().min(1).max(5).nullable().optional(),
  screenshotBeforeId: idSchema.nullable().optional(),
  screenshotAfterId: idSchema.nullable().optional(),
});
export type JournalInput = z.infer<typeof journalInputSchema>;

export const journalListSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  cursor: idSchema.optional(),
  setup: z.string().max(60).optional(),
});
