import "server-only";
import { Prisma, prisma } from "@/database/client";
import { buildScenarioCandles } from "@/features/scenarios/build";
import { awardXp, evaluateAchievements, recordActivity, XP } from "@/features/gamification/server/gamification-service";
import { HttpError, forbidden, notFound } from "@/lib/errors";
import { hashSeed, Rng } from "@/lib/market-data/prng";
import { getInstrument } from "@/modules/instruments";
import { getScenario } from "@/modules/scenarios";
import type { SessionUser } from "@/lib/auth/session";
import { gradeQuiz, type GradableQuestion, type QuestionResponse } from "../logic/grading";
import type { QuestionFeedbackDTO, QuizChartDTO, QuizDTO, QuizResultDTO } from "../types";
import { computeUnlocked } from "./progress-service";
import { completeLessonInternal, upsertProgress } from "./lesson-service";

const quizInclude = {
  questions: { orderBy: { orderIndex: "asc" as const }, include: { answers: { orderBy: { orderIndex: "asc" as const } } } },
  lesson: { select: { id: true, moduleId: true, module: { select: { level: true, id: true } } } },
  module: { select: { id: true, level: true } },
} satisfies Prisma.QuizInclude;

type QuizWithRelations = Prisma.QuizGetPayload<{ include: typeof quizInclude }>;

/** Builds the client payload for a quiz — WITHOUT correctness flags or explanations. */
export async function buildQuizDTO(userId: string, quiz: QuizWithRelations): Promise<QuizDTO> {
  const stats = await prisma.quizAttempt.aggregate({ where: { userId, quizId: quiz.id }, _max: { scorePercent: true }, _count: true });
  const attempts = stats._count;

  const charts: Record<string, QuizChartDTO> = {};
  for (const q of quiz.questions) {
    if (!q.chartRef || charts[q.chartRef]) continue;
    const sc = getScenario(q.chartRef);
    if (!sc) continue;
    charts[q.chartRef] = {
      scenarioId: sc.id,
      symbol: sc.symbol,
      timeframe: sc.timeframe,
      priceDecimals: getInstrument(sc.symbol)?.priceDecimals ?? 0,
      candles: buildScenarioCandles(sc),
    };
  }

  return {
    id: quiz.id,
    title: quiz.title,
    passScore: quiz.passScore,
    bestScore: stats._max.scorePercent,
    attempts,
    charts,
    questions: quiz.questions.map((q) => {
      const isNumeric = q.numericAnswer !== null;
      const shuffle = q.type !== "TRUE_FALSE" && q.answers.length > 1;
      const opts = q.answers.map((a) => ({ id: a.id, text: a.text }));
      if (shuffle) {
        // Stable per (user, question, attempt number): same order on reload, new order on retry.
        const rng = new Rng(hashSeed(`${userId}:${q.id}:${attempts}`));
        for (let i = opts.length - 1; i > 0; i--) {
          const j = Math.floor(rng.random() * (i + 1));
          [opts[i], opts[j]] = [opts[j]!, opts[i]!];
        }
      }
      return {
        id: q.id,
        type: q.type,
        prompt: q.prompt,
        chartRef: q.chartRef && charts[q.chartRef] ? q.chartRef : null,
        numeric: isNumeric ? { unit: q.numericUnit } : null,
        options: isNumeric ? [] : opts,
      };
    }),
  };
}

export async function getQuizDTO(user: SessionUser, quizId: string): Promise<QuizDTO> {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: quizInclude });
  if (!quiz || !quiz.published) throw notFound("Quiz não encontrado.");
  await assertQuizAccess(user, quiz);
  return buildQuizDTO(user.id, quiz);
}

async function assertQuizAccess(user: SessionUser, quiz: QuizWithRelations): Promise<void> {
  if (user.role === "ADMIN") return;
  const level = quiz.lesson?.module.level ?? quiz.module?.level;
  if (level === undefined) throw notFound();
  const { unlocked } = await computeUnlocked(user);
  if (!unlocked.has(level)) throw forbidden("Este nível ainda está bloqueado. Conclui o nível anterior para o desbloqueares.");
}

