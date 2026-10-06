import "server-only";
import { prisma } from "@/database/client";
import { notFound } from "@/lib/errors";
import { COURSE_SLUG } from "@/modules/course";
import { LEVELS } from "@/modules/levels";
import type { SessionUser } from "@/lib/auth/session";
import type { ExerciseSpec, VisualSpec } from "@/modules/types";
import { currentLevel, levelCompletion } from "../logic/unlock";
import type { CurriculumDTO, LessonDTO, LessonStatus, LevelDTO, ModuleDetailDTO, ModuleSummaryDTO } from "../types";
import { buildQuizDTO, quizInclude } from "./quiz-service";
import { computeUnlocked } from "./progress-service";

async function loadModules() {
  return prisma.module.findMany({
    where: { published: true, course: { slug: COURSE_SLUG } },
    orderBy: { number: "asc" },
    include: {
      lessons: { where: { published: true }, orderBy: { number: "asc" }, select: { id: true, slug: true, title: true, number: true, estimatedMinutes: true } },
      quiz: { select: { id: true, passScore: true, published: true, questions: { select: { id: true } } } },
    },
  });
}

export async function getCurriculum(user: SessionUser): Promise<CurriculumDTO> {
  const [modules, state, attempts] = await Promise.all([
    loadModules(),
    computeUnlocked(user),
    prisma.quizAttempt.groupBy({ by: ["quizId"], where: { userId: user.id }, _max: { scorePercent: true } }),
  ]);
  const best = new Map(attempts.map((a) => [a.quizId, a._max.scorePercent]));

  const summaries: ModuleSummaryDTO[] = modules.map((m) => {
    const quiz = m.quiz && m.quiz.published && m.quiz.questions.length > 0 ? m.quiz : null;
    const bestScore = quiz ? (best.get(quiz.id) ?? null) : null;
    return {
      id: m.id,
      slug: m.slug,
      number: m.number,
      level: m.level,
      title: m.title,
      summary: m.summary,
      difficulty: m.difficulty,
      icon: m.icon,
      estimatedMinutes: m.estimatedMinutes || m.lessons.reduce((s, l) => s + l.estimatedMinutes, 0),
      lessonCount: m.lessons.length,
      completedLessons: m.lessons.filter((l) => state.completedLessonIds.has(l.id)).length,
      quiz: quiz ? { id: quiz.id, bestScore, passed: bestScore !== null && bestScore >= quiz.passScore, passScore: quiz.passScore } : null,
    };
  });

  const levels: LevelDTO[] = LEVELS.map((l) => {
    const lp = state.levelProgress.find((p) => p.level === l.level)!;
    return { ...l, unlocked: state.unlocked.has(l.level), completion: lp.totalLessons === 0 ? 0 : levelCompletion(lp), modules: summaries.filter((s) => s.level === l.level) };
  });

  const quizModules = summaries.filter((s) => s.quiz);
  const scores = quizModules.map((s) => s.quiz!.bestScore).filter((x): x is number => x !== null);
  const allLessons = summaries.reduce((s, m) => s + m.lessonCount, 0);

  // Next lesson: first incomplete lesson in an unlocked level, walking modules in curriculum order.
  let nextLesson: CurriculumDTO["nextLesson"] = null;
  outer: for (const m of modules) {
    if (!state.unlocked.has(m.level)) continue;
    for (const lesson of m.lessons) {
      if (!state.completedLessonIds.has(lesson.id)) {
        nextLesson = { moduleSlug: m.slug, lessonSlug: lesson.slug, moduleTitle: m.title, lessonTitle: lesson.title, moduleNumber: m.number };
        break outer;
      }
    }
  }

  return {
    levels,
    currentLevel: currentLevel(state.levelProgress),
    totals: {
      lessons: allLessons,
      completedLessons: [...state.completedLessonIds].length,
      modules: summaries.length,
      completedModules: summaries.filter((s) => s.lessonCount > 0 && s.completedLessons >= s.lessonCount).length,
      quizzesPassed: quizModules.filter((s) => s.quiz!.passed).length,
      quizzesTotal: quizModules.length,
      averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
    },
    nextLesson,
  };
}

function statusOf(progress: { status: string } | undefined): LessonStatus {
  if (!progress) return "not_started";
  return progress.status === "COMPLETED" ? "completed" : progress.status === "IN_PROGRESS" ? "in_progress" : "not_started";
}

