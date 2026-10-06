import "server-only";
import { prisma } from "@/database/client";
import { COURSE_SLUG } from "@/modules/course";
import { LEVELS } from "@/modules/levels";
import type { SessionUser } from "@/lib/auth/session";
import { unlockedLevels, type LevelProgress } from "../logic/unlock";

export interface UnlockState {
  levelProgress: LevelProgress[];
  unlocked: Set<number>;
  completedLessonIds: Set<string>;
}

/** Computes per-level completion and which levels the user may enter. ADMINs see everything unlocked. */
export async function computeUnlocked(user: Pick<SessionUser, "id" | "role">): Promise<UnlockState> {
  const [modules, done] = await Promise.all([
    prisma.module.findMany({
      where: { published: true, course: { slug: COURSE_SLUG } },
      select: { level: true, lessons: { where: { published: true }, select: { id: true } } },
    }),
    prisma.progress.findMany({ where: { userId: user.id, status: "COMPLETED" }, select: { lessonId: true } }),
  ]);
  const completedLessonIds = new Set(done.map((d) => d.lessonId));
  const levelProgress: LevelProgress[] = LEVELS.map((l) => {
    const lessons = modules.filter((m) => m.level === l.level).flatMap((m) => m.lessons);
    return { level: l.level, totalLessons: lessons.length, completedLessons: lessons.filter((x) => completedLessonIds.has(x.id)).length };
  });
  const unlocked = user.role === "ADMIN" ? new Set(LEVELS.map((l) => l.level)) : unlockedLevels(levelProgress);
  return { levelProgress, unlocked, completedLessonIds };
}
