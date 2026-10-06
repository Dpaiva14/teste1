import "server-only";
import { prisma, type Prisma } from "@/database/client";
import { deleteAsset } from "@/features/media/server/storage";
import type { SessionUser } from "@/lib/auth/session";
import { badRequest, conflict, notFound } from "@/lib/errors";
import type { z } from "@/lib/zod";
import type { LessonUpdateInput, QuestionInput, QuizInput, lessonCreateSchema, moduleUpdateSchema } from "../schemas";
import type { AdminLessonDetail, AdminModuleDetail, AdminModuleRow } from "../types";

const NUMERIC = new Set(["NUMERIC", "POSITION_SIZE", "CALCULATE_RR"]);

export function slugify(title: string): string {
  return (
    title
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "aula"
  );
}

type QuizRow = Prisma.QuizGetPayload<{ include: { questions: { include: { answers: true } } } }>;

function toQuizInput(quiz: QuizRow | null): QuizInput | null {
  if (!quiz) return null;
  return {
    title: quiz.title,
    passScore: quiz.passScore,
    published: quiz.published,
    questions: [...quiz.questions]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((q): QuestionInput => ({
        type: q.type,
        prompt: q.prompt,
        explanation: q.explanation,
        points: q.points,
        chartRef: q.chartRef,
        answer: q.numericAnswer,
        tolerance: q.numericTolerance,
        unit: q.numericUnit,
        options: [...q.answers].sort((a, b) => a.orderIndex - b.orderIndex).map((a) => ({ text: a.text, correct: a.isCorrect, why: a.explanation })),
      })),
  };
}

const quizInclude = { questions: { include: { answers: true } } } satisfies Prisma.QuizInclude;

export async function listModules(): Promise<AdminModuleRow[]> {
  const rows = await prisma.module.findMany({
    orderBy: { number: "asc" },
    include: { _count: { select: { lessons: true } }, lessons: { select: { quiz: { select: { _count: { select: { questions: true } } } } } }, quiz: { select: { _count: { select: { questions: true } } } } },
  });
  return rows.map((m) => ({
    id: m.id,
    number: m.number,
    level: m.level,
    title: m.title,
    difficulty: m.difficulty,
    published: m.published,
    managedBySeed: m.managedBySeed,
    lessons: m._count.lessons,
    questions: m.lessons.reduce((s, l) => s + (l.quiz?._count.questions ?? 0), 0) + (m.quiz?._count.questions ?? 0),
  }));
}

export async function getModule(id: string): Promise<AdminModuleDetail> {
  const m = await prisma.module.findUnique({
    where: { id },
    include: { lessons: { orderBy: { number: "asc" }, include: { quiz: { select: { _count: { select: { questions: true } } } } } }, quiz: { include: quizInclude } },
  });
  if (!m) throw notFound("Módulo não encontrado.");
  return {
    id: m.id,
    number: m.number,
    slug: m.slug,
    level: m.level,
    title: m.title,
    summary: m.summary,
    difficulty: m.difficulty,
    estimatedMinutes: m.estimatedMinutes,
    published: m.published,
    managedBySeed: m.managedBySeed,
    lessons: m.lessons.map((l) => ({ id: l.id, number: l.number, slug: l.slug, title: l.title, published: l.published, managedBySeed: l.managedBySeed, questions: l.quiz?._count.questions ?? 0 })),
    quiz: toQuizInput(m.quiz),
  };
}

/** Editing in the admin takes the row out of the seed's hands (managedBySeed=false) so a re-seed never overwrites it. */
export async function updateModule(id: string, input: z.infer<typeof moduleUpdateSchema>) {
  const found = await prisma.module.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw notFound("Módulo não encontrado.");
  await prisma.module.update({ where: { id }, data: { ...input, managedBySeed: false } });
}

export async function getLesson(id: string): Promise<AdminLessonDetail> {
  const l = await prisma.lesson.findUnique({
    where: { id },
    include: { module: { select: { id: true, title: true, slug: true } }, assets: { orderBy: { createdAt: "asc" } }, quiz: { include: quizInclude } },
  });
  if (!l) throw notFound("Aula não encontrada.");
  return {
    id: l.id,
    moduleId: l.module.id,
    moduleTitle: l.module.title,
    moduleSlug: l.module.slug,
    number: l.number,
    slug: l.slug,
    title: l.title,
    summary: l.summary,
    difficulty: l.difficulty,
    content: l.content,
    example: l.example,
    takeaways: l.takeaways,
    videoUrl: l.videoUrl,
    estimatedMinutes: l.estimatedMinutes,
    xpReward: l.xpReward,
    published: l.published,
    managedBySeed: l.managedBySeed,
    hasVisual: l.visual !== null,
    hasExercise: l.exercise !== null,
    assets: l.assets.map((a) => ({ id: a.id, filename: a.filename, kind: a.kind, sizeBytes: a.sizeBytes })),
    quiz: toQuizInput(l.quiz),
  };
}

export async function updateLesson(id: string, input: LessonUpdateInput) {
  const found = await prisma.lesson.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw notFound("Aula não encontrada.");
  await prisma.lesson.update({ where: { id }, data: { ...input, managedBySeed: false } });
}

