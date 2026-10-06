import { describe, expect, it } from "vitest";
import { requireScenario } from "@/modules/scenarios";
import { intendedSwings } from "@/features/scenarios/build";
import { checkConfluence, confluenceScore, processQuality, scenarioRewardRisk } from "./confluence";
import { checkFibonacci, extensionLevels, nearestRatio, projectionLevels, ratioLabel, retracementLevels, retracementRatio } from "./fibonacci";
import { checkLevels } from "./levels";
import { checkStructure, type StructureMark } from "./structure";

describe("checkStructure", () => {
  const def = requireScenario("structure-bull-01");
  const perfect: StructureMark[] = intendedSwings(def).filter((s) => s.label).map((s) => ({ index: s.index, label: s.label! }));

  it("perfect answer scores 100", () => {
    const r = checkStructure(def, { marks: perfect, structure: "BULLISH" });
    expect(r.scorePercent).toBe(100);
    expect(r.counts).toMatchObject({ correct: perfect.length, wrongLabel: 0, extra: 0, missed: 0 });
  });
  it("tolerates ±2 candles", () => {
    const shifted = perfect.map((m) => ({ ...m, index: m.index + 2 }));
    expect(checkStructure(def, { marks: shifted, structure: "BULLISH" }).scorePercent).toBe(100);
    const tooFar = perfect.map((m) => ({ ...m, index: m.index + 3 }));
    expect(checkStructure(def, { marks: tooFar, structure: "BULLISH" }).counts.correct).toBe(0);
  });
  it("flags wrong labels with the expected one, extras and misses", () => {
    const marks: StructureMark[] = [{ index: perfect[0]!.index, label: "LH" }, { index: 5, label: "HH" }];
    const r = checkStructure(def, { marks, structure: "BEARISH" });
    expect(r.marks[0]!.status === "wrong-label" || r.marks[0]!.status === "extra").toBe(true);
    expect(r.counts.extra).toBeGreaterThanOrEqual(1);
    expect(r.counts.missed).toBeGreaterThan(0);
    expect(r.structureCorrect).toBe(false);
    expect(r.scorePercent).toBeLessThan(30);
  });
  it("high/low side must match (a 'HL' on a swing high is not a match)", () => {
    const high = perfect.find((m) => m.label === "HH")!;
    const r = checkStructure(def, { marks: [{ index: high.index, label: "HL" }], structure: null });
    expect(r.marks[0]!.status).toBe("extra");
  });
  it("does not double-match one swing", () => {
    const high = perfect.find((m) => m.label === "HH")!;
    const r = checkStructure(def, { marks: [{ index: high.index, label: "HH" }, { index: high.index + 1, label: "HH" }], structure: null });
    expect(r.counts.correct).toBe(1);
    expect(r.counts.extra).toBe(1);
  });
  it("never scores below 0 even with many extras", () => {
    const junk: StructureMark[] = Array.from({ length: 20 }, (_, i) => ({ index: i * 4 + 1, label: "LL" as const }));
    expect(checkStructure(def, { marks: junk, structure: null }).scorePercent).toBeGreaterThanOrEqual(0);
  });
});

describe("checkLevels", () => {
  const def = requireScenario("levels-range-01");
  const [res, sup] = def.levels!.zones;
  it("full marks when zones sit on the solution with correct kinds", () => {
    const r = checkLevels(def, [{ top: res!.top, bottom: res!.bottom, kind: "resistance" }, { top: sup!.top, bottom: sup!.bottom, kind: "support" }], 46);
    expect(r.scorePercent).toBe(100);
  });
  it("kind mix-up costs 30% of that level", () => {
    const r = checkLevels(def, [{ top: res!.top, bottom: res!.bottom, kind: "support" }, { top: sup!.top, bottom: sup!.bottom, kind: "support" }], 46);
    expect(r.scorePercent).toBe(85);
  });
  it("penalises extra zones and huge zones", () => {
    const base = [{ top: res!.top, bottom: res!.bottom, kind: "resistance" as const }, { top: sup!.top, bottom: sup!.bottom, kind: "support" as const }];
    expect(checkLevels(def, [...base, { top: 38450, bottom: 38440, kind: "support" }], 46).scorePercent).toBe(88);
    const huge = checkLevels(def, [{ top: 38700, bottom: 38200, kind: "resistance" }], 46);
    expect(huge.scorePercent).toBeLessThan(50);
  });
  it("zero zones → zero score", () => {
    expect(checkLevels(def, [], 46).scorePercent).toBe(0);
  });
  it("accepts a thin line near the level (zones, not exact lines, but lines are tolerated)", () => {
    const r = checkLevels(def, [{ top: 38606, bottom: 38604, kind: "resistance" }, { top: 38301, bottom: 38299, kind: "support" }], 46);
    expect(r.scorePercent).toBeGreaterThan(90);
  });
});

