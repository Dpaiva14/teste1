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

      it("keeps intended swings detectable as clean fractals", () => {
        const intended = intendedSwings(def);
        const lastIdx = intended[intended.length - 1]!.index;
        const found = detectedSwings(candles).filter((s) => s.index <= lastIdx);
        expect(found.map((s) => `${s.type}@${s.index}`)).toEqual(intended.map((s) => `${s.type}@${s.index}`));
      });

      if (def.structure) {
        it("expected structure classification matches the swing labels", () => {
          expect(classifyStructure(intendedSwings(def))).toBe(def.structure!.answer);
        });
      }
    });
  }
});
