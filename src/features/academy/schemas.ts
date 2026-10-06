import { z } from "zod";
import { idSchema } from "@/lib/http-schemas";

export const quizSubmitSchema = z.object({
  responses: z.record(
    idSchema,
    z.object({
      optionId: idSchema.optional(),
      value: z.number().finite().min(-1e9).max(1e9).optional(),
    }),
  ),
});

export const lessonTimeSchema = z.object({ seconds: z.number().int().min(1).max(600) });
export const idParamSchema = z.object({ id: idSchema });
