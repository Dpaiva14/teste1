/** Pure quiz grading. Never trusts the client: the server loads the key and calls these. */

export interface GradableAnswer {
  id: string;
  isCorrect: boolean;
  explanation?: string | null;
}

export interface GradableQuestion {
  id: string;
  type: string;
  points: number;
  answers: readonly GradableAnswer[];
  numericAnswer: number | null;
  numericTolerance: number | null;
}

export interface QuestionResponse {
  optionId?: string | undefined;
  value?: number | undefined;
}

export interface QuestionResult {
  questionId: string;
  correct: boolean;
  /** true when the student did not answer */
  skipped: boolean;
  correctOptionIds: string[];
  expectedNumeric: number | null;
  numericTolerance: number | null;
  givenOptionId: string | null;
  givenValue: number | null;
}

export function isNumericQuestion(q: Pick<GradableQuestion, "numericAnswer">): boolean {
  return q.numericAnswer !== null;
}

export function gradeQuestion(q: GradableQuestion, response: QuestionResponse | undefined): QuestionResult {
  const base = {
    questionId: q.id,
    correctOptionIds: q.answers.filter((a) => a.isCorrect).map((a) => a.id),
    expectedNumeric: q.numericAnswer,
    numericTolerance: q.numericTolerance,
    givenOptionId: response?.optionId ?? null,
    givenValue: response?.value ?? null,
  };

  if (isNumericQuestion(q)) {
    const v = response?.value;
    if (v === undefined || !Number.isFinite(v)) return { ...base, correct: false, skipped: true };
    const tol = q.numericTolerance ?? 0;
    return { ...base, correct: Math.abs(v - (q.numericAnswer as number)) <= tol + 1e-9, skipped: false };
  }

  const picked = response?.optionId;
  if (!picked) return { ...base, correct: false, skipped: true };
  const answer = q.answers.find((a) => a.id === picked);
  return { ...base, correct: Boolean(answer?.isCorrect), skipped: false };
}

export interface QuizGrade {
  results: QuestionResult[];
  correctCount: number;
  totalCount: number;
  /** points-weighted percentage, 0..100, rounded */
  scorePercent: number;
}

export function gradeQuiz(questions: readonly GradableQuestion[], responses: Readonly<Record<string, QuestionResponse>>): QuizGrade {
  const results = questions.map((q) => gradeQuestion(q, responses[q.id]));
  const totalPoints = questions.reduce((s, q) => s + q.points, 0);
  const earned = questions.reduce((s, q, i) => s + (results[i]!.correct ? q.points : 0), 0);
  return {
    results,
    correctCount: results.filter((r) => r.correct).length,
    totalCount: questions.length,
    scorePercent: totalPoints === 0 ? 0 : Math.round((earned / totalPoints) * 100),
  };
}
