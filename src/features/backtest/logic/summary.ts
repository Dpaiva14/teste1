import { performanceStats, type PerformanceStats } from "@/features/stats/logic/performance";
import { roundTo } from "@/lib/money";
import { mean } from "@/lib/utils";

export interface DecisionRecord {
  choice: "BUY" | "SELL" | "WAIT";
  outcome: "WIN" | "LOSS" | "TIMEOUT" | "NO_TRADE";
  barIndex: number;
  exitIndex: number | null;
  pnl: number | null;
  rMultiple: number | null;
  reason: string | null;
  rulesMet: number | null;
  rulesTotal: number | null;
}

export interface GroupStat {
  count: number;
  avgR: number | null;
  winRate: number;
}

export interface BacktestSummary {
  decisions: number;
  trades: number;
  buys: number;
  sells: number;
  waits: number;
  /** share of decisions that were WAIT, % */
  waitRate: number;
  perf: PerformanceStats;
  avgHoldBars: number | null;
  byReason: { reason: string; count: number; avgR: number | null }[];
  /** same rules followed vs not — compare PROCESS with RESULT, never just the result */
  adherence: { full: GroupStat; partial: GroupStat; unrecorded: number };
  notes: string[];
}

const group = (rows: readonly DecisionRecord[]): GroupStat => {
  const rs = rows.map((r) => r.rMultiple).filter((r): r is number => r !== null);
  const wins = rows.filter((r) => (r.pnl ?? 0) > 0).length;
  return { count: rows.length, avgR: rs.length ? roundTo(mean(rs), 2) : null, winRate: rows.length ? roundTo((wins / rows.length) * 100, 1) : 0 };
};

export function summarizeBacktest(decisions: readonly DecisionRecord[], startingBalance: number): BacktestSummary {
  const taken = decisions.filter((d) => d.choice !== "WAIT" && d.pnl !== null);
  const waits = decisions.filter((d) => d.choice === "WAIT").length;
  const perf = performanceStats(taken.map((d) => ({ pnl: d.pnl ?? 0, r: d.rMultiple })), { startingBalance });

  const holds = taken.filter((d) => d.exitIndex !== null).map((d) => d.exitIndex! - d.barIndex);
  const reasons = new Map<string, DecisionRecord[]>();
  for (const d of taken) reasons.set(d.reason ?? "—", [...(reasons.get(d.reason ?? "—") ?? []), d]);

  const withRules = taken.filter((d) => d.rulesTotal !== null && d.rulesTotal > 0);
  const full = withRules.filter((d) => d.rulesMet === d.rulesTotal);
  const partial = withRules.filter((d) => d.rulesMet !== d.rulesTotal);

  const waitRate = decisions.length ? roundTo((waits / decisions.length) * 100, 1) : 0;
  const notes: string[] = [];
  if (taken.length > 0 && taken.length < 30) notes.push(`Amostra de ${taken.length} trade(s): demasiado pequena para concluir se existe vantagem. Estas estatísticas são ruído até haver bem mais de 30 trades — e mesmo assim em dados sintéticos.`);
  if (decisions.length >= 10 && waitRate < 15) notes.push("Quase todas as decisões foram entradas. Um processo seletivo costuma esperar mais do que entra — rever se estás a forçar trades.");
  const emotional = taken.filter((d) => d.reason && d.reason !== "SETUP_VALID" && d.reason !== "OTHER").length;
  if (emotional > 0) notes.push(`${emotional} entrada(s) por razão emocional (FOMO, vingança, tédio ou medo). Compara o R médio dessas entradas com o das entradas por setup válido.`);
  if (full.length >= 5 && partial.length >= 5) {
    const f = group(full).avgR;
    const p = group(partial).avgR;
    if (f !== null && p !== null && f < p) notes.push("Neste conjunto, as entradas com regras incompletas renderam mais do que as completas. Com amostras pequenas isto é variância: um resultado bom de um processo mau não valida o processo.");
  }

  return {
    decisions: decisions.length,
    trades: taken.length,
    buys: decisions.filter((d) => d.choice === "BUY").length,
    sells: decisions.filter((d) => d.choice === "SELL").length,
    waits,
    waitRate,
    perf,
    avgHoldBars: holds.length ? Math.round(mean(holds)) : null,
    byReason: [...reasons.entries()].map(([reason, rows]) => ({ reason, count: rows.length, avgR: group(rows).avgR })).sort((a, b) => b.count - a.count),
    adherence: { full: group(full), partial: group(partial), unrecorded: taken.length - withRules.length },
    notes,
  };
}
