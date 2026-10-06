import { describe, expect, it } from "vitest";
import { evaluateChecklist, autoChecks, CHECKLIST } from "./checklist";
import { behaviorSummary } from "./behavior";
import { accountSnapshot, closeMath, entryFill, exitFill, quoteFor, resolveBar, riskAtEntry, scanBars } from "./engine";

const bar = (open: number, high: number, low: number, close: number) => ({ open, high, low, close });

describe("fills (one spread per round trip)", () => {
  it("futures: long buys at the ask (+1), short sells at the bid", () => {
    expect(entryFill("YM", "LONG", 39000)).toBe(39001);
    expect(entryFill("YM", "SHORT", 39000)).toBe(39000);
    expect(quoteFor("YM", 39000)).toEqual({ bid: 39000, ask: 39001 });
  });
  it("short exits at level + spread, long exits at the level", () => {
    expect(exitFill("YM", "LONG", 39050)).toBe(39050);
    expect(exitFill("YM", "SHORT", 38950)).toBe(38951);
  });
  it("CFD spread is wider (1.5)", () => {
    expect(entryFill("US30", "LONG", 38985)).toBe(38986.5);
  });
});

describe("resolveBar", () => {
  const long = { direction: "LONG" as const, stop: 100, target: 120 };
  const short = { direction: "SHORT" as const, stop: 120, target: 100 };
  it("hits stop, target, or nothing", () => {
    expect(resolveBar(long, bar(110, 112, 99, 105))).toMatchObject({ reason: "STOP_LOSS", level: 100, gap: false });
    expect(resolveBar(long, bar(110, 121, 108, 119))).toMatchObject({ reason: "TAKE_PROFIT", level: 120 });
    expect(resolveBar(long, bar(110, 115, 105, 112))).toBeNull();
  });
  it("same bar touches both → STOP (conservative)", () => {
    expect(resolveBar(long, bar(110, 125, 95, 110))?.reason).toBe("STOP_LOSS");
    expect(resolveBar(short, bar(110, 125, 95, 110))?.reason).toBe("STOP_LOSS");
  });
  it("gap through the stop fills at the open (worse than the stop)", () => {
    expect(resolveBar(long, bar(92, 95, 90, 93))).toMatchObject({ reason: "STOP_LOSS", level: 92, gap: true });
    expect(resolveBar(short, bar(130, 132, 128, 129))).toMatchObject({ reason: "STOP_LOSS", level: 130, gap: true });
  });
  it("gap beyond the target fills at the open (better than the target)", () => {
    expect(resolveBar(long, bar(125, 128, 124, 126))).toMatchObject({ reason: "TAKE_PROFIT", level: 125, gap: true });
  });
  it("positions without stop/target never exit", () => {
    expect(resolveBar({ direction: "LONG", stop: null, target: null }, bar(1, 1000, 0, 5))).toBeNull();
    expect(resolveBar({ direction: "LONG", stop: null, target: 120 }, bar(110, 130, 0, 5))?.reason).toBe("TAKE_PROFIT");
  });
  it("scanBars returns the first closing bar index", () => {
    const r = scanBars(long, [bar(110, 115, 105, 112), bar(112, 116, 108, 114), bar(114, 121, 110, 119), bar(119, 130, 90, 100)]);
    expect(r.barIndex).toBe(2);
    expect(r.hit?.reason).toBe("TAKE_PROFIT");
    expect(scanBars(long, []).hit).toBeNull();
  });
});

describe("closeMath", () => {
  it("YM long stopped out: entry at ask 39001, stop 38950 → −51 pts (−$255) − $6 commissions", () => {
    const r = closeMath({ symbol: "YM", direction: "LONG", contracts: 1, entry: 39001, stop: 38950, level: 38950 });
    expect(r.points).toBe(-51);
    expect(r.gross).toBe(-255);
    expect(r.fees).toBe(3); // 2 sides × $1.50
    expect(r.net).toBe(-258);
    expect(r.rMultiple).toBe(-1); // measured from the real entry fill
  });
  it("MYM short at target pays the spread on exit", () => {
    const r = closeMath({ symbol: "MYM", direction: "SHORT", contracts: 4, entry: 39000, stop: 39050, level: 38900 });
    expect(r.exitPrice).toBe(38901);
    expect(r.points).toBe(99);
    expect(r.gross).toBe(198);
    expect(r.fees).toBe(4); // 4 × 2 × $0.50
    expect(r.net).toBe(194);
    expect(r.rMultiple).toBe(1.98);
  });
  it("no stop → no R multiple", () => {
    expect(closeMath({ symbol: "YM", direction: "LONG", contracts: 1, entry: 100, stop: null, level: 110 }).rMultiple).toBeNull();
  });
  it("gap-through-stop loses more than 1R", () => {
    const r = closeMath({ symbol: "YM", direction: "LONG", contracts: 1, entry: 39001, stop: 38951, level: 38930 });
    expect(r.rMultiple).toBeLessThan(-1);
  });
  it("riskAtEntry = points × value × contracts", () => {
    expect(riskAtEntry("MYM", 4, 39000, 38950)).toBe(100);
    expect(riskAtEntry("YM", 1, 39000, 38950)).toBe(250);
  });
});

