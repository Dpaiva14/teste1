import { describe, expect, it } from "vitest";
import { computeEntryNumbers, MissingResultError } from "./numbers";

const base = { instrument: "YM" as const, direction: "LONG" as const, entryPrice: 39000, stopLoss: 38950, contracts: 1 };

describe("computeEntryNumbers", () => {
  it("derives risk, result and R from prices (YM $5/pt)", () => {
    expect(computeEntryNumbers({ ...base, exitPrice: 39100 })).toEqual({ riskAmount: 250, result: 500, rMultiple: 2 });
    expect(computeEntryNumbers({ ...base, exitPrice: 38950 })).toEqual({ riskAmount: 250, result: -250, rMultiple: -1 });
  });
  it("scales with contracts and works for shorts and MYM", () => {
    expect(computeEntryNumbers({ instrument: "MYM", direction: "SHORT", entryPrice: 39000, stopLoss: 39050, exitPrice: 38900, contracts: 4 })).toEqual({ riskAmount: 100, result: 200, rMultiple: 2 });
  });
  it("user-supplied result and risk win (broker P&L with fees); R follows the exit price when known", () => {
    const r = computeEntryNumbers({ ...base, exitPrice: 39100, result: 480, riskAmount: 260 });
    expect(r).toEqual({ riskAmount: 260, result: 480, rMultiple: 2 });
  });
  it("without exit price, R is result ÷ risk", () => {
    expect(computeEntryNumbers({ ...base, result: -125 })).toEqual({ riskAmount: 250, result: -125, rMultiple: -0.5 });
  });
  it("needs an exit price or a result", () => {
    expect(() => computeEntryNumbers(base)).toThrow(MissingResultError);
  });
});
