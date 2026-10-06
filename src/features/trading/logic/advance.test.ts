import { describe, expect, it } from "vitest";
import { advanceAccount, type AdvTrade } from "./advance";

const bar = (open: number, high: number, low: number, close: number) => ({ open, high, low, close });
const base = { balance: 10000, peakEquity: 10000, maxDrawdown: 0, dayStartEquity: 10000 };
const longYm = (over: Partial<AdvTrade> = {}): AdvTrade => ({ id: "t1", symbol: "YM", direction: "LONG", contracts: 1, entryPrice: 39001, stopLoss: 38950, takeProfit: 39100, ...over });

describe("advanceAccount", () => {
  it("does nothing when no level is touched, but marks to market", () => {
    const r = advanceAccount({ ...base, openTrades: [longYm()], bars: [bar(39001, 39030, 38980, 39010)] });
    expect(r.closed).toHaveLength(0);
    expect(r.stillOpen).toHaveLength(1);
    expect(r.balance).toBe(10000);
    expect(r.lastClose).toBe(39010);
  });
  it("closes at the target and credits the net P&L (entry 39001 → 39100 = +99 pts = $495 − $3 fees)", () => {
    const r = advanceAccount({ ...base, openTrades: [longYm()], bars: [bar(39001, 39050, 38990, 39040), bar(39040, 39110, 39030, 39100)] });
    expect(r.closed).toHaveLength(1);
    expect(r.closed[0]).toMatchObject({ reason: "TAKE_PROFIT", barIndex: 1 });
    expect(r.closed[0]!.math.net).toBe(492);
    expect(r.balance).toBe(10492);
    expect(r.stillOpen).toHaveLength(0);
  });
  it("stop loss: −51 pts = −$255 − $3 = −$258; drawdown reflects the loss", () => {
    const r = advanceAccount({ ...base, openTrades: [longYm()], bars: [bar(39001, 39005, 38940, 38960)] });
    expect(r.closed[0]!.math.net).toBe(-258);
    expect(r.balance).toBe(9742);
    expect(r.maxDrawdown).toBe(258);
  });
  it("max drawdown includes unrealised dips between bars even if the trade later recovers", () => {
    const r = advanceAccount({ ...base, openTrades: [longYm({ stopLoss: 38000, takeProfit: null })], bars: [bar(39001, 39001, 38960, 38960), bar(38960, 39200, 38960, 39200)] });
    // after bar 0: open P&L = (38960 − 39001) × $5 = −$205; later +$995
    expect(r.maxDrawdown).toBe(205);
    expect(r.peakEquity).toBe(10000 + (39200 - 39001) * 5);
  });
  it("US30 trades are evaluated in basis-shifted space (−15)", () => {
    const t: AdvTrade = { id: "c", symbol: "US30", direction: "LONG", contracts: 1, entryPrice: 38986.5, stopLoss: 38950, takeProfit: null };
    // series low 38970 → quote low 38955 → above the stop, no exit
    expect(advanceAccount({ ...base, openTrades: [t], bars: [bar(39000, 39010, 38970, 39000)] }).closed).toHaveLength(0);
    // series low 38960 → quote low 38945 → stop hit
    expect(advanceAccount({ ...base, openTrades: [t], bars: [bar(39000, 39010, 38960, 39000)] }).closed[0]!.reason).toBe("STOP_LOSS");
  });
  it("handles several trades independently and keeps the remaining ones open", () => {
    const a = longYm({ id: "a" });
    const b = longYm({ id: "b", symbol: "MYM", contracts: 4, stopLoss: 38000, takeProfit: null });
    const r = advanceAccount({ ...base, openTrades: [a, b], bars: [bar(39001, 39010, 38940, 38960)] });
    expect(r.closed.map((c) => c.tradeId)).toEqual(["a"]);
    expect(r.stillOpen.map((t) => t.id)).toEqual(["b"]);
  });
  it("short: stop above entry, exit pays the spread", () => {
    const s: AdvTrade = { id: "s", symbol: "MYM", direction: "SHORT", contracts: 2, entryPrice: 39000, stopLoss: 39050, takeProfit: 38900 };
    const r = advanceAccount({ ...base, openTrades: [s], bars: [bar(38990, 38995, 38890, 38900)] });
    expect(r.closed[0]).toMatchObject({ reason: "TAKE_PROFIT" });
    expect(r.closed[0]!.math.exitPrice).toBe(38901);
    expect(r.closed[0]!.math.net).toBe(2 * 99 * 0.5 - 2 * 2 * 0.5);
  });
  it("empty bars are a no-op", () => {
    const r = advanceAccount({ ...base, openTrades: [longYm()], bars: [] });
    expect(r).toMatchObject({ balance: 10000, lastClose: null });
    expect(r.stillOpen).toHaveLength(1);
  });
});
