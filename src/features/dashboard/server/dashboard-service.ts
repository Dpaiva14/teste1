import "server-only";
import { prisma } from "@/database/client";
import { getCurriculum } from "@/features/academy/server/curriculum-service";
import { dayKey, effectiveStreak } from "@/features/gamification/logic/streak";
import { rankForXp } from "@/features/gamification/logic/xp";
import type { SessionUser } from "@/lib/auth/session";
import { ACHIEVEMENTS } from "@/modules/achievements";
import { DEVELOPMENT_STAGES, LEVELS, type DevelopmentStage } from "@/modules/levels";

export async function getDashboard(user: SessionUser) {
  const [curriculum, dbUser, unlocked, events, journalCount, accounts, attempts] = await Promise.all([
    getCurriculum(user),
    prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { xp: true, streakCount: true, longestStreak: true, lastActiveOn: true, timezone: true } }),
    prisma.userAchievement.findMany({ where: { userId: user.id }, orderBy: { unlockedAt: "desc" }, take: 6, include: { achievement: { select: { key: true } } } }),
    prisma.economicEvent.findMany({ where: { scheduledAt: { gte: new Date() }, impact: { in: ["HIGH", "EXTREME"] } }, orderBy: { scheduledAt: "asc" }, take: 3, select: { id: true, title: true, impact: true, scheduledAt: true, isDemo: true } }),
    prisma.journalEntry.count({ where: { userId: user.id } }),
    prisma.simulationAccount.findMany({ where: { userId: user.id, status: "ACTIVE" }, select: { id: true, name: true, balance: true, initialBalance: true }, take: 1, orderBy: { createdAt: "desc" } }),
    prisma.exerciseAttempt.count({ where: { userId: user.id } }),
  ]);

  const today = dayKey(new Date(), dbUser.timezone);
  const streak = effectiveStreak({ count: dbUser.streakCount, longest: dbUser.longestStreak, lastActive: dbUser.lastActiveOn?.toISOString().slice(0, 10) ?? null }, today);

  const currentLevel = LEVELS.find((l) => l.level === curriculum.currentLevel) ?? LEVELS[0]!;
  const stageIndex = DEVELOPMENT_STAGES.indexOf(currentLevel.stage as DevelopmentStage);
  const stages = DEVELOPMENT_STAGES.map((name, i) => ({ name, state: i < stageIndex ? ("done" as const) : i === stageIndex ? ("current" as const) : ("upcoming" as const) }));

  return {
    curriculum,
    rank: rankForXp(dbUser.xp),
    xp: dbUser.xp,
    streak,
    longestStreak: dbUser.longestStreak,
    currentLevel,
    stages,
    achievements: unlocked.map((u) => ({ at: u.unlockedAt.toISOString(), def: ACHIEVEMENTS.find((a) => a.key === u.achievement.key) })).filter((a) => a.def),
    achievementsTotal: ACHIEVEMENTS.length,
    events: events.map((e) => ({ ...e, scheduledAt: e.scheduledAt.toISOString() })),
    journalCount,
    account: accounts[0] ?? null,
    exerciseAttempts: attempts,
  };
}
