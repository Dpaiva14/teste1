import { z } from "zod";
import { idSchema } from "@/lib/http-schemas";

export const SYMBOLS = ["YM", "MYM", "US30"] as const;
export const ENTRY_REASON_KEYS = ["SETUP_VALID", "FOMO", "REVENGE", "BOREDOM", "FEAR_OF_MISSING_MOVE", "OTHER"] as const;
export const CHECKLIST_KEYS = ["htfAnalysed", "structureIdentified", "keyLevel", "trendIdentified", "entryZone", "confluence", "confirmation", "stopDefined", "riskCalculated", "rrAcceptable", "newsChecked", "noEmotion"] as const;

const price = z.number().finite().min(1).max(1_000_000);

export const openTradeSchema = z.object({
  symbol: z.enum(SYMBOLS),
  direction: z.enum(["LONG", "SHORT"]),
  contracts: z.number().int().min(1).max(200),
  stop: price.nullable(),
  target: price.nullable(),
  entryReason: z.enum(ENTRY_REASON_KEYS),
  entryReasonNote: z.string().trim().max(300).optional(),
  checklist: z.partialRecord(z.enum(CHECKLIST_KEYS), z.boolean()).default({}),
  thesis: z.string().trim().max(600).optional(),
  confluenceScore: z.number().int().min(0).max(8).nullable().optional(),
});
export type OpenTradeInput = z.infer<typeof openTradeSchema>;

export const idParams = z.object({ id: idSchema });
export const tradeParams = z.object({ id: idSchema, tradeId: idSchema });
