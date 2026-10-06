import { describe, expect, it } from "vitest";
import { MODULES } from "./index";
import { validateCurriculum, validateModule } from "./validate";

describe("curriculum content", () => {
  for (const m of MODULES) {
    it(`module ${String(m.number).padStart(2, "0")} — ${m.slug} is well formed`, () => {
      expect(validateModule(m)).toEqual([]);
    });
  }

  it("has no duplicate numbers/slugs", () => {
    expect(validateCurriculum(MODULES, { complete: false })).toEqual([]);
  });
});
