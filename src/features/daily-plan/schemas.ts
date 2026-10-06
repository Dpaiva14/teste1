import { z } from "zod";
import { isoDateSchema } from "@/lib/http-schemas";

const level = z.number().finite().min(1).max(1_000_000).nullable().optional();
const text = (n: number) => z.string().trim().max(n).optional();

export const dailyPlanSchema = z.object({
  date: isoDateSchema,
  bias: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]),
  keyLevels: z.object({ pdh: level, pdl: level, pwh: level, pwl: level, majorSR: text(120), supply: text(120), demand: text(120) }).default({}),
  events: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
  mustHappen: text(500),
  invalidation: text(500),
  maxRisk: z.number().finite().min(0).max(10_000_000).nullable().optional(),
  maxRiskUnit: z.enum(["USD", "PERCENT"]).default("USD"),
  maxTrades: z.number().int().min(0).max(100).nullable().optional(),
  notes: text(1000),
  review: text(1000),
  followedPlan: z.boolean().nullable().optional(),
});
export type DailyPlanInput = z.infer<typeof dailyPlanSchema>;
