import { intendedSwings } from "@/features/scenarios/build";
import type { StructureLabel } from "@/lib/market-data/indicators";
import type { ScenarioDef } from "@/modules/scenarios/types";

export type StructureKind = "BULLISH" | "BEARISH" | "RANGE";

export interface StructureMark {
  index: number;
  label: StructureLabel;
}

export interface StructureAnswer {
  marks: readonly StructureMark[];
  structure: StructureKind | null;
}

export type MarkStatus = "correct" | "wrong-label" | "extra";

export interface MarkFeedback {
  index: number;
  label: StructureLabel;
  status: MarkStatus;
  /** the label that was expected at the matched swing (for wrong-label) */
  expected?: StructureLabel;
  matchedIndex?: number;
}

export interface MissedSwing {
  index: number;
  price: number;
  label: StructureLabel;
}

export interface StructureCheck {
  scorePercent: number;
  marks: MarkFeedback[];
  missed: MissedSwing[];
  structureCorrect: boolean;
  expectedStructure: StructureKind;
  note: string;
  counts: { correct: number; wrongLabel: number; extra: number; missed: number; expected: number };
  /** the full solution, for the "see solution" overlay */
  solution: { index: number; price: number; label: StructureLabel }[];
}

export const MATCH_TOLERANCE = 2;

const isHighLabel = (l: StructureLabel) => l === "HH" || l === "LH";

/**
 * Grades a market-structure exercise.
 * - Each mark is matched to the nearest unmatched expected swing of the same side (high/low) within ±2 candles.
 * - Score = (correct labels + 1 if the overall structure is right − 0.5 × extra marks) / (expected + 1).
 */
export function checkStructure(def: ScenarioDef, answer: StructureAnswer): StructureCheck {
  if (!def.structure) throw new Error(`Scenario ${def.id} has no structure solution`);
  const expected = intendedSwings(def).filter((s) => s.label !== undefined) as { index: number; type: "high" | "low"; price: number; label: StructureLabel }[];
  const used = new Set<number>();
  const feedback: MarkFeedback[] = [];

  // Process marks in order of index so greedy matching is deterministic.
  const marks = [...answer.marks].sort((a, b) => a.index - b.index);
  for (const m of marks) {
    let best = -1;
    let bestDist = Infinity;
    expected.forEach((e, i) => {
      if (used.has(i)) return;
      if ((e.type === "high") !== isHighLabel(m.label)) return;
      const d = Math.abs(e.index - m.index);
      if (d <= MATCH_TOLERANCE && d < bestDist) {
        best = i;
        bestDist = d;
      }
    });
    if (best === -1) {
      feedback.push({ index: m.index, label: m.label, status: "extra" });
      continue;
    }
    used.add(best);
    const e = expected[best]!;
    feedback.push(
      e.label === m.label
        ? { index: m.index, label: m.label, status: "correct", matchedIndex: e.index }
        : { index: m.index, label: m.label, status: "wrong-label", expected: e.label, matchedIndex: e.index },
    );
  }

  const missed = expected.filter((_, i) => !used.has(i)).map((e) => ({ index: e.index, price: e.price, label: e.label }));
  const correct = feedback.filter((f) => f.status === "correct").length;
  const wrongLabel = feedback.filter((f) => f.status === "wrong-label").length;
  const extra = feedback.filter((f) => f.status === "extra").length;
  const structureCorrect = answer.structure === def.structure.answer;

  const units = expected.length + 1;
  const earned = Math.max(0, correct + (structureCorrect ? 1 : 0) - 0.5 * extra);
  return {
    scorePercent: Math.round(Math.min(1, earned / units) * 100),
    marks: feedback,
    missed,
    structureCorrect,
    expectedStructure: def.structure.answer,
    note: def.structure.note,
    counts: { correct, wrongLabel, extra, missed: missed.length, expected: expected.length },
    solution: expected.map((e) => ({ index: e.index, price: e.price, label: e.label })),
  };
}
