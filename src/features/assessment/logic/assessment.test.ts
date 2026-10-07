import { describe, expect, it } from "vitest";
import { generateCandles } from "@/lib/market-data/demo-generator";
import type { Candle } from "@/lib/market-data/types";
import { MAX_DECISION_INDEX, MIN_DECISION_INDEX, TOTAL_BARS, answersSchema, completenessProblems, STEP_KEYS, type Answers } from "../schemas";
import { analyzeChart, pickDecisionIndex, type AssessmentFacts } from "./analysis";
import { MAX_SCORE, evaluateAssessment, planMetrics } from "./evaluate";
import { revealOutcome } from "./outcome";

/** Hand-built facts: a clear uptrend with a repeated level, a demand zone, a liquidity pool and a 10-ATR impulse. */
const facts: AssessmentFacts = {
  atr: 30,
  lastClose: 39000,
  lastIndex: 299,
  driftAtr: 8,
  efficiency: 0.3,
  trendByDrift: "UP",
  trendByStructure: "UP",
  acceptableTrends: ["UP"],
  structure: "BULLISH",
  lastHighLabel: "HH",
  lastLowLabel: "HL",
  swings: [
    { index: 200, type: "low", price: 38800, label: "HL" },
    { index: 230, type: "high", price: 39100, label: "HH" },
    { index: 260, type: "low", price: 38925, label: "HL" },
    { index: 285, type: "high", price: 39060, label: "LH" },
  ],
  levels: [
    { price: 38950, touches: 3 },
    { price: 39100, touches: 2 },
  ],
  pools: [{ side: "low", price: 38935, touches: 2 }],
  zones: [{ role: "demand", top: 38975, bottom: 38930, index: 260, departureAtr: 3 }],
  legs: [{ a: { index: 200, price: 38800 }, b: { index: 230, price: 39100 }, direction: "up", sizeAtr: 10 }],
  lastCandle: { direction: "bullish", bodyAtr: 0.5, upperWickPct: 10, lowerWickPct: 55 },
};

const ideal = (over: Partial<Answers> = {}): Answers =>
  answersSchema.parse({
    trend: "UP",
    structure: "BULLISH",
    sr: [
      { id: "a1", price: 38950 },
      { id: "a2", price: 39100 },
    ],
    zones: [{ id: "z1", role: "demand", top: 38975, bottom: 38935, fromIndex: 250 }],
    fib: { from: { index: 200, price: 38800 }, to: { index: 230, price: 39100 } },
    confluence: ["trend", "structure", "sr", "supplyDemand", "fibonacci", "priceAction", "liquidity", "riskReward"],
    liquidity: { levels: [{ id: "l1", price: 38935 }], none: false },
    direction: "LONG",
    entry: 38960,
    stop: 38905,
    target: 39100,
    contracts: 3,
    decision: "TAKE",
    entryReason: "SETUP_VALID",
    reason: "Tendência de alta com HH/HL; recuo à zona de procura e ao nível 38.950, com Fibonacci 38,2–78,6% e liquidez varrida.",
    invalidation: "Fecho abaixo de 38.905 (swing low) invalida a tese.",
    done: [...STEP_KEYS],
    ...over,
  });

const crit = (a: Answers, key: string) => evaluateAssessment(a, facts).criteria.find((c) => c.step === key)!;

