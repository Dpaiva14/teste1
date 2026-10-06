import { describe, expect, it } from "vitest";
import { parseNumber } from "./parse-number";

describe("parseNumber", () => {
  it("parses plain, decimal and thousands formats", () => {
    expect(parseNumber("39000")).toBe(39000);
    expect(parseNumber("39000.5")).toBe(39000.5);
    expect(parseNumber("39,000.5")).toBe(39000.5);
    expect(parseNumber("39.000,5")).toBe(39000.5);
    expect(parseNumber("39000,5")).toBe(39000.5);
    expect(parseNumber("39,000")).toBe(39000);
    expect(parseNumber(" 12 ")).toBe(12);
    expect(parseNumber("-3.25")).toBe(-3.25);
    expect(parseNumber("0.5")).toBe(0.5);
    expect(parseNumber(".5")).toBe(0.5);
  });
  it("rejects garbage", () => {
    for (const bad of ["", "-", ".", "abc", "1e5x", "1..2", "--1", "NaN", "Infinity"]) expect(parseNumber(bad)).toBeNull();
  });
});
