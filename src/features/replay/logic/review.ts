import { averageEvaluation, gradeOf, type TradeEvaluation } from "@/features/trading/logic/evaluation";

export interface ReviewTrade {
  id: string;
  evaluation: TradeEvaluation;
  prepared: boolean;
  hasStop: boolean;
  emotional: boolean;
}

export interface ReplayReview {
  trades: number;
  /** average PROCESS score 0..100 (stop, R:R, risk, checklist, preparation, reason, exit) — never the P&L */
  averageScore: number | null;
  grade: ReturnType<typeof gradeOf> | null;
  notes: string[];
}

export function reviewSession(trades: readonly ReviewTrade[]): ReplayReview {
  const avg = averageEvaluation(trades.map((t) => t.evaluation));
  const notes: string[] = [];
  const n = trades.length;
  if (n === 0) {
    notes.push("Ainda não fechaste nenhum trade nesta sessão. Estar fora do mercado também é uma decisão — mas só tens avaliação de processo quando tiveres trades fechados.");
  } else {
    const unprepared = trades.filter((t) => !t.prepared).length;
    const noStop = trades.filter((t) => !t.hasStop).length;
    const emotional = trades.filter((t) => t.emotional).length;
    if (unprepared > 0) notes.push(`${unprepared} de ${n} trade(s) sem nada marcado no gráfico antes da entrada. Marca níveis, zonas ou estrutura primeiro — a entrada deve vir das referências, não o contrário.`);
    if (noStop > 0) notes.push(`${noStop} trade(s) sem stop: o risco não estava limitado.`);
    if (emotional > 0) notes.push(`${emotional} entrada(s) por razão emocional. Repara no que sentias antes de clicar.`);
    if (n < 5) notes.push("Poucos trades para tirar conclusões. A avaliação mede a qualidade do processo em cada trade, não o resultado — um trade ganho com mau processo pontua mal.");
  }
  return { trades: n, averageScore: avg, grade: avg === null ? null : gradeOf(avg), notes };
}
