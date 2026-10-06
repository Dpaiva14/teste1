import "server-only";
import { Prisma, prisma } from "@/database/client";
import { ACHIEVEMENTS, type AchievementDef } from "@/modules/achievements";
import { XP, XP_DAILY_CAP } from "../logic/xp";
import { applyActivity, dayKey } from "../logic/streak";

type Db = typeof prisma | Prisma.TransactionClient;

/**
 * Idempotent XP award: (userId, kind, refId) is unique, so repeating an action never pays twice.
 * Some kinds have a rolling-24h cap so grinding is not rewarded. Returns the XP actually granted.
 */
export async function awardXp(
  userId: string,
  kind: string,
  refId: string,
  amount: number,
  db: Db = prisma,
): Promise<number> {
  if (amount <= 0) return 0;
  const cap = XP_DAILY_CAP[kind];
  let grant = amount;
  if (cap !== undefined) {
    const since = new Date(Date.now() - 24 * 3600_000);
    const agg = await db.xpEvent.aggregate({ where: { userId, kind, createdAt: { gte: since } }, _sum: { amount: true } });
    grant = Math.min(amount, Math.max(0, cap - (agg._sum.amount ?? 0)));
    if (grant <= 0) return 0;
  }
  try {
    await db.xpEvent.create({ data: { userId, kind, refId, amount: grant } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return 0;
    throw e;
  }
  await db.user.update({ where: { id: userId }, data: { xp: { increment: grant } } });
  return grant;
}

/** Marks the user active today (their timezone) and updates the learning streak. */
export async function recordActivity(userId: string, now = new Date()): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true, streakCount: true, longestStreak: true, lastActiveOn: true },
  });
  if (!user) return;
  const today = dayKey(now, user.timezone);
  const next = applyActivity(
    { count: user.streakCount, longest: user.longestStreak, lastActive: user.lastActiveOn ? user.lastActiveOn.toISOString().slice(0, 10) : null },
    today,
  );
  if (next.lastActive === (user.lastActiveOn?.toISOString().slice(0, 10) ?? null)) return;
  await prisma.user.update({
    where: { id: userId },
    data: { streakCount: next.count, longestStreak: next.longest, lastActiveOn: new Date(`${next.lastActive}T00:00:00Z`) },
  });
}

async function ensureAchievementRows(): Promise<Map<string, string>> {
  const rows = await prisma.achievement.findMany({ select: { id: true, key: true } });
  const map = new Map(rows.map((r) => [r.key, r.id]));
  for (const [i, a] of ACHIEVEMENTS.entries()) {
    if (!map.has(a.key)) {
      const created = await prisma.achievement.create({
        data: { key: a.key, title: a.title, description: a.description, icon: a.icon, category: a.category, xpReward: a.xpReward, sortOrder: i },
        select: { id: true },
      });
      map.set(a.key, created.id);
    }
  }
  return map;
}

async function moduleCompleted(userId: string, moduleNumber: number): Promise<boolean> {
  const mod = await prisma.module.findFirst({
    where: { number: moduleNumber, published: true },
    select: { lessons: { where: { published: true }, select: { id: true } } },
  });
  if (!mod || mod.lessons.length === 0) return false;
  const done = await prisma.progress.count({ where: { userId, status: "COMPLETED", lessonId: { in: mod.lessons.map((l) => l.id) } } });
  return done >= mod.lessons.length;
}

async function strongExercises(userId: string, exerciseKey: string): Promise<number> {
  const rows = await prisma.exerciseAttempt.findMany({
    where: { userId, exerciseKey, scorePercent: { gte: 80 } },
    select: { scenarioId: true },
    distinct: ["scenarioId"],
  });
  return rows.length;
}

/** Evaluates every achievement and unlocks the ones newly earned. Returns the new ones (for toasts). */
export async function evaluateAchievements(userId: string, unlockedLevelCount?: number): Promise<AchievementDef[]> {
  const [user, already, lessons, perfect, backtestCount, waitCount, journalDates, rated, finalOk] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { longestStreak: true, streakCount: true } }),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievement: { select: { key: true } } } }),
    prisma.progress.count({ where: { userId, status: "COMPLETED" } }),
    prisma.quizAttempt.count({ where: { userId, scorePercent: 100 } }),
    prisma.backtestDecision.count({ where: { backtest: { userId } } }),
    prisma.backtestDecision.count({ where: { backtest: { userId }, choice: "WAIT" } }),
    prisma.journalEntry.findMany({ where: { userId }, select: { tradeDate: true } }),
    prisma.journalEntry.count({ where: { userId, processRating: { not: null } } }),
    prisma.finalAssessment.count({ where: { userId, status: "COMPLETED", processScore: { gte: 70 } } }),
  ]);
  const have = new Set(already.map((a) => a.achievement.key));
  const journalDays = new Set(journalDates.map((j) => j.tradeDate.toISOString().slice(0, 10))).size;

  const earned: string[] = [];
  const check = (key: string, ok: boolean) => {
    if (ok && !have.has(key)) earned.push(key);
  };
  check("first-lesson", lessons >= 1);
  check("first-10-lessons", lessons >= 10);
  check("fifty-lessons", lessons >= 50);
  check("perfect-quiz", perfect >= 1);
  check("streak-7", user.longestStreak >= 7);
  check("streak-30", user.longestStreak >= 30);
  check("backtests-100", backtestCount >= 100);
  check("patience-25", waitCount >= 25);
  check("journal-30-days", journalDays >= 30);
  check("process-over-outcome", rated >= 10);
  check("final-assessment", finalOk >= 1);
  if (unlockedLevelCount !== undefined) {
    check("level-5", unlockedLevelCount >= 5);
    check("level-10", unlockedLevelCount >= 10);
  }
  // Module-dependent achievements: only query when not yet unlocked.
  if (!have.has("market-structure-master") && (await moduleCompleted(userId, 7)) && (await strongExercises(userId, "market-structure")) >= 3) earned.push("market-structure-master");
  if (!have.has("fibonacci-apprentice") && (await moduleCompleted(userId, 8)) && (await strongExercises(userId, "fibonacci")) >= 2) earned.push("fibonacci-apprentice");
  if (!have.has("confluence-student") && (await moduleCompleted(userId, 11)) && (await strongExercises(userId, "confluence")) >= 3) earned.push("confluence-student");
  if (!have.has("risk-manager") && (await moduleCompleted(userId, 17))) {
    const riskQuizPassed = await prisma.quizAttempt.count({ where: { userId, passed: true, quiz: { module: { number: 17 } } } });
    if (riskQuizPassed > 0) earned.push("risk-manager");
  }

  if (earned.length === 0) return [];
  const ids = await ensureAchievementRows();
  const unlocked: AchievementDef[] = [];
  for (const key of earned) {
    const def = ACHIEVEMENTS.find((a) => a.key === key);
    const achievementId = ids.get(key);
    if (!def || !achievementId) continue;
    try {
      await prisma.userAchievement.create({ data: { userId, achievementId } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue;
      throw e;
    }
    await awardXp(userId, "ACHIEVEMENT", key, def.xpReward);
    unlocked.push(def);
  }
  return unlocked;
}

export { XP };
