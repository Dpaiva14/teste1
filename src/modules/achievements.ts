export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  category: "Aprendizagem" | "Prática" | "Disciplina" | "Domínio";
  xpReward: number;
}

/**
 * None of these reward trade volume or profit. They reward study, practice quality, patience and review.
 * Criteria are evaluated in features/gamification/server/gamification-service.ts.
 */
export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { key: "first-lesson", title: "Primeiro passo", description: "Conclui a tua primeira aula.", icon: "Footprints", category: "Aprendizagem", xpReward: 10 },
  { key: "first-10-lessons", title: "First 10 Lessons", description: "Conclui 10 aulas.", icon: "BookOpenCheck", category: "Aprendizagem", xpReward: 50 },
  { key: "fifty-lessons", title: "Estudante dedicado", description: "Conclui 50 aulas.", icon: "Library", category: "Aprendizagem", xpReward: 150 },
  { key: "perfect-quiz", title: "Quiz perfeito", description: "Obtém 100% num quiz.", icon: "Medal", category: "Aprendizagem", xpReward: 20 },
  { key: "streak-7", title: "Semana consistente", description: "7 dias consecutivos de aprendizagem.", icon: "Flame", category: "Disciplina", xpReward: 40 },
  { key: "streak-30", title: "Hábito formado", description: "30 dias consecutivos de aprendizagem.", icon: "Flame", category: "Disciplina", xpReward: 200 },
  { key: "market-structure-master", title: "Market Structure Master", description: "Conclui o módulo Market Structure e acerta (≥80%) em 3 exercícios de estrutura.", icon: "ChartCandlestick", category: "Domínio", xpReward: 120 },
  { key: "fibonacci-apprentice", title: "Fibonacci Apprentice", description: "Conclui o módulo Fibonacci e acerta (≥80%) em 2 exercícios do Fibonacci Lab.", icon: "Percent", category: "Domínio", xpReward: 100 },
  { key: "confluence-student", title: "Confluence Student", description: "Conclui o módulo Confluence e acerta (≥80%) em 3 exercícios do Confluence Lab.", icon: "Layers", category: "Domínio", xpReward: 120 },
  { key: "risk-manager", title: "Risk Manager", description: "Conclui o módulo Risk Management e passa no quiz do módulo.", icon: "ShieldCheck", category: "Domínio", xpReward: 150 },
  { key: "backtests-100", title: "100 Backtests", description: "Regista 100 decisões no Backtesting Lab (WAIT conta como decisão).", icon: "Gauge", category: "Prática", xpReward: 100 },
  { key: "patience-25", title: "A arte de esperar", description: "Escolhe WAIT 25 vezes no Backtesting Lab. Não negociar também é uma decisão.", icon: "Hourglass", category: "Disciplina", xpReward: 60 },
  { key: "journal-30-days", title: "30-Day Journal", description: "Regista o journal em 30 dias diferentes.", icon: "NotebookPen", category: "Disciplina", xpReward: 150 },
  { key: "process-over-outcome", title: "Processo > resultado", description: "Avalia o processo (1–5) em 10 entradas de journal.", icon: "Scale", category: "Disciplina", xpReward: 80 },
  { key: "level-5", title: "US30 / Futures", description: "Desbloqueia o nível 5.", icon: "Landmark", category: "Aprendizagem", xpReward: 100 },
  { key: "level-10", title: "Professional Development", description: "Desbloqueia o nível 10.", icon: "Trophy", category: "Aprendizagem", xpReward: 250 },
  { key: "final-assessment", title: "Avaliação final concluída", description: "Completa a avaliação final com processo ≥ 70/100.", icon: "GraduationCap", category: "Domínio", xpReward: 300 },
];

export function getAchievement(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