describe("accountSnapshot", () => {
  const base = { balance: 10000, dayStartEquity: 10000, peakEquity: 10000, maxDrawdown: 0 };
  it("flat account: equity = balance, no margin", () => {
    const s = accountSnapshot({ ...base, openTrades: [], bids: {} });
    expect(s).toMatchObject({ equity: 10000, openPnl: 0, usedMargin: 0, freeMargin: 10000, dailyPnl: 0, drawdown: 0 });
  });
  it("opening a long marks to market at the bid → immediately −1 spread (−$5 on YM)", () => {
    const s = accountSnapshot({ ...base, openTrades: [{ symbol: "YM", direction: "LONG", contracts: 1, entryPrice: 39001 }], bids: { YM: 39000 } });
    expect(s.openPnl).toBe(-5);
    expect(s.usedMargin).toBe(9000);
    expect(s.freeMargin).toBe(10000 - 5 - 9000);
  });
  it("short marks to market at the ask", () => {
    const s = accountSnapshot({ ...base, openTrades: [{ symbol: "MYM", direction: "SHORT", contracts: 2, entryPrice: 39000 }], bids: { MYM: 38950 } });
    expect(s.openPnl).toBe(2 * (39000 - 38951) * 0.5);
  });
  it("tracks peak and max drawdown without ever shrinking it", () => {
    let s = accountSnapshot({ ...base, balance: 10400, openTrades: [], bids: {} });
    expect(s.peakEquity).toBe(10400);
    s = accountSnapshot({ ...base, balance: 10000, peakEquity: s.peakEquity, maxDrawdown: s.maxDrawdown, openTrades: [], bids: {} });
    expect(s.drawdown).toBe(400);
    expect(s.maxDrawdown).toBe(400);
    s = accountSnapshot({ ...base, balance: 10300, peakEquity: s.peakEquity, maxDrawdown: s.maxDrawdown, openTrades: [], bids: {} });
    expect(s.drawdown).toBe(100);
    expect(s.maxDrawdown).toBe(400);
  });
  it("daily P&L is relative to the day-start equity", () => {
    expect(accountSnapshot({ ...base, balance: 10250, dayStartEquity: 10100, openTrades: [], bids: {} }).dailyPnl).toBe(150);
  });
});

describe("checklist", () => {
  it("12 items; missing ones are listed and never block", () => {
    expect(CHECKLIST).toHaveLength(12);
    const e = evaluateChecklist({ htfAnalysed: true, stopDefined: true });
    expect(e.checked).toBe(2);
    expect(e.missing).toHaveLength(10);
    expect(e.complete).toBe(false);
    expect(e.warning).toMatch(/Faltam 10 de 12/);
  });
  it("complete checklist has no warning", () => {
    const all = Object.fromEntries(CHECKLIST.map((i) => [i.key, true]));
    const e = evaluateChecklist(all);
    expect(e).toMatchObject({ complete: true, percent: 100, warning: null });
  });
  it("auto checks come from facts, not from claims", () => {
    expect(autoChecks({ stop: null, contracts: 2, rewardRisk: 3 })).toEqual({ stopDefined: false, riskCalculated: false, rrAcceptable: true });
    expect(autoChecks({ stop: 100, contracts: 2, rewardRisk: 1.49 })).toEqual({ stopDefined: true, riskCalculated: true, rrAcceptable: false });
    expect(autoChecks({ stop: 100, contracts: 0, rewardRisk: null }).riskCalculated).toBe(false);
  });
});

describe("behaviorSummary", () => {
  const t = (entryReason: string | null, rMultiple: number | null, checklistPercent: number | null = 100, hadStop = true, rewardRisk: number | null = 2) => ({ entryReason, rMultiple, checklistPercent, hadStop, rewardRisk });
  it("asks for more data below 5 trades", () => {
    expect(behaviorSummary([t("SETUP_VALID", 1)]).insights[0]).toMatch(/pelo menos 5/);
  });
  it("groups by reason with win rate and avg R", () => {
    const s = behaviorSummary([t("FOMO", -1), t("FOMO", -1), t("FOMO", 0.5), t("SETUP_VALID", 2), t("SETUP_VALID", -1), t("SETUP_VALID", 3)]);
    const fomo = s.byReason.find((r) => r.reason === "FOMO")!;
    expect(fomo).toMatchObject({ trades: 3, winRate: 33.3, avgR: -0.5 });
    expect(s.emotionalSharePercent).toBe(50);
    expect(s.insights.join(" ")).toMatch(/razão emocional/);
  });
  it("compares complete vs incomplete checklists and flags missing stops / low R:R", () => {
    const s = behaviorSummary([t("SETUP_VALID", 2, 100), t("SETUP_VALID", 1, 100), t("OTHER", -1, 50, false, 1), t("OTHER", -1, 40, false, 0.8), t("OTHER", -1, 30, false, 0.5)]);
    expect(s.avgRComplete).toBe(1.5);
    expect(s.avgRIncomplete).toBe(-1);
    expect(s.withStopPercent).toBe(40);
    expect(s.goodRrPercent).toBe(40);
    expect(s.insights.join(" ")).toMatch(/stop/);
  });
  it("handles empty input", () => {
    expect(behaviorSummary([])).toMatchObject({ totalTrades: 0, emotionalSharePercent: 0, byReason: [] });
  });
});
