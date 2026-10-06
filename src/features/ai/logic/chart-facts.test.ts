import { describe, expect, it } from "vitest";
import { buildScenarioCandles } from "@/features/scenarios/build";
import { SCENARIOS } from "@/modules/scenarios";
import { computeChartFacts, educationalReading } from "./chart-facts";
import { findOutputViolations } from "./guardrails";

const scenario = (id: string) => buildScenarioCandles(SCENARIOS.find((s) => s.id === id)!);

describe("computeChartFacts", () => {
  // Analysed as it looked right after the last confirmed swing (bar 80 + 3 confirmation bars).
  it("reads the scripted bullish staircase as bullish structure", () => {
    const f = computeChartFacts(scenario("structure-bull-01").slice(0, 84));
    expect(f.structure).toBe("BULLISH");
    expect(f.invalidation.bullish).not.toBeNull();
    expect(f.swings.some((s) => s.label === "HH")).toBe(true);
    expect(f.swings.some((s) => s.label === "HL")).toBe(true);
  });

  it("reads the scripted bearish staircase as bearish structure", () => {
    const f = computeChartFacts(scenario("structure-bear-01").slice(0, 84));
    expect(f.structure).toBe("BEARISH");
    expect(f.invalidation.bearish).not.toBeNull();
  });

  it("reports a compression (LH + HL) instead of forcing a trend on the full series", () => {
    // The bullish staircase ends with a slightly lower high at its last waypoint: the honest reading is mixed.
    const f = computeChartFacts(scenario("structure-bull-01"));
    expect(f.structure).toBe("RANGE");
    expect([f.lastHighLabel, f.lastLowLabel]).toEqual(["LH", "HL"]);
    expect(educationalReading(f, { symbol: "YM", timeframe: "M15" })[0]).toMatch(/comprimir/);
  });

  it("is deterministic and internally consistent", () => {
    const c = scenario("structure-bull-01");
    const a = computeChartFacts(c);
    expect(computeChartFacts(c)).toEqual(a);
    expect(a.rangePosition).toBeGreaterThanOrEqual(0);
    expect(a.rangePosition).toBeLessThanOrEqual(100);
    expect(a.rangeHigh).toBeGreaterThan(a.rangeLow);
    expect(a.levels.length).toBeGreaterThan(0);
    for (const l of a.levels) expect(l.kind).toBe(a.lastClose >= l.price ? "support" : "resistance");
    // levels are ordered nearest-first
    expect(a.levels.map((l) => l.distancePoints)).toEqual([...a.levels.map((l) => l.distancePoints)].sort((x, y) => x - y));
  });

  it("refuses to analyse too little data", () => {
    expect(() => computeChartFacts(scenario("structure-bull-01").slice(0, 10))).toThrow(/20 candles/);
  });
});

describe("educationalReading", () => {
  it("uses probabilistic language and never trips the output guardrails, for every scenario", () => {
    for (const def of SCENARIOS) {
      const text = educationalReading(computeChartFacts(buildScenarioCandles(def)), { symbol: def.symbol, timeframe: def.timeframe }).join("\n");
      expect(findOutputViolations(text), def.id).toEqual([]);
      expect(text).toMatch(/Nada disto é um sinal/);
      expect(text).not.toMatch(/\b(compra|vende)\s+(já|agora)\b/i);
    }
  });

  it("names the invalidation level for a directional structure", () => {
    const f = computeChartFacts(scenario("structure-bull-01").slice(0, 84));
    const text = educationalReading(f, { symbol: "YM", timeframe: "M15" }).join("\n");
    expect(text).toContain(f.invalidation.bullish!.toLocaleString("en-US"));
    expect(text).toMatch(/perderia sentido/);
  });
});
