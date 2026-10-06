import { z } from "@/lib/zod";

function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2, "Indica o teu nome.").max(80).optional(),
    timezone: z.string().max(64).refine(isValidTimeZone, "Fuso horário inválido.").optional(),
  })
  .refine((v) => v.name !== undefined || v.timezone !== undefined, { message: "Nada para atualizar." });
