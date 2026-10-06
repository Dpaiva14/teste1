import { z } from "@/lib/zod";
import { TIMEFRAMES } from "@/lib/market-data/types";

export const candlesQuerySchema = z
  .object({
    symbol: z.enum(["YM", "MYM", "US30"]),
    timeframe: z.enum(TIMEFRAMES),
    from: z.coerce.date(),
    to: z.coerce.date(),
    seed: z.coerce.number().int().min(0).max(2 ** 31).optional(),
  })
  .refine((q) => q.to > q.from, { message: "'to' tem de ser posterior a 'from'.", path: ["to"] })
  .refine((q) => q.to.getTime() - q.from.getTime() <= 400 * 86_400_000, { message: "Intervalo máximo: 400 dias.", path: ["to"] });
