import { describe, expect, it } from "vitest";
import { drawdownAfterLosses, expectancyR, leverageInfo, onePercentMoveImpact, pnlPoints, positionSize, rMultiple, rewardRisk, riskPerContract, tradePnlUsd, tradingCosts } from "./risk";

describe("P&L", () => {
  it("YM is $5/point, MYM $0.50/point", () => {
    expect(tradePnlUsd({ symbol: "YM", direction: "LONG", entry: 39000, exit: 39040, contracts: 1 }).net).toBe(200);
    expect(tradePnlUsd({ symbol: "MYM", direction: "LONG", entry: 39000, exit: 39040, contracts: 1 }).net).toBe(20);
    expect(tradePnlUsd({ symbol: "YM", direction: "SHORT", entry: 39000, exit: 38950, contracts: 2 }).net).toBe(500);
  });
  it("short loses when price rises; fees reduce net", () => {
    const r = tradePnlUsd({ symbol: "YM", direction: "SHORT", entry: 39000, exit: 39020, contracts: 1, commissionRoundTurn: 3 });
    expect(r.gross).toBe(-100);
    expect(r.net).toBe(-103);
  });
  it("pnlPoints sign", () => {
    expect(pnlPoints("LONG", 100, 90)).toBe(-10);
    expect(pnlPoints("SHORT", 100, 90)).toBe(10);
  });
});

describe("position size (the spec's worked example)", () => {
  // Account $10,000, risk 1% → $100 budget.
  it("YM with a 50-point stop: $250/contract → 0 contracts fit, and it explains why", () => {
    const r = positionSize({ balance: 10000, riskPercent: 1, symbol: "YM", direction: "LONG", entry: 39000, stop: 38950 });
    expect(r.riskBudget).toBe(100);
    expect(r.riskPerContract).toBe(250);
    expect(r.contracts).toBe(0);
    expect(r.warnings.join(" ")).toMatch(/MYM/);
    expect(r.explanation).toMatch(/Nenhum contrato inteiro/);
  });
  it("MYM with the same stop: $25/contract → 4 contracts, $100 actual risk", () => {
    const r = positionSize({ balance: 10000, riskPercent: 1, symbol: "MYM", direction: "LONG", entry: 39000, stop: 38950, target: 39100 });
    expect(r.riskPerContract).toBe(25);
    expect(r.contracts).toBe(4);
    expect(r.actualRisk).toBe(100);
    expect(r.actualRiskPercent).toBe(1);
    expect(r.rewardRisk).toBe(2);
    expect(r.potentialProfit).toBe(200);
    expect(r.explanation).toContain("$100.00");
  });
  it("floors (never rounds up) and reports the unused budget", () => {
    const r = positionSize({ balance: 10000, riskPercent: 1, symbol: "MYM", direction: "LONG", entry: 39000, stop: 38930 }); // $35/contract → 2.857 → 2
    expect(r.contractsRaw).toBeCloseTo(2.8571, 3);
    expect(r.contracts).toBe(2);
    expect(r.actualRisk).toBe(70);
    expect(r.unusedBudget).toBe(30);
  });
  it("commission and slippage make the estimate more conservative", () => {
    const base = positionSize({ balance: 10000, riskPercent: 1, symbol: "MYM", direction: "LONG", entry: 39000, stop: 38950 });
    const withCosts = positionSize({ balance: 10000, riskPercent: 1, symbol: "MYM", direction: "LONG", entry: 39000, stop: 38950, commissionRoundTurn: 1, slippagePoints: 2 });
    expect(withCosts.riskPerContract).toBe(26 + 1); // (50+2)*0.5 + 1
    expect(withCosts.contracts).toBeLessThanOrEqual(base.contracts);
    expect(withCosts.actualRisk).toBeLessThanOrEqual(withCosts.riskBudget);
  });
  it("exact integer division is not lost to float error ($500 budget / $250 = 2)", () => {
    const r = positionSize({ balance: 50000, riskPercent: 1, symbol: "YM", direction: "LONG", entry: 39000, stop: 38950 });
    expect(r.riskBudget).toBe(500);
    expect(r.contracts).toBe(2);
  });
  it("validates stop/target sides and inputs", () => {
    expect(positionSize({ balance: 10000, riskPercent: 1, symbol: "YM", direction: "LONG", entry: 39000, stop: 39050 }).valid).toBe(false);
    expect(positionSize({ balance: 10000, riskPercent: 1, symbol: "YM", direction: "SHORT", entry: 39000, stop: 38950 }).valid).toBe(false);
    expect(positionSize({ balance: 10000, riskPercent: 1, symbol: "YM", direction: "LONG", entry: 39000, stop: 39000 }).valid).toBe(false);
    expect(positionSize({ balance: 0, riskPercent: 1, symbol: "YM", direction: "LONG", entry: 39000, stop: 38950 }).valid).toBe(false);
    expect(positionSize({ balance: 10000, riskPercent: 150, symbol: "YM", direction: "LONG", entry: 39000, stop: 38950 }).valid).toBe(false);
    const badTarget = positionSize({ balance: 10000, riskPercent: 1, symbol: "MYM", direction: "LONG", entry: 39000, stop: 38950, target: 38900 });
    expect(badTarget.valid).toBe(false);
    expect(badTarget.contracts).toBe(0);
  });
  it("warns on >2% risk and on R:R below 1", () => {
    const r = positionSize({ balance: 10000, riskPercent: 5, symbol: "MYM", direction: "LONG", entry: 39000, stop: 38950, target: 39030 });
    expect(r.warnings.join(" ")).toMatch(/acima de 2%/);
    expect(r.warnings.join(" ")).toMatch(/R:R/);
  });
  it("respects maxContracts", () => {
    const r = positionSize({ balance: 100000, riskPercent: 1, symbol: "MYM", direction: "LONG", entry: 39000, stop: 38950, maxContracts: 5 });
    expect(r.contracts).toBe(5);
    expect(r.warnings.join(" ")).toMatch(/Limitado/);
  });
  it("accepts a custom point value (e.g. a broker's CFD contract)", () => {
    // $10 per point per lot, 50-point stop → $500/lot; $10k at 1% = $100 → 0 lots fit.
    const r = positionSize({ balance: 10000, riskPercent: 1, symbol: "US30", pointValueOverride: 10, direction: "LONG", entry: 39000, stop: 38950 });
    expect(r.riskPerContract).toBe(500);
    expect(r.contracts).toBe(0);
    // $0.10 per point → $5/lot → 20 lots.
    const r2 = positionSize({ balance: 10000, riskPercent: 1, symbol: "US30", pointValueOverride: 0.1, direction: "LONG", entry: 39000, stop: 38950 });
    expect(r2.contracts).toBe(20);
    expect(r2.warnings.join(" ")).not.toMatch(/depende do broker/);
    expect(positionSize({ balance: 10000, riskPercent: 1, symbol: "US30", pointValueOverride: -1, direction: "LONG", entry: 39000, stop: 38950 }).valid).toBe(false);
  });
  it("works for shorts", () => {
    const r = positionSize({ balance: 10000, riskPercent: 1, symbol: "MYM", direction: "SHORT", entry: 39000, stop: 39050, target: 38850 });
    expect(r.valid).toBe(true);
    expect(r.contracts).toBe(4);
    expect(r.rewardRisk).toBe(3);
  });
});