export async function getModuleDetail(user: SessionUser, slug: string): Promise<ModuleDetailDTO> {
  const curriculum = await getCurriculum(user);
  const level = curriculum.levels.find((l) => l.modules.some((m) => m.slug === slug));
  const summary = level?.modules.find((m) => m.slug === slug);
  if (!level || !summary) throw notFound("Módulo não encontrado.");

  const lessons = await prisma.lesson.findMany({
    where: { moduleId: summary.id, published: true },
    orderBy: { number: "asc" },
    select: { id: true, slug: true, number: true, title: true, summary: true, estimatedMinutes: true, progress: { where: { userId: user.id }, select: { status: true, bestQuizScore: true } } },
  });

  let moduleQuiz = null;
  if (summary.quiz && level.unlocked) {
    const quiz = await prisma.quiz.findUnique({ where: { id: summary.quiz.id }, include: quizInclude });
    if (quiz) moduleQuiz = await buildQuizDTO(user.id, quiz);
  }

  return {
    module: summary,
    levelTitle: level.title,
    levelUnlocked: level.unlocked,
    lessons: lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      number: l.number,
      title: l.title,
      summary: l.summary,
      minutes: l.estimatedMinutes,
      status: statusOf(l.progress[0]),
      bestQuizScore: l.progress[0]?.bestQuizScore ?? null,
    })),
    moduleQuiz,
  };
}

export async function getLessonDetail(user: SessionUser, moduleSlug: string, lessonSlug: string): Promise<LessonDTO | { locked: true; level: number; moduleTitle: string }> {
  const mod = await prisma.module.findFirst({
    where: { slug: moduleSlug, published: true, course: { slug: COURSE_SLUG } },
    include: {
      lessons: { where: { published: true }, orderBy: { number: "asc" }, select: { id: true, slug: true, title: true, number: true } },
      quiz: { select: { id: true, published: true, questions: { select: { id: true } } } },
    },
  });
  if (!mod) throw notFound("Módulo não encontrado.");

  const state = await computeUnlocked(user);
  if (!state.unlocked.has(mod.level)) return { locked: true, level: mod.level, moduleTitle: mod.title };

  const lesson = await prisma.lesson.findFirst({
    where: { moduleId: mod.id, slug: lessonSlug, published: true },
    include: {
      quiz: { include: quizInclude },
      assets: { select: { id: true, filename: true, kind: true } },
      progress: { where: { userId: user.id }, select: { status: true } },
    },
  });
  if (!lesson) throw notFound("Aula não encontrada.");

  const idx = mod.lessons.findIndex((l) => l.id === lesson.id);
  const prev = mod.lessons[idx - 1];
  const next = mod.lessons[idx + 1];

  let nextModule: LessonDTO["nextModule"] = null;
  if (!next) {
    const nm = await prisma.module.findFirst({ where: { published: true, course: { slug: COURSE_SLUG }, number: { gt: mod.number } }, orderBy: { number: "asc" }, select: { slug: true, title: true, number: true } });
    nextModule = nm;
  }

  const quiz = lesson.quiz && lesson.quiz.published && lesson.quiz.questions.length > 0 ? await buildQuizDTO(user.id, lesson.quiz) : null;
  const hasModuleQuiz = mod.quiz?.published && (mod.quiz.questions.length ?? 0) > 0;

  return {
    id: lesson.id,
    slug: lesson.slug,
    number: lesson.number,
    title: lesson.title,
    summary: lesson.summary,
    difficulty: lesson.difficulty,
    content: lesson.content,
    example: lesson.example,
    visual: (lesson.visual as VisualSpec | null) ?? null,
    exercise: (lesson.exercise as ExerciseSpec | null) ?? null,
    takeaways: lesson.takeaways,
    videoUrl: lesson.videoUrl,
    estimatedMinutes: lesson.estimatedMinutes,
    xpReward: lesson.xpReward,
    status: statusOf(lesson.progress[0]),
    module: { id: mod.id, slug: mod.slug, number: mod.number, title: mod.title, level: mod.level, icon: mod.icon, lessonCount: mod.lessons.length },
    assets: lesson.assets.map((a) => ({ id: a.id, filename: a.filename, kind: a.kind })),
    prev: prev ? { slug: prev.slug, title: prev.title, moduleSlug: mod.slug } : null,
    next: next ? { slug: next.slug, title: next.title, moduleSlug: mod.slug } : null,
    moduleQuizId: !next && hasModuleQuiz ? mod.quiz!.id : null,
    nextModule,
    quiz,
  };
}
