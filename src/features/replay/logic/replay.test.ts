import { describe, expect, it } from "vitest";
import { evaluateTrade } from "@/features/trading/logic/evaluation";
import { drawingsToOverlays, isPrepared } from "./drawings";
import { reviewSession, type ReviewTrade } from "./review";
import { drawingsSchema } from "../schemas";
import type { Drawing } from "../schemas";

const good = evaluateTrade({ hasStop: true, rewardRisk: 2, riskPercent: 1, checklistPercent: 100, prepared: true, entryReason: "SETUP_VALID", exitedBy: "TAKE_PROFIT", hasThesis: true });
const bad = evaluateTrade({ hasStop: false, rewardRisk: null, riskPercent: null, checklistPercent: 20, prepared: false, entryReason: "FOMO", exitedBy: "MANUAL" });
const trade = (id: string, e: typeof good, o: Partial<ReviewTrade> = {}): ReviewTrade => ({ id, evaluation: e, prepared: true, hasStop: true, emotional: false, ...o });

describe("drawings", () => {
  const ds: Drawing[] = [
    { id: "a1", kind: "level", price: 39_000 },
    { id: "b2", kind: "zone", top: 38_900, bottom: 39_000, fromIndex: 250 },
    { id: "c3", kind: "trend", from: { index: 200, price: 38_800 }, to: { index: 260, price: 39_100 } },
    { id: "d4", kind: "fib", from: { index: 210, price: 38_800 }, to: { index: 250, price: 39_200 } },
  ];

  it("converts absolute indices to window-relative overlays", () => {
    const o = drawingsToOverlays(ds, 100);
    expect(o).toHaveLength(4);
    const zone = o[1]!;
    if (zone.type !== "zone") throw new Error("zone");
    expect(zone.fromIndex).toBe(150);
    expect(zone.top).toBeGreaterThan(zone.bottom);
    const fib = o[3]!;
    if (fib.type !== "fib") throw new Error("fib");
    expect(fib.fromIndex).toBe(110);
    // retracement of A→B: 0 = B, 1 = A
    expect(fib.levels.find((l) => l.ratio === 0)!.price).toBe(39_200);
    expect(fib.levels.find((l) => l.ratio === 1)!.price).toBe(38_800);
    expect(fib.levels.find((l) => l.ratio === 0.618)!.price).toBeCloseTo(38_952.8, 1);
  });

  it("only counts as prepared when something is drawn", () => {
    expect(isPrepared([])).toBe(false);
    expect(isPrepared(ds)).toBe(true);
  });

  it("validates stored drawings", () => {
    expect(drawingsSchema.safeParse(ds).success).toBe(true);
    expect(drawingsSchema.safeParse([{ id: "x", kind: "level", price: -5 }]).success).toBe(false);
    expect(drawingsSchema.safeParse([{ id: "BAD ID", kind: "level", price: 100 }]).success).toBe(false);
    expect(drawingsSchema.safeParse([{ id: "x", kind: "line", price: 100 }]).success).toBe(false);
    expect(drawingsSchema.safeParse(Array.from({ length: 41 }, (_, i) => ({ id: `d${i}`, kind: "level", price: 100 }))).success).toBe(false);
  });
});

describe("reviewSession", () => {
  it("judges the process, not the result", () => {
    const r = reviewSession([trade("1", good), trade("2", good)]);
    expect(r.averageScore).toBe(good.score);
    expect(r.grade).toBe("excelente");
    expect(r.notes.some((n) => /pouco/i.test(n))).toBe(true);
  });

  it("flags unprepared, stop-less and emotional trades", () => {
    const r = reviewSession([trade("1", bad, { prepared: false, hasStop: false, emotional: true }), trade("2", good)]);
    expect(r.notes.join(" ")).toMatch(/sem nada marcado/);
    expect(r.notes.join(" ")).toMatch(/sem stop/);
    expect(r.notes.join(" ")).toMatch(/emocional/);
    expect(r.averageScore).toBe(Math.round((good.score + bad.score) / 2));
  });

  it("handles a session with no closed trades", () => {
    const r = reviewSession([]);
    expect(r.averageScore).toBeNull();
    expect(r.grade).toBeNull();
    expect(r.notes[0]).toMatch(/Ainda não fechaste/);
  });
});
