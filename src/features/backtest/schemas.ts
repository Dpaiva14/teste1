import { z } from "zod";
import { STRATEGY_KEYS } from "@/modules/strategies";
import { ENTRY_REASON_KEYS } from "@/features/trading/schemas";

export const BACKTEST_SYMBOLS = ["YM", "MYM", "US30"] as const;
export const BACKTEST_TIMEFRAMES = ["M5", "M15", "H1"] as const;

export const createBacktestSchema = z.object({
  name: z.string().trim().min(1).max(60).default("Backtest"),
  symbol: z.enum(BACKTEST_SYMBOLS).default("MYM"),
  timeframe: z.enum(BACKTEST_TIMEFRAMES).default("M15"),
  strategyKey: z.enum(STRATEGY_KEYS),
  riskPercent: z.number().finite().min(0.1).max(5).default(1),
  initialBalance: z.number().finite().min(1000).max(1_000_000).default(10_000),
  bars: z.number().int().min(300).max(1500).default(800),
});
export type CreateBacktestInput = z.infer<typeof createBacktestSchema>;

const rules = { rulesMet: z.number().int().min(0).max(20).optional(), rulesTotal: z.number().int().min(1).max(20).optional() };
const note = z.string().trim().max(300).optional();

export const decisionSchema = z
  .discriminatedUnion("choice", [
    z.object({ choice: z.literal("WAIT"), note, ...rules }),
    z.object({
      choice: z.enum(["BUY", "SELL"]),
      stopPoints: z.number().finite().min(1).max(5000),
      targetR: z.number().finite().min(0.5).max(10).nullable(),
      reason: z.enum(ENTRY_REASON_KEYS),
      note,
      ...rules,
    }),
  ])
  .refine((d) => (d.rulesMet === undefined) === (d.rulesTotal === undefined) && (d.rulesMet === undefined || d.rulesMet <= d.rulesTotal!), {
    message: "rulesMet e rulesTotal têm de vir juntos e rulesMet ≤ rulesTotal.",
  });
export type DecisionInput = z.infer<typeof decisionSchema>;
