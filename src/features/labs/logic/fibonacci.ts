import type { FibSolution, ScenarioDef } from "@/modules/scenarios/types";

export type FibTool = "retracement" | "extension" | "projection";

export const RETRACEMENT_RATIOS = [0, 0.236, 0.382, 0.5, 0.618, 0.707, 0.786, 0.886, 1] as const;
export const EXTENSION_RATIOS = [1, 1.272, 1.414, 1.618, 2, 2.618] as const;
export const KEY_RETRACEMENTS = [0.382, 0.5, 0.618, 0.786] as const;

/** Where each ratio comes from — we are honest that not all are "Fibonacci numbers". */
export const RATIO_ORIGIN: Record<number, "golden" | "root" | "convention"> = {
  0: "convention",
  0.236: "golden",
  0.382: "golden",
  0.5: "convention",
  0.618: "golden",
  0.707: "root",
  0.786: "root",
  0.886: "root",
  1: "convention",
  1.272: "root",
  1.414: "root",
  1.618: "golden",
  2: "convention",
  2.618: "golden",
};

/** 0.618 → "61.8%", 0.5 → "50%", 1.272 → "127.2%". */
export const ratioLabel = (r: number): string => `${Number((r * 100).toFixed(1))}%`;

/** Retracement of the move A→B: ratio 0 = B, ratio 1 = A. price = B − r·(B−A). */
export function retracementLevels(a: number, b: number, ratios: readonly number[] = RETRACEMENT_RATIOS) {
  return ratios.map((r) => ({ ratio: r, price: b - r * (b - a) }));
}

/** Extension of the move A→B beyond B (measured from A): price = A + r·(B−A); r = 1 is B itself. */
export function extensionLevels(a: number, b: number, ratios: readonly number[] = EXTENSION_RATIOS) {
  return ratios.map((r) => ({ ratio: r, price: a + r * (b - a) }));
}

/** Projection of leg A→B from point C (e.g. the end of the pullback): price = C + r·(B−A). r = 1 is "AB = CD". */
export function projectionLevels(a: number, b: number, c: number, ratios: readonly number[] = EXTENSION_RATIOS) {
  return ratios.map((r) => ({ ratio: r, price: c + r * (b - a) }));
}

/** How much of the impulse A→B the pullback to C retraced (0..1+). */
export function retracementRatio(a: number, b: number, c: number): number {
  const move = b - a;
  return move === 0 ? 0 : (b - c) / move;
}

export function nearestRatio(value: number, candidates: readonly number[] = KEY_RETRACEMENTS): number {
  return candidates.reduce((best, r) => (Math.abs(r - value) < Math.abs(best - value) ? r : best), candidates[0]!);
}

export interface FibAnswer {
  a: { index: number; price: number };
  b: { index: number; price: number };
  /** which key retracement the student believes the pullback reached */
  pickedRatio: number;
}

export interface FibCheck {
  scorePercent: number;
  aCorrect: boolean;
  bCorrect: boolean;
  directionCorrect: boolean;
  ratioCorrect: boolean;
  actualRatio: number;
  expectedRatio: number;
  solution: FibSolution;
  note: string;
}

const INDEX_TOLERANCE = 2;

/**
 * Grades: A (25) + B (25) + correct direction implied by A→B (included in A/B) + nearest key retracement (50).
 * Swapped anchors (B before A, or wrong direction) lose the anchor points: direction is part of the skill.
 */
export function checkFibonacci(def: ScenarioDef, answer: FibAnswer): FibCheck {
  if (!def.fib) throw new Error(`Scenario ${def.id} has no fib solution`);
  const sol = def.fib;
  const directionCorrect = (answer.b.price - answer.a.price > 0) === (sol.direction === "up") && answer.b.index > answer.a.index;
  const aCorrect = directionCorrect && Math.abs(answer.a.index - sol.a.at) <= INDEX_TOLERANCE;
  const bCorrect = directionCorrect && Math.abs(answer.b.index - sol.b.at) <= INDEX_TOLERANCE;
  const actualRatio = retracementRatio(sol.a.price, sol.b.price, sol.c?.price ?? sol.b.price);
  const expectedRatio = nearestRatio(actualRatio);
  const ratioCorrect = Math.abs(answer.pickedRatio - expectedRatio) < 1e-6;
  const score = (aCorrect ? 25 : 0) + (bCorrect ? 25 : 0) + (ratioCorrect ? 50 : 0);
  return { scorePercent: score, aCorrect, bCorrect, directionCorrect, ratioCorrect, actualRatio, expectedRatio, solution: sol, note: sol.note };
}
