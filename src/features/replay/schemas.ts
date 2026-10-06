import { z } from "@/lib/zod";

export const REPLAY_SYMBOLS = ["YM", "MYM", "US30"] as const;
export const REPLAY_TIMEFRAMES = ["M5", "M15", "H1"] as const;
export const MAX_DRAWINGS = 40;

export const createReplaySchema = z.object({
  symbol: z.enum(REPLAY_SYMBOLS).default("MYM"),
  timeframe: z.enum(REPLAY_TIMEFRAMES).default("M5"),
});
export type CreateReplayInput = z.infer<typeof createReplaySchema>;

const id = z.string().regex(/^[a-z0-9-]{1,24}$/);
const price = z.number().finite().min(1).max(1_000_000);
const point = z.object({ index: z.number().int().min(0).max(100_000), price });

/** Chart annotations made by the student. Indices are ABSOLUTE bar indices, prices are quote-space. */
export const drawingSchema = z.discriminatedUnion("kind", [
  z.object({ id, kind: z.literal("level"), price }),
  z.object({ id, kind: z.literal("zone"), top: price, bottom: price, fromIndex: z.number().int().min(0).max(100_000) }),
  z.object({ id, kind: z.literal("trend"), from: point, to: point }),
  z.object({ id, kind: z.literal("fib"), from: point, to: point }),
]);
export type Drawing = z.infer<typeof drawingSchema>;

export const drawingsSchema = z.array(drawingSchema).max(MAX_DRAWINGS);