describe("fibonacci maths", () => {
  it("retracement: ratio 0 = B, 1 = A, 0.5 = midpoint (up and down moves)", () => {
    const up = retracementLevels(37950, 38550, [0, 0.5, 0.618, 1]);
    expect(up.map((l) => Math.round(l.price * 10) / 10)).toEqual([38550, 38250, 38179.2, 37950]);
    const down = retracementLevels(39200, 38600, [0, 0.5, 1]);
    expect(down.map((l) => l.price)).toEqual([38600, 38900, 39200]);
  });
  it("extension from A: ratio 1 = B, 1.272 beyond; projection from C: ratio 1 = AB=CD", () => {
    expect(extensionLevels(37950, 38550, [1, 1.272])[1]!.price).toBeCloseTo(38713.2, 1);
    expect(projectionLevels(37950, 38550, 38180, [1, 1.618])[0]!.price).toBe(38780);
    expect(projectionLevels(37950, 38550, 38180, [1, 1.618])[1]!.price).toBeCloseTo(39150.8, 1);
  });
  it("measures the retracement ratio and the nearest key level", () => {
    expect(retracementRatio(37950, 38550, 38180)).toBeCloseTo(0.6167, 3);
    expect(nearestRatio(0.6167)).toBe(0.618);
    expect(nearestRatio(0.45)).toBe(0.5);
  });
  it("formats ratios", () => {
    expect([0.618, 0.5, 1.272, 0.707, 2.618, 1].map(ratioLabel)).toEqual(["61.8%", "50%", "127.2%", "70.7%", "261.8%", "100%"]);
  });
});

describe("checkFibonacci", () => {
  const def = requireScenario("fib-bull-618");
  const good = { a: { index: 10, price: 37950 }, b: { index: 30, price: 38550 }, pickedRatio: 0.618 };
  it("perfect = 100", () => expect(checkFibonacci(def, good).scorePercent).toBe(100));
  it("swapped anchors lose the anchor points (direction matters)", () => {
    const r = checkFibonacci(def, { ...good, a: good.b, b: good.a });
    expect(r.aCorrect || r.bCorrect).toBe(false);
    expect(r.directionCorrect).toBe(false);
    expect(r.scorePercent).toBe(50);
  });
  it("wrong ratio loses 50", () => expect(checkFibonacci(def, { ...good, pickedRatio: 0.382 }).scorePercent).toBe(50));
  it("the failed-pullback scenario is graded against 78.6%", () => {
    const f = requireScenario("fib-failed-786");
    expect(checkFibonacci(f, { a: { index: 10, price: 37900 }, b: { index: 30, price: 38500 }, pickedRatio: 0.786 }).scorePercent).toBe(100);
  });
});

