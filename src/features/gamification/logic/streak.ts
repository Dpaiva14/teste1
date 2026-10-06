/** Date helpers use YYYY-MM-DD strings computed in the USER's timezone, so streaks match their calendar. */

export function dayKey(date: Date, timeZone: string): string {
  try {
    // en-CA formats as YYYY-MM-DD
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function previousDayKey(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export interface StreakState {
  count: number;
  longest: number;
  /** YYYY-MM-DD or null */
  lastActive: string | null;
}

/** Applies "was active today" to a streak. Idempotent within the same day. */
export function applyActivity(state: StreakState, today: string): StreakState {
  if (state.lastActive === today) return state;
  const count = state.lastActive === previousDayKey(today) ? state.count + 1 : 1;
  return { count, longest: Math.max(state.longest, count), lastActive: today };
}

/** What the streak looks like if read today without new activity (broken streaks show 0). */
export function effectiveStreak(state: StreakState, today: string): number {
  if (!state.lastActive) return 0;
  if (state.lastActive === today || state.lastActive === previousDayKey(today)) return state.count;
  return 0;
}
