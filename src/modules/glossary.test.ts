import { describe, expect, it } from "vitest";
import { GLOSSARY } from "./glossary";

describe("glossary", () => {
  it("has unique slugs and non-empty fields", () => {
    const slugs = GLOSSARY.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const g of GLOSSARY) {
      expect(g.term.trim().length, `${g.slug}.term`).toBeGreaterThanOrEqual(2);
      for (const k of ["definition", "simple", "technical", "example"] as const) expect(g[k].trim().length, `${g.slug}.${k}`).toBeGreaterThanOrEqual(12);
    }
  });
  it("every related slug exists and is not self-referential", () => {
    const slugs = new Set(GLOSSARY.map((g) => g.slug));
    for (const g of GLOSSARY) {
      for (const r of g.related) {
        expect(slugs.has(r), `${g.slug} → ${r}`).toBe(true);
        expect(r).not.toBe(g.slug);
      }
    }
  });
  it("covers every term the specification lists", () => {
    const need = ["atr", "adx", "ask", "bid", "breakout", "cfd", "confluence", "drawdown", "equity", "fibonacci", "futures", "liquidity", "margin", "market-structure", "mym", "reward-risk", "rth", "slippage", "supply", "demand", "support", "resistance", "tick", "ym"];
    const have = new Set(GLOSSARY.map((g) => g.slug));
    expect(need.filter((n) => !have.has(n))).toEqual([]);
  });
  it("has a healthy number of terms", () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(90);
  });
});