describe("confluence", () => {
  const strong = requireScenario("conf-strong-long");
  const weak = requireScenario("conf-weak-long");
  const lost = requireScenario("conf-strong-short-loss");

  it("scores = number of ticked factors; duplicates ignored", () => {
    expect(confluenceScore(["trend", "trend", "sr"])).toBe(2);
  });
  it("quality bands", () => {
    expect([8, 6, 5, 4, 3, 0].map(processQuality)).toEqual(["forte", "forte", "média", "média", "fraca", "fraca"]);
  });
  it("identifying every factor correctly and deciding per process = 100", () => {
    const sol = strong.confluence!;
    const selected = Object.entries(sol.factors).filter(([, v]) => v.present).map(([k]) => k) as never[];
    const r = checkConfluence(strong, { selected, decision: "TAKE" });
    expect(r.scorePercent).toBe(100);
    expect(r.trueScore).toBe(7);
  });
  it("process, not outcome: the strong-process loser still recommends TAKE; the weak winner recommends NO_TRADE", () => {
    expect(checkConfluence(lost, { selected: [], decision: "TAKE" }).recommendedDecision).toBe("TAKE");
    expect(checkConfluence(weak, { selected: [], decision: "TAKE" }).recommendedDecision).toBe("NO_TRADE");
    expect(checkConfluence(weak, { selected: [], decision: "NO_TRADE" }).scorePercent).toBe(100);
  });
  it("over-ticking everything on a weak setup is penalised", () => {
    const all = ["trend", "structure", "sr", "supplyDemand", "fibonacci", "priceAction", "liquidity", "riskReward"] as never[];
    const r = checkConfluence(weak, { selected: all, decision: "TAKE" });
    expect(r.scorePercent).toBe(0);
    expect(r.studentScore).toBe(8);
    expect(r.trueScore).toBe(0);
  });
  it("R:R in the data matches the claims in the notes", () => {
    expect(scenarioRewardRisk(strong.confluence!).ratio).toBeCloseTo(1.9, 1);
    expect(scenarioRewardRisk(weak.confluence!).ratio).toBe(0.6);
  });
});

describe("simulateOutcome", () => {
  const sol = { direction: "LONG" as const, entry: 100, stop: 90, target: 120 };
  it("target first / stop first / both in the same bar (stop wins) / still open", async () => {
    const { simulateOutcome } = await import("./confluence");
    expect(simulateOutcome([{ high: 105, low: 98, close: 104 }, { high: 121, low: 103, close: 120 }], sol)).toEqual({ outcome: "TARGET", barsToExit: 2, rMultiple: 2 });
    expect(simulateOutcome([{ high: 105, low: 89, close: 91 }], sol)).toEqual({ outcome: "STOP", barsToExit: 1, rMultiple: -1 });
    expect(simulateOutcome([{ high: 125, low: 85, close: 100 }], sol).outcome).toBe("STOP");
    expect(simulateOutcome([{ high: 105, low: 96, close: 105 }], sol)).toEqual({ outcome: "OPEN", barsToExit: null, rMultiple: 0.5 });
    expect(simulateOutcome([], sol).outcome).toBe("OPEN");
  });
  it("works for shorts", async () => {
    const { simulateOutcome } = await import("./confluence");
    expect(simulateOutcome([{ high: 101, low: 79, close: 80 }], { direction: "SHORT", entry: 100, stop: 110, target: 80 }).outcome).toBe("TARGET");
    expect(simulateOutcome([{ high: 111, low: 99, close: 100 }], { direction: "SHORT", entry: 100, stop: 110, target: 80 }).outcome).toBe("STOP");
  });
});

describe("snapToSwing", () => {
  const mk = (h: number, l: number) => ({ time: 0, open: l, high: h, low: l, close: h, volume: 1 });
  const candles = [mk(5, 1), mk(7, 2), mk(9, 3), mk(8, 2), mk(6, 0), mk(4, -1)];
  it("snaps to the highest high / lowest low in the window", async () => {
    const { snapToSwing } = await import("./snap");
    expect(snapToSwing(candles, 1, "high", 2)).toBe(2);
    expect(snapToSwing(candles, 3, "low", 2)).toBe(5);
    expect(snapToSwing(candles, 3, "low", 1)).toBe(4);
  });
  it("clicks outside the series snap to the nearest edge candle", async () => {
    const { snapToSwing } = await import("./snap");
    expect(snapToSwing(candles, -5, "high", 3)).toBe(0);
    expect(snapToSwing(candles, 99, "low", 3)).toBe(5);
    expect(snapToSwing(candles, -1, "high", 3)).toBe(2); // window [−4, 2] still reaches candle 2
  });
});
