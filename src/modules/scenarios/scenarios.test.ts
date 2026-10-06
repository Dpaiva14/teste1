import { describe, expect, it } from "vitest";
import { buildScenarioCandles, detectedSwings, intendedSwings } from "@/features/scenarios/build";
import { classifyStructure } from "@/lib/market-data/indicators";
import { SCENARIOS } from "./index";

describe("scenario catalogue", () => {
  it("has unique ids", () => {
    const ids = SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const def of SCENARIOS) {
    describe(def.id, () => {
      const candles = buildScenarioCandles(def);

      it("generates valid, deterministic candles", () => {
        expect(candles.length).toBeGreaterThan(20);
        expect(candles.every((c) => c.high >= Math.max(c.open, c.close) && c.low <= Math.min(c.open, c.close))).toBe(true);
        expect(buildScenarioCandles(def)).toEqual(candles);
      });

      // Only structure exercises promise clean fractals: confluence scenarios contain deliberate liquidity sweeps.
      if (def.structure) {
        it("keeps intended swings detectable as clean fractals", () => {
          const intended = intendedSwings(def);
          const lastIdx = intended[intended.length - 1]!.index;
          const found = detectedSwings(candles).filter((s) => s.index <= lastIdx);
          expect(found.map((s) => `${s.type}@${s.index}`)).toEqual(intended.map((s) => `${s.type}@${s.index}`));
        });
      }

      if (def.structure) {
        it("expected structure classification matches the swing labels", () => {
          expect(classifyStructure(intendedSwings(def))).toBe(def.structure!.answer);
        });
      }
    });
  }
});

describe("level scenarios", () => {
  for (const def of SCENARIOS.filter((s) => s.levels)) {
    it(`${def.id}: every solution zone is backed by at least 'touches' waypoints inside it`, () => {
      for (const z of def.levels!.zones) {
        const inside = def.points.filter((p) => p.price >= z.bottom && p.price <= z.top).length;
        expect(inside).toBeGreaterThanOrEqual(Math.min(z.touches, 3));
        expect(z.top).toBeGreaterThan(z.bottom);
      }
    });
  }
});

describe("fibonacci scenarios", () => {
  for (const def of SCENARIOS.filter((s) => s.fib)) {
    it(`${def.id}: A/B/C match the waypoints and the stated ratio`, () => {
      const f = def.fib!;
      for (const k of ["a", "b", "c"] as const) {
        const pt = f[k];
        if (!pt) continue;
        expect(def.points.some((p) => p.at === pt.at && p.price === pt.price)).toBe(true);
      }
      const ratio = (f.b.price - f.c!.price) / (f.b.price - f.a.price);
      expect(Math.abs(ratio - f.pullbackRatio)).toBeLessThan(0.02);
      expect((f.b.price > f.a.price) === (f.direction === "up")).toBe(true);
    });
  }
});

describe("confluence scenarios", () => {
  for (const def of SCENARIOS.filter((s) => s.confluence)) {
    const sol = def.confluence!;
    const candles = buildScenarioCandles(def);
    it(`${def.id}: geometry is valid and entry = close of the decision candle`, () => {
      expect(candles.length).toBeGreaterThan(sol.decisionIndex + 5);
      expect(sol.entry).toBe(candles[sol.decisionIndex]!.close);
      if (sol.direction === "LONG") expect(sol.stop < sol.entry && sol.entry < sol.target).toBe(true);
      else expect(sol.stop > sol.entry && sol.entry > sol.target).toBe(true);
    });
    it(`${def.id}: riskReward factor agrees with the numbers (threshold 1.5)`, () => {
      const rr = Math.abs(sol.target - sol.entry) / Math.abs(sol.entry - sol.stop);
      expect(sol.factors.riskReward.present).toBe(rr >= 1.5);
    });
  }
  it("the decision candle of the strong scenarios is an engulfing in the trade direction", () => {
    for (const id of ["conf-strong-long", "conf-strong-short-loss"]) {
      const def = SCENARIOS.find((s) => s.id === id)!;
      const c = buildScenarioCandles(def);
      const k = def.confluence!.decisionIndex;
      const prev = c[k - 1]!;
      const cur = c[k]!;
      const bull = def.confluence!.direction === "LONG";
      expect(bull ? cur.close > cur.open : cur.close < cur.open).toBe(true);
      expect(Math.min(cur.open, cur.close)).toBeLessThanOrEqual(Math.min(prev.open, prev.close));
      expect(Math.max(cur.open, cur.close)).toBeGreaterThanOrEqual(Math.max(prev.open, prev.close));
    }
  });
  it("the factor counts match the titles (7/8, 0/8, 7/8)", () => {
    const count = (id: string) => Object.values(SCENARIOS.find((s) => s.id === id)!.confluence!.factors).filter((f) => f.present).length;
    expect([count("conf-strong-long"), count("conf-weak-long"), count("conf-strong-short-loss")]).toEqual([7, 0, 7]);
  });
});