export async function createLesson(moduleId: string, input: z.infer<typeof lessonCreateSchema>): Promise<{ id: string }> {
  const mod = await prisma.module.findUnique({ where: { id: moduleId }, select: { id: true } });
  if (!mod) throw notFound("Módulo não encontrado.");
  const base = slugify(input.title);
  const taken = new Set((await prisma.lesson.findMany({ where: { moduleId, slug: { startsWith: base } }, select: { slug: true } })).map((l) => l.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  const last = await prisma.lesson.aggregate({ where: { moduleId }, _max: { number: true } });
  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      slug,
      number: (last._max.number ?? 0) + 1,
      title: input.title,
      summary: input.summary,
      content: input.content,
      takeaways: [],
      published: false, // new lessons start as drafts
      managedBySeed: false,
    },
    select: { id: true },
  });
  return lesson;
}

export async function deleteLesson(admin: SessionUser, id: string) {
  const l = await prisma.lesson.findUnique({ where: { id }, include: { assets: { select: { id: true } } } });
  if (!l) throw notFound("Aula não encontrada.");
  const completed = await prisma.progress.count({ where: { lessonId: id, status: "COMPLETED" } });
  if (completed > 0 && l.published) throw conflict(`${completed} aluno(s) já concluíram esta aula. Despublica-a em vez de a apagar.`);
  await prisma.lesson.delete({ where: { id } });
  // The FK only detaches the attachments (SetNull); remove the rows and the files on disk too.
  for (const a of l.assets) await deleteAsset(admin, a.id).catch(() => {});
}

/** Moves a lesson one position up/down by swapping numbers with its neighbour (3 updates dodge the unique constraint). */
export async function moveLesson(id: string, direction: "up" | "down") {
  await prisma.$transaction(async (tx) => {
    const cur = await tx.lesson.findUnique({ where: { id }, select: { id: true, moduleId: true, number: true } });
    if (!cur) throw notFound("Aula não encontrada.");
    const other = await tx.lesson.findFirst({
      where: { moduleId: cur.moduleId, number: direction === "up" ? { lt: cur.number } : { gt: cur.number } },
      orderBy: { number: direction === "up" ? "desc" : "asc" },
      select: { id: true, number: true },
    });
    if (!other) return;
    await tx.lesson.update({ where: { id: cur.id }, data: { number: 1_000_000 } });
    await tx.lesson.update({ where: { id: other.id }, data: { number: cur.number } });
    await tx.lesson.update({ where: { id: cur.id }, data: { number: other.number } });
  });
}

type QuizTarget = { lessonId: string } | { moduleId: string };

async function assertTarget(target: QuizTarget) {
  if ("lessonId" in target) {
    if (!(await prisma.lesson.findUnique({ where: { id: target.lessonId }, select: { id: true } }))) throw notFound("Aula não encontrada.");
  } else if (!(await prisma.module.findUnique({ where: { id: target.moduleId }, select: { id: true } }))) throw notFound("Módulo não encontrado.");
}

/** Replaces the whole quiz (questions + answers) atomically. */
export async function saveQuiz(target: QuizTarget, input: QuizInput) {
  await assertTarget(target);
  for (const q of input.questions) {
    if (!NUMERIC.has(q.type) && q.options.length === 0) throw badRequest("Pergunta sem opções.");
  }
  await prisma.$transaction(async (tx) => {
    const quiz = await tx.quiz.upsert({
      where: target,
      create: { ...target, title: input.title, passScore: input.passScore, published: input.published },
      update: { title: input.title, passScore: input.passScore, published: input.published },
    });
    await tx.question.deleteMany({ where: { quizId: quiz.id } }); // cascades to answers
    for (const [i, q] of input.questions.entries()) {
      const numeric = NUMERIC.has(q.type);
      await tx.question.create({
        data: {
          quizId: quiz.id,
          orderIndex: i,
          type: q.type,
          prompt: q.prompt,
          explanation: q.explanation,
          points: q.points,
          chartRef: q.chartRef ?? null,
          numericAnswer: numeric ? (q.answer ?? null) : null,
          numericTolerance: numeric ? (q.tolerance ?? null) : null,
          numericUnit: numeric ? (q.unit ?? null) : null,
          answers: numeric ? undefined : { create: q.options.map((o, j) => ({ orderIndex: j, text: o.text, isCorrect: o.correct, explanation: o.why ?? null })) },
        },
      });
    }
    // The edited owner is no longer overwritten by the seed.
    if ("lessonId" in target) await tx.lesson.update({ where: { id: target.lessonId }, data: { managedBySeed: false } });
    else await tx.module.update({ where: { id: target.moduleId }, data: { managedBySeed: false } });
  });
}

export async function removeQuiz(target: QuizTarget) {
  await assertTarget(target);
  await prisma.quiz.deleteMany({ where: target });
  if ("lessonId" in target) await prisma.lesson.update({ where: { id: target.lessonId }, data: { managedBySeed: false } });
  else await prisma.module.update({ where: { id: target.moduleId }, data: { managedBySeed: false } });
}
