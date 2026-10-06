import "server-only";
import { prisma } from "@/database/client";
import { roundTo } from "@/lib/money";
import type { AdminStats } from "../types";

const DAY = 86_400_000;

export async function getAdminStats(): Promise<AdminStats> {
  const now = Date.now();
  const since = new Date(now - 7 * DAY);
  const sinceDay = new Date(`${since.toISOString().slice(0, 10)}T00:00:00Z`);

  const [total, admins, disabled, new7d, active7d, modules, lessons, publishedLessons, questions, lessonsCompleted, attempts, attemptAgg, passed, simTrades, replayTrades, btDecisions, journal, plans, tutor, topRaw, quizRaw, recent] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { disabledAt: { not: null } } }),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.user.count({ where: { lastActiveOn: { gte: sinceDay } } }),
    prisma.module.count(),
    prisma.lesson.count(),
    prisma.lesson.count({ where: { published: true } }),
    prisma.question.count(),
    prisma.progress.count({ where: { status: "COMPLETED" } }),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.aggregate({ _avg: { scorePercent: true } }),
    prisma.quizAttempt.count({ where: { passed: true } }),
    prisma.trade.count({ where: { source: "SIMULATOR" } }),
    prisma.trade.count({ where: { source: "REPLAY" } }),
    prisma.backtestDecision.count(),
    prisma.journalEntry.count(),
    prisma.dailyPlan.count(),
    prisma.tutorConversation.count(),
    prisma.progress.groupBy({ by: ["lessonId"], where: { status: "COMPLETED" }, _count: { _all: true }, orderBy: { _count: { lessonId: "desc" } }, take: 5 }),
    prisma.quizAttempt.groupBy({ by: ["quizId"], _count: { _all: true }, _avg: { scorePercent: true }, having: { quizId: { _count: { gte: 5 } } }, orderBy: { _avg: { scorePercent: "asc" } }, take: 5 }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { name: true, email: true, createdAt: true } }),
  ]);

  const [topLessons, hardQuizzes] = await Promise.all([
    prisma.lesson.findMany({ where: { id: { in: topRaw.map((t) => t.lessonId) } }, select: { id: true, title: true } }),
    prisma.quiz.findMany({ where: { id: { in: quizRaw.map((q) => q.quizId) } }, select: { id: true, title: true } }),
  ]);
  const lessonTitle = new Map(topLessons.map((l) => [l.id, l.title]));
  const quizTitle = new Map(hardQuizzes.map((q) => [q.id, q.title]));

  return {
    users: { total, students: total - admins, admins, disabled, new7d, active7d },
    content: { modules, lessons, publishedLessons, questions },
    learning: {
      lessonsCompleted,
      quizAttempts: attempts,
      avgScore: attemptAgg._avg.scorePercent === null ? null : roundTo(attemptAgg._avg.scorePercent, 1),
      passRate: attempts === 0 ? null : roundTo((passed / attempts) * 100, 1),
    },
    practice: { simulatorTrades: simTrades, replayTrades, backtestDecisions: btDecisions, journalEntries: journal, dailyPlans: plans, tutorConversations: tutor },
    topLessons: topRaw.map((t) => ({ title: lessonTitle.get(t.lessonId) ?? "—", completions: t._count._all })),
    hardestQuizzes: quizRaw.map((q) => ({ title: quizTitle.get(q.quizId) ?? "—", attempts: q._count._all, avgScore: roundTo(q._avg.scorePercent ?? 0, 1) })),
    recentUsers: recent.map((u) => ({ name: u.name, email: u.email, createdAt: u.createdAt.toISOString() })),
  };
}
