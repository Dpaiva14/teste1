import { describe, expect, it } from "vitest";
import { bestAndWorst, equityFromR, groupPerformance, performanceStats } from "./performance";
import { averageEvaluation, evaluateTrade, gradeOf } from "../../trading/logic/evaluation";

const t = (pnl: number, r: number | null = null) => ({ pnl, r });

describe("performanceStats", () => {
  const trades = [t(200, 2), t(-100, -1), t(-100, -1), t(300, 3), t(-100, -1), t(-100, -1), t(100, 1)];
  const s = performanceStats(trades, { startingBalance: 10000 });
  it("basic counts and rates", () => {
    expect(s).toMatchObject({ trades: 7, wins: 3, losses: 4, breakeven: 0, winRate: 42.9, lossRate: 57.1 });
  });
  it("averages, payoff, expectancy, profit factor", () => {
    expect(s.avgWin).toBe(200);
    expect(s.avgLoss).toBe(-100);
    expect(s.payoff).toBe(2);
    // Hand-computed: +200 −100 −100 +300 −100 −100 +100 = 200; gross win 600, gross loss 400.
    expect(s.totalPnl).toBe(200);
    expect(s.expectancy).toBe(28.57); // 200 / 7
    expect(s.profitFactor).toBe(1.5); // 600 / 400
  });
  it("drawdown is peak-to-trough on the equity curve", () => {
    // equity: 10000 → 10200 → 10100 → 10000 → 10300 (peak) → 10200 → 10100 → 10200
    expect(s.maxDrawdown).toBe(200);
    expect(s.maxDrawdownPercent).toBeCloseTo(1.94, 1);
    expect(s.equityCurve).toEqual([10000, 10200, 10100, 10000, 10300, 10200, 10100, 10200]);
  });
  it("streaks", () => {
    expect(s.maxConsecutiveLosses).toBe(2);
    expect(s.maxConsecutiveWins).toBe(1);
    expect(s.currentStreak).toBe(1);
  });
  it("R metrics", () => {
    expect(s.avgR).toBe(0.29); // (2−1−1+3−1−1+1)/7
    expect(s.maxDrawdownR).toBe(2);
  });
  it("no losses → profit factor null (undefined, not Infinity); empty → zeros", () => {
    expect(performanceStats([t(10), t(20)]).profitFactor).toBeNull();
    const e = performanceStats([]);
    expect(e).toMatchObject({ trades: 0, winRate: 0, expectancy: 0, maxDrawdown: 0, best: 0, worst: 0, avgR: null });
  });
  it("breakeven trades are neither wins nor losses and reset streaks", () => {
    const b = performanceStats([t(10), t(0), t(10)]);
    expect(b.breakeven).toBe(1);
    expect(b.maxConsecutiveWins).toBe(1);
  });
});

describe("grouping", () => {
  const rows = [
    { pnl: 100, r: 1, setup: "Pullback", session: "NY" }, { pnl: 200, r: 2, setup: "Pullback", session: "NY" }, { pnl: -100, r: -1, setup: "Pullback", session: "LONDON" },
    { pnl: -100, r: -1, setup: "Breakout", session: "NY" }, { pnl: -100, r: -1, setup: "Breakout", session: "NY" }, { pnl: 50, r: 0.5, setup: "Breakout", session: "LONDON" },
    { pnl: 500, r: 5, setup: "Rare", session: "ASIAN" },
  ];
  it("groups and ranks, ignoring tiny samples", () => {
    const g = groupPerformance(rows, (x) => x.setup);
    expect(g.map((x) => [x.key, x.trades])).toEqual([["Pullback", 3], ["Breakout", 3], ["Rare", 1]]);
    const bw = bestAndWorst(g, 3)!;
    expect(bw.best.key).toBe("Pullback");
    expect(bw.worst.key).toBe("Breakout");
    expect(bestAndWorst(g, 5)).toBeNull();
  });
  it("skips rows without a key", () => {
    expect(groupPerformance([{ pnl: 1, r: 1, k: null }], (x) => x.k)).toEqual([]);
  });
});

describe("equityFromR", () => {
  it("compounds fixed-fraction risk", () => {
    expect(equityFromR(10000, 1, [2, -1, -1])).toEqual([10000, 10200, 10098, 9997.02]);
  });
});

describe("evaluateTrade (process, not outcome)", () => {
  const great = { hasStop: true, rewardRisk: 2, riskPercent: 1, checklistPercent: 100, prepared: true, entryReason: "SETUP_VALID", exitedBy: "STOP_LOSS" as const };
  it("a well-prepared trade scores 100 EVEN IF it was stopped out", () => {
    expect(evaluateTrade(great).score).toBe(100);
    expect(evaluateTrade({ ...great, exitedBy: "TAKE_PROFIT" }).score).toBe(100);
  });
  it("a sloppy trade scores low even if it would have won", () => {
    const sloppy = evaluateTrade({ hasStop: false, rewardRisk: null, riskPercent: null, checklistPercent: 0, prepared: false, entryReason: "FOMO", exitedBy: "TAKE_PROFIT" });
    expect(sloppy.score).toBe(10);
    expect(sloppy.grade).toBe("fraco");
  });
  it("partial credit: marginal R:R, 2–3% risk, half checklist", () => {
    const e = evaluateTrade({ ...great, rewardRisk: 1.2, riskPercent: 2.5, checklistPercent: 50 });
    expect(e.criteria.find((x) => x.key === "rr")!.earned).toBe(7);
    expect(e.criteria.find((x) => x.key === "risk")!.earned).toBe(7);
    expect(e.criteria.find((x) => x.key === "checklist")!.earned).toBe(7.5);
    expect(e.score).toBe(Math.round(20 + 7 + 7 + 7.5 + 15 + 10 + 10));
  });
  it("manual exits get half credit, emotional entries none", () => {
    expect(evaluateTrade({ ...great, exitedBy: "MANUAL" }).criteria.find((x) => x.key === "exit")!.earned).toBe(5);
    expect(evaluateTrade({ ...great, entryReason: "REVENGE" }).criteria.find((x) => x.key === "reason")!.earned).toBe(0);
  });
  it("grade bands and averaging", () => {
    expect([90, 70, 50, 10].map(gradeOf)).toEqual(["excelente", "bom", "a melhorar", "fraco"]);
    expect(averageEvaluation([])).toBeNull();
    expect(averageEvaluation([evaluateTrade(great), { score: 50, criteria: [], grade: "a melhorar" }])).toBe(75);
  });
});
