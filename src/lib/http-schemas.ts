import { z } from "@/lib/zod";

/** Client-safe shared zod primitives (ids are cuid/uuid — validate shape early, fail fast with 422). */
export const idSchema = z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/);

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD).");
