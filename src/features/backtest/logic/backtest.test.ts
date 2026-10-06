import { describe, expect, it } from "vitest";
import type { Bar } from "@/features/trading/logic/engine";
import { MAX_HOLD_BARS, takeTrade, type TakeTradeInput } from "./resolve";
import { summarizeBacktest, type DecisionRecord } from "./summary";

const bar = (o: number, h: number, l: number, c: number): Bar => ({ open: o, high: h, low: l, close: c });
const flat = (n: number, p = 39000): Bar[] => Array.from({ length: n }, () => bar(p, p + 2, p - 2, p));

const base: TakeTradeInput = { symbol: "MYM", direction: "LONG", balance: 10_000, riskPercent: 1, lastClose: 39000, stopPoints: 20, targetR: 2, futureBars: [] };

describe("takeTrade", () => {
  it("sizes from the risk budget and fills at the ask (long)", () => {
    const r = takeTrade({ ...base, futureBars: flat(3) });
    if (!r.ok) throw new Error(r.message);
    expect(r.entry).toBe(39001); // bid 39000 + 1 pt spread
    expect(r.stop).toBe(38981);
    expect(r.target).toBe(39041);
    expect(r.contracts).toBe(9); // $100 budget / ($10 market + $1 commission) = 9.09 → 9
    expect(r.riskAmount).toBe(90);
    expect(r.riskPercentActual).toBe(0.9);
  });

  it("closes at the target and reports +2R", () => {
    const r = takeTrade({ ...base, futureBars: [bar(39001, 39010, 38995, 39005), bar(39005, 39045, 39000, 39040)] });
    if (!r.ok) throw new Error(r.message);
    expect(r.outcome).toBe("WIN");
    expect(r.exitReason).toBe("TAKE_PROFIT");
    expect(r.exitOffset).toBe(1);
    expect(r.rMultiple).toBe(2);
    expect(r.pnl).toBeGreaterThan(0);
  });

  it("stop wins when one bar reaches both stop and target", () => {
    const r = takeTrade({ ...base, futureBars: [bar(39001, 39050, 38970, 39000)] });
    if (!r.ok) throw new Error(r.message);
    expect(r.outcome).toBe("LOSS");
    expect(r.exitReason).toBe("STOP_LOSS");
    expect(r.rMultiple).toBe(-1);
  });

  it("fills a gap through the stop at the open (worse than the stop)", () => {
    const r = takeTrade({ ...base, futureBars: [bar(38960, 38975, 38950, 38970)] });
    if (!r.ok) throw new Error(r.message);
    expect(r.outcome).toBe("LOSS");
    expect(r.gap).toBe(true);
    expect(r.exitPrice).toBe(38960);
    expect(r.rMultiple).toBeLessThan(-1);
  });

  it("shorts enter at the bid and exit one spread above the stop level", () => {
    const r = takeTrade({ ...base, direction: "SHORT", futureBars: [bar(39000, 39025, 38995, 39020)] });
    if (!r.ok) throw new Error(r.message);
    expect(r.entry).toBe(39000);
    expect(r.stop).toBe(39020);
    expect(r.outcome).toBe("LOSS");
    expect(r.exitPrice).toBe(39021);
    expect(r.rMultiple).toBe(-1.05);
  });

  it("times out at the last bar's close when neither level is reached", () => {
    const r = takeTrade({ ...base, futureBars: flat(MAX_HOLD_BARS + 50) });
    if (!r.ok) throw new Error(r.message);
    expect(r.outcome).toBe("TIMEOUT");
    expect(r.exitReason).toBe("TIMEOUT");
    expect(r.exitOffset).toBe(MAX_HOLD_BARS - 1);
    expect(r.pnl).toBeLessThan(0); // spread + commissions on a flat market
  });

  it("without a target only the stop or the time limit closes the trade", () => {
    const r = takeTrade({ ...base, targetR: null, futureBars: [bar(39001, 39500, 39000, 39400), bar(39400, 39450, 38900, 38950)] });
    if (!r.ok) throw new Error(r.message);
    expect(r.target).toBeNull();
    expect(r.outcome).toBe("LOSS");
    expect(r.exitOffset).toBe(1);
  });

  it("refuses a stop too wide for the risk budget instead of oversizing", () => {
    const r = takeTrade({ ...base, balance: 1000, stopPoints: 100, futureBars: flat(5) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/risco|contrato/i);
  });

  it("rejects invalid inputs and an exhausted feed", () => {
    expect(takeTrade({ ...base, stopPoints: 0, futureBars: flat(2) }).ok).toBe(false);
    expect(takeTrade({ ...base, targetR: -1, futureBars: flat(2) }).ok).toBe(false);
    expect(takeTrade({ ...base, futureBars: [] }).ok).toBe(false);
  });

  it("applies the US30 basis when quoting", () => {
    const r = takeTrade({ ...base, symbol: "US30", futureBars: flat(2) });
    if (!r.ok) throw new Error(r.message);
    expect(r.entry).toBe(39000 - 15 + 1.5);
  });
});

const rec = (o: Partial<DecisionRecord>): DecisionRecord => ({ choice: "BUY", outcome: "WIN", barIndex: 100, exitIndex: 110, pnl: 100, rMultiple: 2, reason: "SETUP_VALID", rulesMet: 5, rulesTotal: 5, ...o });

describe("summarizeBacktest", () => {
  it("counts decisions and separates waits from trades", () => {
    const s = summarizeBacktest(
      [rec({}), rec({ choice: "SELL", outcome: "LOSS", pnl: -50, rMultiple: -1 }), rec({ choice: "WAIT", outcome: "NO_TRADE", pnl: null, rMultiple: null, reason: null, exitIndex: null, rulesMet: null, rulesTotal: null })],
      10_000,
    );
    expect([s.decisions, s.trades, s.buys, s.sells, s.waits]).toEqual([3, 2, 1, 1, 1]);
    expect(s.waitRate).toBeCloseTo(33.3, 1);
    expect(s.perf.totalPnl).toBe(50);
    expect(s.avgHoldBars).toBe(10);
  });

  it("warns about tiny samples", () => {
    const s = summarizeBacktest([rec({})], 10_000);
    expect(s.notes.some((n) => /amostra/i.test(n))).toBe(true);
  });

  it("flags when almost every decision is an entry", () => {
    const s = summarizeBacktest(Array.from({ length: 12 }, () => rec({})), 10_000);
    expect(s.notes.some((n) => /entradas/i.test(n))).toBe(true);
  });

  it("compares full vs partial rule adherence", () => {
    const full = Array.from({ length: 5 }, () => rec({ rMultiple: -1, pnl: -50, outcome: "LOSS" }));
    const partial = Array.from({ length: 5 }, () => rec({ rulesMet: 2, rMultiple: 2, pnl: 100 }));
    const s = summarizeBacktest([...full, ...partial], 10_000);
    expect(s.adherence.full).toMatchObject({ count: 5, avgR: -1 });
    expect(s.adherence.partial).toMatchObject({ count: 5, avgR: 2 });
    expect(s.notes.some((n) => /variância/i.test(n))).toBe(true);
  });

  it("flags emotional entries and tracks trades without recorded rules", () => {
    const s = summarizeBacktest([rec({ reason: "FOMO", rulesMet: null, rulesTotal: null })], 10_000);
    expect(s.notes.some((n) => /emocional/i.test(n))).toBe(true);
    expect(s.adherence.unrecorded).toBe(1);
    expect(s.byReason[0]).toMatchObject({ reason: "FOMO", count: 1 });
  });

  it("handles an empty run", () => {
    const s = summarizeBacktest([], 10_000);
    expect(s.trades).toBe(0);
    expect(s.waitRate).toBe(0);
    expect(s.perf.equityCurve).toEqual([10_000]);
  });
});

import { previewPlan } from "./preview";
import { reflect } from "./reflection";

describe("previewPlan", () => {
  it("matches what the server executes (entry, stop, target and contracts)", () => {
    for (const symbol of ["YM", "MYM", "US30"]) {
      for (const choice of ["BUY", "SELL"] as const) {
        const lastClose = 39_000;
        const basis = symbol === "US30" ? -15 : 0;
        const p = previewPlan({ symbol, choice, balance: 25_000, riskPercent: 1, bid: lastClose + basis, stopPoints: 30, targetR: 2 });
        const t = takeTrade({ symbol, direction: choice === "BUY" ? "LONG" : "SHORT", balance: 25_000, riskPercent: 1, lastClose, stopPoints: 30, targetR: 2, futureBars: flat(3) });
        if (!p || !t.ok) throw new Error(`no plan for ${symbol} ${choice}`);
        expect([p.entry, p.stop, p.target, p.sizing.contracts]).toEqual([t.entry, t.stop, t.target, t.contracts]);
      }
    }
  });

  it("returns null without a usable stop", () => {
    expect(previewPlan({ symbol: "MYM", choice: "BUY", balance: 10_000, riskPercent: 1, bid: 39_000, stopPoints: 0, targetR: 2 })).toBeNull();
  });
});

describe("reflect", () => {
  it("pairs outcome with process quality", () => {
    expect(reflect({ outcome: "WIN", reason: "SETUP_VALID", rulesMet: 5, rulesTotal: 5 })?.title).toMatch(/sólido, resultado favorável/i);
    expect(reflect({ outcome: "LOSS", reason: "SETUP_VALID", rulesMet: 5, rulesTotal: 5 })?.process).toBe("solid");
    expect(reflect({ outcome: "WIN", reason: "FOMO", rulesMet: 5, rulesTotal: 5 })?.title).toMatch(/processo fraco/i);
    expect(reflect({ outcome: "LOSS", reason: "SETUP_VALID", rulesMet: 2, rulesTotal: 5 })?.process).toBe("weak");
  });

  it("does not judge the process when rules were not recorded", () => {
    expect(reflect({ outcome: "WIN", reason: "SETUP_VALID", rulesMet: null, rulesTotal: null })?.process).toBe("unknown");
  });

  it("returns nothing for WAIT", () => {
    expect(reflect({ outcome: "NO_TRADE", reason: null, rulesMet: null, rulesTotal: null })).toBeNull();
  });
});