describe("reward:risk & R", () => {
  it("computes ratio and break-even win rate", () => {
    const r = rewardRisk({ direction: "LONG", entry: 39000, stop: 38950, target: 39100 });
    expect(r.ratio).toBe(2);
    expect(r.breakEvenWinRate).toBe(33.3);
  });
  it("flags impossible geometry", () => {
    expect(rewardRisk({ direction: "LONG", entry: 39000, stop: 39010, target: 39100 }).valid).toBe(false);
  });
  it("R multiples", () => {
    expect(rMultiple({ direction: "LONG", entry: 100, stop: 90, exit: 125 })).toBe(2.5);
    expect(rMultiple({ direction: "LONG", entry: 100, stop: 90, exit: 90 })).toBe(-1);
    expect(rMultiple({ direction: "SHORT", entry: 100, stop: 110, exit: 95 })).toBe(0.5);
    expect(rMultiple({ direction: "LONG", entry: 100, stop: 100, exit: 105 })).toBeNull();
  });
  it("expectancy: 40% win rate at 3R is +0.6R; 50% at 1R is 0", () => {
    expect(expectancyR(0.4, 3, -1)).toBe(0.6);
    expect(expectancyR(0.5, 1, 1)).toBe(0);
    expect(expectancyR(0.3, 1, 1)).toBe(-0.4);
  });
});

describe("costs, leverage, drawdown", () => {
  it("round-turn friction", () => {
    const c = tradingCosts({ symbol: "YM", contracts: 2, spreadPoints: 1, commissionRoundTurn: 3, slippagePoints: 1 });
    expect(c).toEqual({ spread: 10, slippage: 10, commission: 6, total: 26 });
  });
  it("leverage = notional / margin", () => {
    expect(leverageInfo(195000, 9000)).toEqual({ leverage: 21.67, marginPctOfNotional: 4.62 });
    expect(leverageInfo(0, 100).leverage).toBeNull();
  });
  it("1% move at 39,000 on 1 YM = 390 points = $1,950", () => {
    expect(onePercentMoveImpact("YM", 39000, 1)).toEqual({ points: 390, usd: 1950 });
    expect(onePercentMoveImpact("MYM", 39000, 10).usd).toBe(1950);
  });
  it("losing streaks hurt asymmetrically (−50% needs +100%)", () => {
    const d = drawdownAfterLosses(2, 10);
    expect(d.drawdownPercent).toBeCloseTo(18.29, 1);
    expect(drawdownAfterLosses(50, 1)).toEqual({ remainingPercent: 50, drawdownPercent: 50, recoveryNeededPercent: 100 });
  });
  it("riskPerContract exposes ticks", () => {
    const r = riskPerContract({ symbol: "US30", entry: 39000, stop: 38990 });
    expect(r.stopTicks).toBe(100); // tick 0.1
    expect(r.totalRisk).toBe(10); // demo $1/pt
  });
});