describe("assessment evaluation (12 criteria, 100 points)", () => {
  it("sums to 100 and a fully coherent process gets the maximum", () => {
    expect(MAX_SCORE).toBe(100);
    const ev = evaluateAssessment(ideal(), facts);
    expect(ev.criteria).toHaveLength(12);
    expect(ev.score).toBe(100);
    expect(ev.grade).toBe("excelente");
    expect(ev.supportedCount).toBe(8);
    expect(ev.plan).toMatchObject({ valid: true, maxContracts: 3, rewardRisk: 2.55 });
  });

  it("a lazy but complete submission fails (below 50)", () => {
    const lazy = answersSchema.parse({
      trend: "RANGE", structure: "RANGE", liquidity: { levels: [], none: true }, direction: "LONG", entry: 39000, stop: 38999, target: 39001, contracts: 1,
      decision: "TAKE", entryReason: "FOMO", reason: "Parecia bom, comprei.", invalidation: "Se cair", done: [...STEP_KEYS],
    });
    const ev = evaluateAssessment(lazy, facts);
    expect(ev.score).toBeLessThan(50);
    expect(ev.grade).toBe("fraco");
  });

  it("position size: exactly the computed size is perfect, one more contract earns 0, 0 contracts is only acceptable when none fits", () => {
    expect(planMetrics(ideal())).toMatchObject({ maxContracts: 3, riskPerContract: 27.5, studentRiskUsd: 82.5, studentRiskPercent: 0.83 });
    expect(crit(ideal({ contracts: 3 }), "size").earned).toBe(10);
    expect(crit(ideal({ contracts: 4 }), "size").earned).toBe(0);
    expect(crit(ideal({ contracts: 4 }), "size").comment).toContain("acima do risco definido");
    expect(crit(ideal({ contracts: 2 }), "size").earned).toBe(7);
    expect(crit(ideal({ contracts: 1 }), "size").earned).toBe(4);
    // a stop of 250 points risks $125 per MYM, above the $100 budget: no whole size fits, 0 is the right answer
    const wide = ideal({ stop: 38710, contracts: 0 });
    expect(planMetrics(wide).maxContracts).toBe(0);
    expect(crit(wide, "size").earned).toBe(10);
    expect(crit({ ...wide, contracts: 1 }, "size").earned).toBe(0);
  });

  it("an invalid plan (stop on the wrong side) zeroes stop, target and size instead of crashing", () => {
    const bad = ideal({ stop: 39020 });
    const ev = evaluateAssessment(bad, facts);
    expect(ev.plan.valid).toBe(false);
    for (const k of ["stop", "target", "size"]) expect(ev.criteria.find((c) => c.step === k)!.earned).toBe(0);
    expect(ev.notes.join(" ")).toContain("erro de coerência");
  });

  it("stop inside the structure scores less than a stop beyond the invalidation swing", () => {
    expect(crit(ideal({ stop: 38905 }), "stop").earned).toBe(10);
    expect(crit(ideal({ stop: 38945 }), "stop").earned).toBeLessThan(10);
    expect(crit(ideal({ stop: 38959 }), "stop").earned).toBeLessThan(crit(ideal({ stop: 38905 }), "stop").earned);
  });

  it("targets: R:R below 1.5 and obstacles lower the score", () => {
    expect(crit(ideal({ target: 39100 }), "target").earned).toBe(8);
    expect(crit(ideal({ target: 38990 }), "target").earned).toBeLessThan(8); // R:R 0.55
    expect(crit(ideal({ target: 39200 }), "target").comment).toContain("nível a meio do caminho");
  });

  it("confluence rewards honesty: claiming unsupported factors or missing supported ones costs points", () => {
    expect(crit(ideal(), "confluence").earned).toBe(10);
    const none = crit(ideal({ confluence: [] }), "confluence");
    expect(none.earned).toBe(0);
    expect(none.comment).toContain("Presentes e não marcados");
    // counter-trend short claiming trend + structure: both unsupported
    const short = ideal({ direction: "SHORT", entry: 39000, stop: 39060, target: 38900, confluence: ["trend", "structure"] });
    const c = crit(short, "confluence");
    expect(evaluateAssessment(short, facts).factors.trend.ok).toBe(false);
    expect(c.comment).toContain("Marcados sem suporte");
  });

  it("trend/structure: any acceptable reading earns full points, a contrary one earns none", () => {
    expect(crit(ideal({ trend: "UP" }), "trend").earned).toBe(8);
    expect(crit(ideal({ trend: "DOWN" }), "trend").earned).toBe(0);
    expect(crit(ideal({ trend: "RANGE" }), "trend").earned).toBe(3);
    expect(crit(ideal({ structure: "BEARISH" }), "structure").earned).toBe(0);
    expect(crit(ideal({ structure: "RANGE" }), "structure").earned).toBe(2);
    // ambiguous chart: structure says range, drift says up → both UP and RANGE are accepted
    const amb: AssessmentFacts = { ...facts, structure: "RANGE", trendByStructure: "RANGE", acceptableTrends: ["UP", "RANGE"], lastHighLabel: "LH", lastLowLabel: "HL" };
    expect(evaluateAssessment(ideal({ trend: "RANGE" }), amb).criteria[0]!.earned).toBe(8);
    expect(evaluateAssessment(ideal({ structure: "BULLISH" }), amb).criteria[1]!.earned).toBe(4);
  });

  it("marks must be anchored in the chart: floating levels, zones and Fibonacci earn little", () => {
    expect(crit(ideal({ sr: [{ id: "a", price: 38500 }] }), "sr").earned).toBeLessThan(3);
    expect(crit(ideal({ sr: [] }), "sr").earned).toBe(0);
    expect(crit(ideal({ zones: [{ id: "z", role: "supply", top: 38975, bottom: 38935, fromIndex: 250 }] }), "supplyDemand").earned).toBeLessThan(3);
    expect(crit(ideal({ zones: [] }), "supplyDemand").earned).toBe(0);
    expect(crit(ideal({ fib: { from: { index: 210, price: 38860 }, to: { index: 240, price: 39040 } } }), "fibonacci").earned).toBeLessThan(3);
    expect(crit(ideal({ fib: null }), "fibonacci").earned).toBe(0);
    expect(crit(ideal({ liquidity: { levels: [], none: true } }), "liquidity").earned).toBe(2);
    expect(crit(ideal({ liquidity: { levels: [{ id: "l", price: 39500 }], none: false } }), "liquidity").earned).toBeLessThan(2);
  });

  it("reason: empty invalidation and emotional entry reasons lose points; WAIT is coherent when the process is weak", () => {
    expect(crit(ideal(), "reason").earned).toBe(9);
    expect(crit(ideal({ invalidation: "" }), "reason").earned).toBe(6);
    expect(crit(ideal({ entryReason: "FOMO" }), "reason").earned).toBe(7);
    // weak plan (R:R < 1.5, few supported factors): taking it is incoherent, waiting is coherent
    const weakTake = ideal({ target: 38980, confluence: [], decision: "TAKE" });
    const weakWait = ideal({ target: 38980, confluence: [], decision: "WAIT" });
    expect(crit(weakWait, "reason").earned - crit(weakTake, "reason").earned).toBe(1);
  });
});

