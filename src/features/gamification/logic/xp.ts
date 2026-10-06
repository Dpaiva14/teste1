/** XP ranks ("Duolingo-style" progression). Pure & client-safe. */
export interface XpRank {
  rank: number;
  title: string;
  minXp: number;
}

export const XP_RANKS: readonly XpRank[] = [
  { rank: 1, title: "Observador", minXp: 0 },
  { rank: 2, title: "Aprendiz", minXp: 150 },
  { rank: 3, title: "Estudante", minXp: 450 },
  { rank: 4, title: "Praticante", minXp: 1000 },
  { rank: 5, title: "Analista", minXp: 1800 },
  { rank: 6, title: "Executor", minXp: 3000 },
  { rank: 7, title: "Estratega", minXp: 4600 },
  { rank: 8, title: "Gestor de Risco", minXp: 6600 },
  { rank: 9, title: "Profissional", minXp: 9000 },
  { rank: 10, title: "Mestre do Processo", minXp: 12000 },
];

export interface RankProgress {
  current: XpRank;
  next: XpRank | null;
  /** 0..100 progress inside the current rank */
  percent: number;
  xpIntoRank: number;
  xpForNext: number | null;
}

export function rankForXp(xp: number): RankProgress {
  const safe = Math.max(0, Math.floor(xp));
  let current = XP_RANKS[0]!;
  for (const r of XP_RANKS) if (safe >= r.minXp) current = r;
  const next = XP_RANKS.find((r) => r.minXp > current.minXp) ?? null;
  if (!next) return { current, next: null, percent: 100, xpIntoRank: safe - current.minXp, xpForNext: null };
  const span = next.minXp - current.minXp;
  const into = safe - current.minXp;
  return { current, next, percent: Math.min(100, Math.round((into / span) * 100)), xpIntoRank: into, xpForNext: next.minXp - safe };
}

/** XP table. Rewards study, review and patience — never trade volume. */
export const XP = {
  lessonComplete: 20,
  quizPassBase: 10,
  quizPerfectBonus: 10,
  moduleQuizPass: 25,
  moduleComplete: 50,
  levelUnlock: 100,
  exercisePass: 15,
  journalReview: 10,
  backtestDecision: 2,
  finalAssessment: 200,
} as const;

/** Daily caps keep the XP loop from rewarding grinding. */
export const XP_DAILY_CAP: Record<string, number> = {
  BACKTEST_DECISION: 30,
  JOURNAL_REVIEW: 20,
  EXERCISE: 90,
};
