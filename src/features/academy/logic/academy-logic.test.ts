import { describe, expect, it } from "vitest";
import { gradeQuestion, gradeQuiz, type GradableQuestion } from "./grading";
import { currentLevel, unlockedLevels, type LevelProgress } from "./unlock";

const choice = (id: string, correctId: string, points = 1): GradableQuestion => ({
  id,
  type: "MULTIPLE_CHOICE",
  points,
  numericAnswer: null,
  numericTolerance: null,
  answers: [
    { id: `${id}-a`, isCorrect: `${id}-a` === correctId },
    { id: `${id}-b`, isCorrect: `${id}-b` === correctId },
    { id: `${id}-c`, isCorrect: `${id}-c` === correctId },
  ],
});
const numeric = (id: string, answer: number, tol: number): GradableQuestion => ({
  id, type: "POSITION_SIZE", points: 1, answers: [], numericAnswer: answer, numericTolerance: tol,
});

describe("gradeQuestion", () => {
  it("grades choice questions", () => {
    const q = choice("q1", "q1-b");
    expect(gradeQuestion(q, { optionId: "q1-b" }).correct).toBe(true);
    expect(gradeQuestion(q, { optionId: "q1-a" }).correct).toBe(false);
    expect(gradeQuestion(q, { optionId: "nonsense" }).correct).toBe(false);
    expect(gradeQuestion(q, undefined)).toMatchObject({ correct: false, skipped: true });
  });
  it("grades numeric questions with tolerance (and exact when tolerance is 0)", () => {
    expect(gradeQuestion(numeric("n", 2, 0), { value: 2 }).correct).toBe(true);
    expect(gradeQuestion(numeric("n", 2, 0), { value: 2.01 }).correct).toBe(false);
    expect(gradeQuestion(numeric("n", 2.5, 0.05), { value: 2.54 }).correct).toBe(true);
    expect(gradeQuestion(numeric("n", 2.5, 0.05), { value: 2.6 }).correct).toBe(false);
    expect(gradeQuestion(numeric("n", 2.5, 0.05), { value: Number.NaN })).toMatchObject({ correct: false, skipped: true });
    expect(gradeQuestion(numeric("n", 0.3, 0), { value: 0.1 + 0.2 }).correct).toBe(true); // float noise
  });
  it("never leaks the key as the given answer", () => {
    const r = gradeQuestion(choice("q", "q-a"), { optionId: "q-c" });
    expect(r.givenOptionId).toBe("q-c");
    expect(r.correctOptionIds).toEqual(["q-a"]);
  });
});

describe("gradeQuiz", () => {
  it("weights by points and rounds", () => {
    const qs = [choice("a", "a-a", 1), choice("b", "b-a", 2)];
    const g = gradeQuiz(qs, { a: { optionId: "a-a" }, b: { optionId: "b-b" } });
    expect(g.scorePercent).toBe(33);
    expect(g.correctCount).toBe(1);
    expect(g.totalCount).toBe(2);
    expect(gradeQuiz(qs, { a: { optionId: "a-a" }, b: { optionId: "b-a" } }).scorePercent).toBe(100);
  });
  it("empty quiz scores 0 without dividing by zero", () => {
    expect(gradeQuiz([], {}).scorePercent).toBe(0);
  });
});

describe("level unlocking", () => {
  const mk = (level: number, done: number, total: number): LevelProgress => ({ level, completedLessons: done, totalLessons: total });
  it("always opens level 1 and gates the rest on 80% of the previous level", () => {
    const p = [mk(1, 7, 10), mk(2, 0, 10), mk(3, 0, 10)];
    expect([...unlockedLevels(p)]).toEqual([1]);
    const q = [mk(1, 8, 10), mk(2, 0, 10), mk(3, 0, 10)];
    expect([...unlockedLevels(q)]).toEqual([1, 2]);
  });
  it("does not skip: level 3 stays closed while level 2 is below threshold even if level 1 is done", () => {
    const p = [mk(1, 10, 10), mk(2, 3, 10), mk(3, 0, 10)];
    expect([...unlockedLevels(p)]).toEqual([1, 2]);
  });
  it("treats empty levels as complete so they never block", () => {
    const p = [mk(1, 10, 10), mk(2, 0, 0), mk(3, 0, 5)];
    expect([...unlockedLevels(p)]).toEqual([1, 2, 3]);
  });
  it("works regardless of input order", () => {
    const p = [mk(3, 0, 5), mk(1, 10, 10), mk(2, 5, 5)];
    expect([...unlockedLevels(p)]).toEqual([1, 2, 3]);
  });
  it("currentLevel is the first unfinished level", () => {
    expect(currentLevel([mk(1, 10, 10), mk(2, 4, 10), mk(3, 0, 10)])).toBe(2);
    expect(currentLevel([mk(1, 10, 10), mk(2, 10, 10)])).toBe(2);
    expect(currentLevel([])).toBe(1);
  });
});
