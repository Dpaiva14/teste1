import "server-only";
import { Prisma, prisma } from "@/database/client";
import { awardXp, evaluateAchievements, recordActivity, XP } from "@/features/gamification/server/gamification-service";
import { HttpError, forbidden, notFound } from "@/lib/errors";
import type { SessionUser } from "@/lib/auth/session";
import { computeUnlocked } from "./progress-service";

/**
 * Upsert on (userId, lessonId) that survives the create/create race: the loser retries as a plain update.
 * `create` is used only for a new row; `update` must never downgrade an existing status.
 */
export async function upsertProgress(
  userId: string,
  lessonId: string,
  create: Omit<Prisma.ProgressUncheckedCreateInput, "userId" | "lessonId">,
  update: Prisma.ProgressUncheckedUpdateInput,
) {
  const where = { userId_lessonId: { userId, lessonId } };
  try {
    return await prisma.progress.upsert({ where, create: { userId, lessonId, ...create }, update });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return prisma.progress.update({ where, data: update });
    throw e;
  }
}

/** Marks a lesson COMPLETED (idempotent) and pays the associated XP once. */
export async function completeLessonInternal(userId: string, lessonId: string): Promise<{ newlyCompleted: boolean; xp: number }> {
  const existing = await prisma.progress.findUnique({ where: { userId_lessonId: { userId, lessonId } }, select: { status: true } });
  if (existing?.status === "COMPLETED") return { newlyCompleted: false, xp: 0 };

  const lesson = await prisma.lesson.findUniqueOrThrow({ where: { id: lessonId }, select: { xpReward: true, moduleId: true } });
  await upsertProgress(userId, lessonId, { status: "COMPLETED", startedAt: new Date(), completedAt: new Date() }, { status: "COMPLETED", completedAt: new Date() });
  let xp = await awardXp(userId, "LESSON_COMPLETE", lessonId, lesson.xpReward ?? XP.lessonComplete);

  // Module completion bonus.
  const siblings = await prisma.lesson.findMany({ where: { moduleId: lesson.moduleId, published: true }, select: { id: true } });
  const doneCount = await prisma.progress.count({ where: { userId, status: "COMPLETED", lessonId: { in: siblings.map((s) => s.id) } } });
  if (doneCount >= siblings.length) xp += await awardXp(userId, "MODULE_COMPLETE", lesson.moduleId, XP.moduleComplete);
  return { newlyCompleted: true, xp };
}

export async function startLesson(user: SessionUser, lessonId: string): Promise<void> {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { published: true, module: { select: { level: true } } } });
  if (!lesson || !lesson.published) throw notFound("Aula não encontrada.");
  const { unlocked } = await computeUnlocked(user);
  if (!unlocked.has(lesson.module.level)) throw forbidden("Este nível ainda está bloqueado.");
  try {
    await prisma.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      create: { userId: user.id, lessonId, status: "IN_PROGRESS", startedAt: new Date() },
      update: {},
    });
  } catch (e) {
    // Two concurrent "start" calls (React Strict Mode, double tabs) race on the unique key: the loser is fine.
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }
}

export async function addLessonTime(user: SessionUser, lessonId: string, seconds: number): Promise<void> {
  const secs = Math.max(0, Math.min(600, Math.floor(seconds)));
  if (secs === 0) return;
  await prisma.progress.updateMany({ where: { userId: user.id, lessonId }, data: { timeSpentSec: { increment: secs } } });
}

/** Manual completion — only for lessons WITHOUT a quiz (lessons with a quiz complete by passing it). */
export async function completeLessonManually(user: SessionUser, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { published: true, quiz: { select: { id: true, questions: { select: { id: true } } } }, module: { select: { level: true } } },
  });
  if (!lesson || !lesson.published) throw notFound("Aula não encontrada.");
  const { unlocked } = await computeUnlocked(user);
  if (!unlocked.has(lesson.module.level)) throw forbidden("Este nível ainda está bloqueado.");
  if (lesson.quiz && lesson.quiz.questions.length > 0) {
    throw new HttpError(400, "QUIZ_REQUIRED", "Esta aula conclui-se ao passar no quiz.");
  }
  const res = await completeLessonInternal(user.id, lessonId);
  await recordActivity(user.id);
  const newAchievements = await evaluateAchievements(user.id, (await computeUnlocked(user)).unlocked.size);
  return { ...res, newAchievements };
}