const bar = (open: number, high: number, low: number, close: number): Candle => ({ time: 0, open, high, low, close, volume: 1 });

describe("the outcome never changes the score", () => {
  it("the same process earns the same grade whether the market then hits the target or the stop", () => {
    const a = ideal({ entry: 38960, stop: 38905, target: 39100, contracts: 3 });
    const score = evaluateAssessment(a, facts).score;
    const winFuture = [bar(38965, 38970, 38955, 38960), bar(38960, 39110, 38958, 39105)];
    const lossFuture = [bar(38965, 38970, 38955, 38960), bar(38960, 38962, 38890, 38895)];
    const win = revealOutcome(a, winFuture, 300);
    const loss = revealOutcome(a, lossFuture, 300);
    expect(win.status).toBe("TARGET");
    expect(loss.status).toBe("STOP");
    expect(win.pnl).toBeGreaterThan(0);
    expect(loss.pnl).toBeLessThan(0);
    // evaluateAssessment only receives the answers and the facts of the visible chart: nothing about the future
    expect(evaluateAssessment.length).toBe(2);
    expect(evaluateAssessment(a, facts).score).toBe(score);
    expect(score).toBe(100);
  });
  it("a poorly prepared trade that happens to win is still graded as weak", () => {
    const sloppy = ideal({ sr: [], zones: [], fib: null, confluence: [], liquidity: { levels: [], none: true }, entryReason: "FOMO", reason: "Vai subir.", invalidation: "", trend: "DOWN", structure: "BEARISH" });
    const win = revealOutcome(sloppy, [bar(38965, 38970, 38955, 38960), bar(38960, 39110, 38958, 39105)], 300);
    expect(win.status).toBe("TARGET");
    expect(evaluateAssessment(sloppy, facts).score).toBeLessThan(50);
  });
});


describe("outcome reveal (information only)", () => {
  const long = ideal({ entry: 39000, stop: 38960, target: 39080, contracts: 5 }); // 40-pt stop, 2R
  it("not filled when price never reaches the entry", () => {
    const r = revealOutcome(long, [bar(39100, 39120, 39050, 39090), bar(39090, 39130, 39060, 39100)], 300);
    expect(r.status).toBe("NOT_FILLED");
    expect(r.pnl).toBeNull();
  });
  it("target after the fill: +2R and +$200 with 5 MYM (no costs)", () => {
    const r = revealOutcome(long, [bar(39010, 39020, 38995, 39005), bar(39005, 39050, 39000, 39040), bar(39040, 39090, 39030, 39085)], 300);
    expect(r).toMatchObject({ status: "TARGET", fillIndex: 300, exitIndex: 302, points: 80, r: 2, pnl: 200, hypothetical: false });
  });
  it("stop after the fill: −1R and −$100", () => {
    const r = revealOutcome(long, [bar(39010, 39020, 38995, 39005), bar(39005, 39010, 38950, 38955)], 300);
    expect(r).toMatchObject({ status: "STOP", points: -40, r: -1, pnl: -100 });
  });
  it("worst case on the fill bar: if the same bar also touches the stop, the stop wins", () => {
    const r = revealOutcome(long, [bar(39010, 39090, 38950, 39000)], 300);
    expect(r.status).toBe("STOP");
    expect(r.note).toContain("pior caso");
  });
  it("a gap through the stop fills at the open, worse than the stop", () => {
    const r = revealOutcome(long, [bar(39010, 39020, 38995, 39005), bar(38930, 38940, 38900, 38910)], 300);
    expect(r).toMatchObject({ status: "STOP", exitPrice: 38930, points: -70 });
    expect(r.note).toContain("gap");
  });
  it("neither level reached: marked to the last close; WAIT decisions are hypothetical; invalid plans are explained", () => {
    const flat = [bar(39010, 39020, 38995, 39005), bar(39005, 39030, 39000, 39020)];
    expect(revealOutcome(long, flat, 300)).toMatchObject({ status: "OPEN_AT_END", points: 20, exitPrice: 39020 });
    expect(revealOutcome({ ...long, decision: "WAIT" }, flat, 300).hypothetical).toBe(true);
    expect(revealOutcome(ideal({ stop: 39100 }), flat, 300).status).toBe("INVALID");
  });
  it("shorts mirror longs", () => {
    const short = ideal({ direction: "SHORT", entry: 39000, stop: 39040, target: 38920, contracts: 5 });
    const r = revealOutcome(short, [bar(38990, 39005, 38980, 38985), bar(38985, 38990, 38915, 38925)], 300);
    expect(r).toMatchObject({ status: "TARGET", points: 80, r: 2, pnl: 200 });
  });
});

