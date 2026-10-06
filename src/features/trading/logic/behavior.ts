import { mean } from "@/lib/utils";
import { roundTo } from "@/lib/money";

export interface BehaviorTrade {
  entryReason: string | null;
  rMultiple: number | null;
  /** 0..100 share of the pre-trade checklist ticked, null if not recorded */
  checklistPercent: number | null;
  hadStop: boolean;
  rewardRisk: number | null;
}

export interface ReasonStats {
  reason: string;
  trades: number;
  sharePercent: number;
  winRate: number | null;
  avgR: number | null;
}

export interface BehaviorSummary {
  totalTrades: number;
  byReason: ReasonStats[];
  /** share of trades entered for a risky (emotional) reason */
  emotionalSharePercent: number;
  avgChecklistPercent: number | null;
  withStopPercent: number;
  goodRrPercent: number;
  /** average R of trades with a complete checklist vs. an incomplete one (null if either group is empty) */
  avgRComplete: number | null;
  avgRIncomplete: number | null;
  insights: string[];
}

const RISKY = new Set(["FOMO", "REVENGE", "BOREDOM", "FEAR_OF_MISSING_MOVE"]);

export function behaviorSummary(trades: readonly BehaviorTrade[]): BehaviorSummary {
  const total = trades.length;
  const groups = new Map<string, BehaviorTrade[]>();
  for (const t of trades) {
    const k = t.entryReason ?? "UNKNOWN";
    groups.set(k, [...(groups.get(k) ?? []), t]);
  }
  const byReason: ReasonStats[] = [...groups.entries()]
    .map(([reason, list]) => {
      const rs = list.map((t) => t.rMultiple).filter((r): r is number => r !== null);
      return {
        reason,
        trades: list.length,
        sharePercent: total ? roundTo((list.length / total) * 100, 1) : 0,
        winRate: rs.length ? roundTo((rs.filter((r) => r > 0).length / rs.length) * 100, 1) : null,
        avgR: rs.length ? roundTo(mean(rs), 2) : null,
      };
    })
    .sort((a, b) => b.trades - a.trades);

  const emotional = trades.filter((t) => t.entryReason && RISKY.has(t.entryReason)).length;
  const checklist = trades.map((t) => t.checklistPercent).filter((x): x is number => x !== null);
  const rOf = (list: BehaviorTrade[]) => {
    const rs = list.map((t) => t.rMultiple).filter((r): r is number => r !== null);
    return rs.length ? roundTo(mean(rs), 2) : null;
  };
  const complete = trades.filter((t) => t.checklistPercent !== null && t.checklistPercent >= 100);
  const incomplete = trades.filter((t) => t.checklistPercent !== null && t.checklistPercent < 100);

  const summary: BehaviorSummary = {
    totalTrades: total,
    byReason,
    emotionalSharePercent: total ? roundTo((emotional / total) * 100, 1) : 0,
    avgChecklistPercent: checklist.length ? Math.round(mean(checklist)) : null,
    withStopPercent: total ? roundTo((trades.filter((t) => t.hadStop).length / total) * 100, 1) : 0,
    goodRrPercent: total ? roundTo((trades.filter((t) => t.rewardRisk !== null && t.rewardRisk >= 1.5).length / total) * 100, 1) : 0,
    avgRComplete: rOf(complete),
    avgRIncomplete: rOf(incomplete),
    insights: [],
  };

  if (total >= 5) {
    if (summary.emotionalSharePercent >= 30) summary.insights.push(`${summary.emotionalSharePercent}% das tuas entradas tiveram uma razão emocional (FOMO, vingança, tédio ou medo). Esse é o ponto de melhoria com maior retorno.`);
    if (summary.withStopPercent < 100) summary.insights.push(`${roundTo(100 - summary.withStopPercent, 1)}% dos trades não tinham stop definido.`);
    if (summary.goodRrPercent < 50) summary.insights.push(`Só ${summary.goodRrPercent}% dos trades tinham R:R ≥ 1,5.`);
    if (summary.avgRComplete !== null && summary.avgRIncomplete !== null && summary.avgRComplete > summary.avgRIncomplete) {
      summary.insights.push(`Com a checklist completa a tua média foi ${summary.avgRComplete}R; incompleta, ${summary.avgRIncomplete}R. (Amostra pequena — não tires conclusões definitivas.)`);
    }
    if (summary.insights.length === 0) summary.insights.push("Sem alertas comportamentais evidentes nesta amostra. Mantém o registo — a consistência é o que conta.");
  } else {
    summary.insights.push("Regista pelo menos 5 trades para veres estatísticas comportamentais com algum significado.");
  }
  return summary;
}
