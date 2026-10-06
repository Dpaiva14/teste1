import { z } from "zod";
import { idSchema } from "@/lib/http-schemas";

export const askTutorSchema = z.object({
  conversationId: idSchema.optional(),
  lessonId: idSchema.optional(),
  message: z.string().trim().min(2, "Escreve uma pergunta.").max(2000, "Máximo de 2000 caracteres."),
});
export type AskTutorInput = z.infer<typeof askTutorSchema>;

export const analyzeSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("scenario"), scenarioId: z.string().regex(/^[a-z0-9-]{1,60}$/), narrate: z.boolean().default(true) }),
  z.object({
    mode: z.literal("image"),
    assetId: idSchema,
    symbol: z.enum(["YM", "MYM", "US30"]).optional(),
    timeframe: z.enum(["M1", "M5", "M15", "H1", "H4", "D1"]).optional(),
    note: z.string().trim().max(500).optional(),
  }),
]);
export type AnalyzeInput = z.infer<typeof analyzeSchema>;
