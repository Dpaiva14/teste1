import { z } from "@/lib/zod";
import { idSchema } from "@/lib/http-schemas";

export const LAB_KINDS = ["market-structure", "levels", "fibonacci", "confluence"] as const;
export type LabKind = (typeof LAB_KINDS)[number];
export const labKindSchema = z.enum(LAB_KINDS);

export const labParamsSchema = z.object({ kind: labKindSchema, id: idSchema.optional() });

const price = z.number().finite().min(0).max(1_000_000);
const index = z.number().int().min(0).max(5000);
const label = z.enum(["HH", "HL", "LH", "LL"]);

export const structureAnswerSchema = z.object({
  marks: z.array(z.object({ index, label })).max(40),
  structure: z.enum(["BULLISH", "BEARISH", "RANGE"]).nullable(),
});

export const levelsAnswerSchema = z.object({
  zones: z.array(z.object({ top: price, bottom: price, kind: z.enum(["support", "resistance"]) })).max(12),
});

export const fibAnswerSchema = z.object({
  a: z.object({ index, price }),
  b: z.object({ index, price }),
  pickedRatio: z.number().min(0).max(3),
});

export const confluenceAnswerSchema = z.object({
  selected: z.array(z.enum(["trend", "structure", "sr", "supplyDemand", "fibonacci", "priceAction", "liquidity", "riskReward"])).max(8),
  decision: z.enum(["TAKE", "NO_TRADE"]),
});

export const answerSchemas = {
  "market-structure": structureAnswerSchema,
  levels: levelsAnswerSchema,
  fibonacci: fibAnswerSchema,
  confluence: confluenceAnswerSchema,
} as const;