describe("chart analysis on generated DEMO series", () => {
  const series = (seed: number) => generateCandles({ seed, startPrice: 39000, timeframe: "M15", startTime: 1_736_000_000, count: TOTAL_BARS, tickSize: 1, bias: "mixed" });
  it("is deterministic and produces usable references", () => {
    const s = series(7919);
    const a = analyzeChart(s.slice(0, 320));
    const b = analyzeChart(s.slice(0, 320));
    expect(a).toEqual(b);
    expect(a.atr).toBeGreaterThan(0);
    expect(a.swings.length).toBeGreaterThan(3);
    expect(a.lastIndex).toBe(319);
    for (const z of a.zones) expect(z.top).toBeGreaterThan(z.bottom);
  });
  it("picks a decision point inside the allowed window, deterministically, with a readable context", () => {
    for (const seed of [1, 99, 123_456, 2_000_000_011]) {
      const s = series(seed);
      const i = pickDecisionIndex(s, seed, MIN_DECISION_INDEX, MAX_DECISION_INDEX);
      expect(i).toBeGreaterThanOrEqual(MIN_DECISION_INDEX);
      expect(i).toBeLessThan(MAX_DECISION_INDEX + 1);
      expect(pickDecisionIndex(s, seed, MIN_DECISION_INDEX, MAX_DECISION_INDEX)).toBe(i);
      expect(analyzeChart(s.slice(0, i)).structure).not.toBe("RANGE");
    }
  });
  it("evaluating a plausible answer set never throws and always lands in 0..100", () => {
    for (const seed of [3, 5, 8, 13]) {
      const s = series(seed);
      const i = pickDecisionIndex(s, seed, MIN_DECISION_INDEX, MAX_DECISION_INDEX);
      const f = analyzeChart(s.slice(0, i));
      const entry = f.lastClose;
      const long = f.acceptableTrends.includes("UP");
      const a = ideal({ entry, stop: long ? entry - f.atr * 1.5 : entry + f.atr * 1.5, target: long ? entry + f.atr * 3 : entry - f.atr * 3, direction: long ? "LONG" : "SHORT" });
      const ev = evaluateAssessment(a, f);
      expect(ev.score).toBeGreaterThanOrEqual(0);
      expect(ev.score).toBeLessThanOrEqual(100);
      expect(ev.criteria.every((c) => c.earned >= 0 && c.earned <= c.max)).toBe(true);
    }
  });
});

describe("completeness", () => {
  it("lists what is missing and accepts a finished set", () => {
    expect(completenessProblems(answersSchema.parse({})).length).toBeGreaterThan(10);
    expect(completenessProblems(ideal())).toEqual([]);
    expect(completenessProblems(ideal({ done: ["trend"] })).some((p) => p.includes("por confirmar"))).toBe(true);
    expect(completenessProblems(ideal({ invalidation: "" }))).toContain("Escreve o que invalida a tua tese.");
  });
  it("the answers schema rejects absurd values", () => {
    expect(answersSchema.safeParse({ entry: -5 }).success).toBe(false);
    expect(answersSchema.safeParse({ contracts: 1.5 }).success).toBe(false);
    expect(answersSchema.safeParse({ sr: Array.from({ length: 9 }, (_, i) => ({ id: `a${i}`, price: 39000 })) }).success).toBe(false);
    expect(answersSchema.safeParse({ reason: "x".repeat(1300) }).success).toBe(false);
  });
});
