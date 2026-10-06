import { UNLOCK_THRESHOLD } from "@/modules/levels";

export interface LevelProgress {
  level: number;
  totalLessons: number;
  completedLessons: number;
}

export function levelCompletion(p: LevelProgress): number {
  return p.totalLessons === 0 ? 1 : p.completedLessons / p.totalLessons;
}

/**
 * Level 1 is always open. Level N opens when level N-1 has been unlocked AND at least
 * UNLOCK_THRESHOLD of its lessons are completed. Empty levels count as complete so they never block.
 */
export function unlockedLevels(progress: readonly LevelProgress[], threshold = UNLOCK_THRESHOLD): Set<number> {
  const sorted = [...progress].sort((a, b) => a.level - b.level);
  const open = new Set<number>();
  let previousOpenAndDone = true;
  for (const p of sorted) {
    if (previousOpenAndDone) open.add(p.level);
    else break;
    previousOpenAndDone = levelCompletion(p) >= threshold;
  }
  return open;
}

/** The first level that is open but not yet beaten — where the student should be working. */
export function currentLevel(progress: readonly LevelProgress[], threshold = UNLOCK_THRESHOLD): number {
  const sorted = [...progress].sort((a, b) => a.level - b.level);
  for (const p of sorted) if (levelCompletion(p) < threshold) return p.level;
  return sorted[sorted.length - 1]?.level ?? 1;
}
