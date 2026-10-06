import { describe, expect, it } from "vitest";
import type { Candle } from "@/lib/market-data/types";
import type { ChartViewport } from "../types";
import { computeDomain, indexForX, niceTicks, priceForY, snapToExtreme, xForIndex, yForPrice } from "./chart-math";

const vp: ChartViewport = {
  width: 508,
  height: 300,
  padding: { top: 10, right: 8, bottom: 10, left: 0 },
  first: 10,
  count: 50,
  minPrice: 100,
  maxPrice: 200,
};

describe("chart-math", () => {
  it("x/index mapping is invertible", () => {
    for (const i of [10, 11, 25, 59]) expect(indexForX(vp, xForIndex(vp, i))).toBe(i);
  });

  it("y/price mapping is invertible and orientation is top=max", () => {
    expect(yForPrice(vp, 200)).toBeCloseTo(vp.padding.top);
    expect(yForPrice(vp, 100)).toBeCloseTo(vp.height - vp.padding.bottom);
    for (const p of [100, 123.5, 199]) expect(priceForY(vp, yForPrice(vp, p))).toBeCloseTo(p, 8);
  });

  it("computeDomain pads and includes extra prices", () => {
    const candles: Candle[] = [
      { time: 0, open: 10, high: 12, low: 9, close: 11, volume: 1 },
      { time: 1, open: 11, high: 14, low: 10, close: 13, volume: 1 },
    ];
    const d = computeDomain(candles, 0, 2, [20], 0);
    expect(d).toEqual({ min: 9, max: 20 });
    const padded = computeDomain(candles, 0, 2, [], 0.1);
    expect(padded.min).toBeLessThan(9);
    expect(padded.max).toBeGreaterThan(14);
  });

  it("niceTicks returns round steps inside range", () => {
    const t = niceTicks(38123, 38987, 6);
    expect(t.length).toBeGreaterThanOrEqual(3);
    const step = t[1]! - t[0]!;
    expect([100, 200, 250, 500, 50].includes(step)).toBe(true);
    expect(t.every((v) => v >= 38123 && v <= 38987)).toBe(true);
  });

  it("snapToExtreme picks the nearer wick", () => {
    const c: Candle = { time: 0, open: 10, high: 20, low: 0, close: 12, volume: 1 };
    expect(snapToExtreme(c, 18)).toEqual({ price: 20, side: "high" });
    expect(snapToExtreme(c, 3)).toEqual({ price: 0, side: "low" });
  });
});
