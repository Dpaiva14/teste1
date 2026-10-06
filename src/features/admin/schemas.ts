import { z } from "@/lib/zod";
import { idSchema } from "@/lib/http-schemas";
import { getScenario } from "@/modules/scenarios";
import { normalizeVideoUrl, VideoUrlError } from "./logic/video";

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);
const difficulty = z.enum(["BEGINNER", "FOUNDATION", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"]);

/* ───────────── Content ───────────── */

export const moduleUpdateSchema = z.object({
  title: trimmed(3, 120),
  summary: trimmed(10, 600),
  difficulty,
  level: z.number().int().min(1).max(10),
  estimatedMinutes: z.number().int().min(0).max(2000),
  published: z.boolean(),
});

const videoField = z
  .string()
  .max(300)
  .nullable()
  .optional()
  .transform((v, ctx) => {
    try {
      return normalizeVideoUrl(v);
    } catch (e) {
      ctx.addIssue({ code: "custom", message: e instanceof VideoUrlError ? e.message : "URL de vídeo inválido." });
      return z.NEVER;
    }
  });

export const lessonUpdateSchema = z.object({
  title: trimmed(3, 160),
  summary: trimmed(10, 400),
  difficulty,
  content: trimmed(20, 30_000),
  example: z.string().trim().max(10_000).nullable().optional().transform((v) => (v ? v : null)),
  takeaways: z.array(trimmed(3, 300)).min(1).max(8),
  videoUrl: videoField,
  estimatedMinutes: z.number().int().min(1).max(240),
  xpReward: z.number().int().min(0).max(200),
  published: z.boolean(),
});
export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>;

export const lessonCreateSchema = z.object({
  title: trimmed(3, 160),
  summary: trimmed(10, 400),
  content: trimmed(20, 30_000),
});

export const moveSchema = z.object({ direction: z.enum(["up", "down"]) });

/* ───────────── Quiz ───────────── */

export const OPTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "CHART_ANALYSIS", "IDENTIFY_STRUCTURE", "IDENTIFY_TREND", "IDENTIFY_SUPPORT_RESISTANCE", "VALID_SETUP"] as const;
export const NUMERIC_TYPES = ["NUMERIC", "POSITION_SIZE", "CALCULATE_RR"] as const;
export const CHART_TYPES = ["CHART_ANALYSIS", "IDENTIFY_STRUCTURE", "IDENTIFY_TREND", "IDENTIFY_SUPPORT_RESISTANCE", "VALID_SETUP"] as const;

export const questionSchema = z
  .object({
    type: z.enum([...OPTION_TYPES, ...NUMERIC_TYPES]),
    prompt: trimmed(5, 1000),
    explanation: trimmed(5, 2000),
    points: z.number().int().min(1).max(10).default(1),
    chartRef: z.string().regex(/^[a-z0-9-]{1,60}$/).nullable().optional(),
    answer: z.number().finite().nullable().optional(),
    tolerance: z.number().finite().min(0).nullable().optional(),
    unit: z.string().trim().max(20).nullable().optional(),
    options: z.array(z.object({ text: trimmed(1, 300), correct: z.boolean(), why: z.string().trim().max(500).nullable().optional() })).max(6).default([]),
  })
  .superRefine((q, ctx) => {
    const add = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    const isNumeric = (NUMERIC_TYPES as readonly string[]).includes(q.type);
    if (isNumeric) {
      if (q.answer === null || q.answer === undefined) add("answer", "Indica a resposta numérica correta.");
      if (q.tolerance === null || q.tolerance === undefined) add("tolerance", "Indica a tolerância (pode ser 0).");
      if (q.options.length > 0) add("options", "Perguntas numéricas não têm opções.");
      return;
    }
    if (q.options.length < 2) add("options", "São necessárias pelo menos 2 opções.");
    if (q.type === "TRUE_FALSE" && q.options.length !== 2) add("options", "Verdadeiro/Falso tem exatamente 2 opções.");
    if (q.options.filter((o) => o.correct).length !== 1) add("options", "Marca exatamente 1 opção correta.");
    if ((CHART_TYPES as readonly string[]).includes(q.type)) {
      if (!q.chartRef) add("chartRef", "Escolhe o gráfico (cenário) desta pergunta.");
      else if (!getScenario(q.chartRef)) add("chartRef", "Cenário inexistente.");
    }
  });
export type QuestionInput = z.infer<typeof questionSchema>;

export const quizSchema = z.object({
  title: trimmed(3, 160),
  passScore: z.number().int().min(10).max(100),
  published: z.boolean(),
  questions: z.array(questionSchema).min(1, "Um quiz precisa de pelo menos 1 pergunta.").max(30),
});
export type QuizInput = z.infer<typeof quizSchema>;

/* ───────────── Users ───────────── */

export const userListQuery = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});

export const userUpdateSchema = z
  .object({ role: z.enum(["STUDENT", "ADMIN"]).optional(), disabled: z.boolean().optional() })
  .refine((v) => v.role !== undefined || v.disabled !== undefined, { message: "Nada para atualizar." });

/* ───────────── Economic events ───────────── */

export const EVENT_CATEGORIES = ["CPI", "PPI", "NFP", "FOMC", "GDP", "RETAIL_SALES", "PMI", "JOBLESS_CLAIMS", "FED_SPEECH", "OTHER"] as const;
const optionalText = (max: number) => z.string().trim().max(max).nullable().optional().transform((v) => (v ? v : null));

export const eventSchema = z
  .object({
    title: trimmed(3, 160),
    country: trimmed(2, 3).default("US"),
    category: z.enum(EVENT_CATEGORIES),
    impact: z.enum(["LOW", "MEDIUM", "HIGH", "EXTREME"]),
    scheduledAt: z.iso.datetime({ offset: true }),
    forecast: optionalText(60),
    previous: optionalText(60),
    actual: optionalText(60),
    description: optionalText(600),
    source: optionalText(300),
    sourceUrl: z
      .string()
      .trim()
      .max(500)
      .nullable()
      .optional()
      .transform((v) => (v ? v : null))
      .refine((v) => v === null || /^https:\/\//i.test(v), { message: "O link da fonte tem de usar https." }),
    isDemo: z.boolean().default(false),
  })
  // Honesty rule (same as the Learning Sources page): a real event needs a named source; only DEMO placeholders may omit it.
  .refine((e) => e.isDemo || (e.source !== null && e.source.length >= 3), { path: ["source"], message: "Eventos reais precisam de uma fonte (ex.: BLS, Federal Reserve). Marca como DEMO se for ilustrativo." });
export type EventInput = z.infer<typeof eventSchema>;

/* ───────────── Glossary ───────────── */

export const glossarySchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Usa minúsculas, números e hífens.").max(80),
  term: trimmed(2, 120),
  category: trimmed(2, 60),
  definition: trimmed(10, 800),
  simpleExplanation: trimmed(10, 800),
  technicalExplanation: trimmed(10, 1200),
  example: trimmed(10, 1000),
  related: z.array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(80)).max(12).default([]),
});
export type GlossaryInput = z.infer<typeof glossarySchema>;

export const adminIdParams = z.object({ id: idSchema });
