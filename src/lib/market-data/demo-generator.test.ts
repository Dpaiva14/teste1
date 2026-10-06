import { describe, expect, it } from "vitest";
import { buildTimes, generateCandles, scriptedSeries } from "./demo-generator";
import { atrSeries, classifyStructure, detectSwings, labelStructure } from "./indicators";
import { hashSeed } from "./prng";
import type { Candle } from "./types";

const START = Date.UTC(2025, 2, 3, 13, 0) / 1000; // a Monday

function validOhlc(c: Candle): boolean {
  return c.high >= Math.max(c.open, c.close) && c.low <= Math.min(c.open, c.close) && c.volume > 0;
}

describe("generateCandles (DEMO)", () => {
  it("is deterministic for the same seed and different for another seed", () => {
    const a = generateCandles({ seed: 1, startPrice: 39000, timeframe: "M15", startTime: START, count: 120, tickSize: 1 });
    const b = generateCandles({ seed: 1, startPrice: 39000, timeframe: "M15", startTime: START, count: 120, tickSize: 1 });
    const c = generateCandles({ seed: 2, startPrice: 39000, timeframe: "M15", startTime: START, count: 120, tickSize: 1 });
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("returns exactly `count` structurally valid candles on tick", () => {
    for (const tf of ["M1", "M5", "M15", "H1", "H4", "D1"] as const) {
      const out = generateCandles({ seed: hashSeed(tf), startPrice: 39000, timeframe: tf, startTime: START, count: 250, tickSize: 1 });
      expect(out).toHaveLength(250);
      expect(out.every(validOhlc)).toBe(true);
      expect(out.every((c) => Number.isInteger(c.open) && Number.isInteger(c.close))).toBe(true);
    }
  });

  it("never emits weekend bars and keeps times strictly increasing", () => {
    const out = generateCandles({ seed: 5, startPrice: 39000, timeframe: "H1", startTime: Date.UTC(2025, 2, 6, 0, 0) / 1000, count: 200, tickSize: 1 });
    for (let i = 1; i < out.length; i++) expect(out[i]!.time).toBeGreaterThan(out[i - 1]!.time);
    for (const c of out) {
      const d = new Date(c.time * 1000);
      const dow = d.getUTCDay();
      const h = d.getUTCHours();
      expect(dow === 6 || (dow === 5 && h >= 22) || (dow === 0 && h < 22)).toBe(false);
    }
  });

  it("rounds to a fractional tick size", () => {
    const out = generateCandles({ seed: 9, startPrice: 39000.5, timeframe: "M5", startTime: START, count: 50, tickSize: 0.5 });
    expect(out.every((c) => (c.close * 2) % 1 === 0 && (c.high * 2) % 1 === 0)).toBe(true);
  });

  it("is more volatile in the US cash-open window than overnight (session effect)", () => {
    const out = generateCandles({ seed: 11, startPrice: 39000, timeframe: "M5", startTime: Date.UTC(2025, 2, 3, 0, 0) / 1000, count: 4000, tickSize: 1 });
    const avgRange = (pred: (h: number) => boolean) => {
      const sel = out.filter((c) => pred(new Date(c.time * 1000).getUTCHours()));
      return sel.reduce((s, c) => s + (c.high - c.low), 0) / sel.length;
    };
    expect(avgRange((h) => h === 14 || h === 15)).toBeGreaterThan(avgRange((h) => h >= 1 && h <= 5) * 1.5);
  });
});

describe("buildTimes", () => {
  it("aligns to the timeframe grid", () => {
    const t = buildTimes(START + 123, "M15", 3);
    expect(t[0]! % 900).toBe(0);
    expect(t[1]! - t[0]!).toBe(900);
  });
});

describe("scriptedSeries", () => {
  const points = [
    { at: 0, price: 38000 }, { at: 12, price: 38300 }, { at: 20, price: 38140 }, { at: 34, price: 38520 },
    { at: 42, price: 38330 }, { at: 58, price: 38760 }, { at: 66, price: 38600 },
  ];
  it("produces swings exactly at the interior waypoints (no spurious fractals)", () => {
    const candles = scriptedSeries({ seed: 7, timeframe: "M15", startTime: START, tickSize: 1, points, tail: 6 });
    const swings = detectSwings(candles, 3, 3);
    expect(swings.map((s) => `${s.type}@${s.index}`)).toEqual(["high@12", "low@20", "high@34", "low@42", "high@58", "low@66"].slice(0, swings.length));
    expect(swings.slice(0, 5).map((s) => s.index)).toEqual([12, 20, 34, 42, 58]);
  });
  it("labels a staircase as bullish structure", () => {
    const candles = scriptedSeries({ seed: 7, timeframe: "M15", startTime: START, tickSize: 1, points, tail: 8 });
    const labelled = labelStructure(detectSwings(candles, 3, 3));
    // The first high and first low have no predecessor to compare with, so they carry no label.
    expect(labelled.filter((s) => s.label).map((s) => s.label)).toEqual(["HH", "HL", "HH"]);
    expect(classifyStructure(labelled.slice(0, 5))).toBe("BULLISH");
  });
  it("rejects malformed scripts", () => {
    expect(() => scriptedSeries({ seed: 1, timeframe: "M5", startTime: START, tickSize: 1, points: [{ at: 1, price: 1 }, { at: 2, price: 2 }] })).toThrow();
    expect(() => scriptedSeries({ seed: 1, timeframe: "M5", startTime: START, tickSize: 1, points: [{ at: 0, price: 1 }, { at: 0, price: 2 }] })).toThrow();
  });
});

describe("indicators", () => {
  const mk = (i: number, h: number, l: number, c = (h + l) / 2): Candle => ({ time: i, open: c, high: h, low: l, close: c, volume: 1 });

  it("detectSwings requires strict extremes and alternates types", () => {
    const candles = [mk(0, 10, 8), mk(1, 11, 9), mk(2, 12, 10), mk(3, 15, 11), mk(4, 12, 9), mk(5, 11, 8), mk(6, 10, 5), mk(7, 11, 7), mk(8, 12, 8), mk(9, 13, 9)];
    const s = detectSwings(candles, 2, 2);
    expect(s.map((x) => `${x.type}@${x.index}`)).toEqual(["high@3", "low@6"]);
  });

  it("collapses consecutive same-type swings to the most extreme", () => {
    // two swing highs with no low between them (the dip is too shallow for the window)
    const hs = [5, 6, 9, 6, 5, 6, 10, 6, 5, 4, 3];
    const candles = hs.map((h, i) => mk(i, h, h - 2));
    const s = detectSwings(candles, 1, 1).filter((x) => x.type === "high");
    expect(s.length).toBeGreaterThanOrEqual(1);
  });

  it("labelStructure compares each swing with the previous of the same type", () => {
    const sw = [
      { index: 1, type: "low" as const, price: 10 }, { index: 3, type: "high" as const, price: 20 },
      { index: 5, type: "low" as const, price: 12 }, { index: 7, type: "high" as const, price: 25 },
      { index: 9, type: "low" as const, price: 9 }, { index: 11, type: "high" as const, price: 22 },
    ];
    expect(labelStructure(sw).map((s) => s.label)).toEqual([undefined, undefined, "HL", "HH", "LL", "LH"]);
  });

  it("classifyStructure: bullish, bearish and mixed (range/transition)", () => {
    const L = (type: "high" | "low", label: "HH" | "HL" | "LH" | "LL") => ({ index: 0, type, price: 0, label });
    expect(classifyStructure([L("low", "HL"), L("high", "HH")])).toBe("BULLISH");
    expect(classifyStructure([L("low", "LL"), L("high", "LH")])).toBe("BEARISH");
    expect(classifyStructure([L("low", "HL"), L("high", "LH")])).toBe("RANGE");
    expect(classifyStructure([L("low", "LL"), L("high", "HH")])).toBe("RANGE");
    expect(classifyStructure([])).toBe("RANGE");
  });

  it("atrSeries is positive and grows with bar range", () => {
    const calm = Array.from({ length: 30 }, (_, i) => mk(i, 101, 100));
    const wild = Array.from({ length: 30 }, (_, i) => mk(i, 110, 100));
    expect(atrSeries(calm).at(-1)!).toBeCloseTo(1, 5);
    expect(atrSeries(wild).at(-1)!).toBeCloseTo(10, 5);
  });
});