export interface SubmitQuizInput {
  responses: Record<string, QuestionResponse>;
}

export async function submitQuiz(user: SessionUser, quizId: string, input: SubmitQuizInput): Promise<QuizResultDTO> {
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: quizInclude });
  if (!quiz || !quiz.published) throw notFound("Quiz não encontrado.");
  await assertQuizAccess(user, quiz);
  if (quiz.questions.length === 0) throw new HttpError(400, "EMPTY_QUIZ", "Este quiz ainda não tem perguntas.");

  const gradable: GradableQuestion[] = quiz.questions.map((q) => ({
    id: q.id,
    type: q.type,
    points: q.points,
    numericAnswer: q.numericAnswer,
    numericTolerance: q.numericTolerance,
    answers: q.answers.map((a) => ({ id: a.id, isCorrect: a.isCorrect, explanation: a.explanation })),
  }));
  const grade = gradeQuiz(gradable, input.responses);
  const passed = grade.scorePercent >= quiz.passScore;

  const previousBest = (await prisma.quizAttempt.aggregate({ where: { userId: user.id, quizId }, _max: { scorePercent: true } }))._max.scorePercent;
  const wasPassedBefore = previousBest !== null && previousBest >= quiz.passScore;

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      quizId,
      scorePercent: grade.scorePercent,
      correctCount: grade.correctCount,
      totalCount: grade.totalCount,
      passed,
      results: grade.results.map((r) => ({ questionId: r.questionId, correct: r.correct, givenOptionId: r.givenOptionId, givenValue: r.givenValue })),
    },
  });

  let xp = 0;
  let lessonCompleted = false;
  if (quiz.lessonId) {
    await upsertProgress(
      user.id,
      quiz.lessonId,
      { status: "IN_PROGRESS", startedAt: new Date(), bestQuizScore: grade.scorePercent, quizAttempts: 1 },
      { quizAttempts: { increment: 1 }, bestQuizScore: Math.max(previousBest ?? 0, grade.scorePercent) },
    );
    if (passed) {
      xp += await awardXp(user.id, "QUIZ_PASSED", quiz.id, XP.quizPassBase);
      if (grade.scorePercent === 100) xp += await awardXp(user.id, "QUIZ_PERFECT", quiz.id, XP.quizPerfectBonus);
      const done = await completeLessonInternal(user.id, quiz.lessonId);
      lessonCompleted = done.newlyCompleted;
      xp += done.xp;
    }
  } else if (passed && !wasPassedBefore) {
    xp += await awardXp(user.id, "MODULE_QUIZ", quiz.id, XP.moduleQuizPass);
  }

  await recordActivity(user.id);
  const unlockedNow = (await computeUnlocked(user)).unlocked.size;
  const newAchievements = await evaluateAchievements(user.id, unlockedNow);

  const feedback: QuestionFeedbackDTO[] = quiz.questions.map((q, i) => {
    const r = grade.results[i]!;
    const optionFeedback: Record<string, string> = {};
    for (const a of q.answers) if (a.explanation) optionFeedback[a.id] = a.explanation;
    return {
      questionId: q.id,
      correct: r.correct,
      skipped: r.skipped,
      explanation: q.explanation,
      correctOptionIds: r.correctOptionIds,
      givenOptionId: r.givenOptionId,
      givenValue: r.givenValue,
      expectedNumeric: r.expectedNumeric,
      numericTolerance: r.numericTolerance,
      numericUnit: q.numericUnit,
      optionFeedback,
    };
  });

  return {
    attemptId: attempt.id,
    scorePercent: grade.scorePercent,
    correctCount: grade.correctCount,
    totalCount: grade.totalCount,
    passed,
    passScore: quiz.passScore,
    xpAwarded: xp,
    lessonCompleted,
    newAchievements,
    feedback,
  };
}

export { quizInclude };
export type { QuizWithRelations };
