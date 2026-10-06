import type { DiagramId, ExerciseSpec, VisualSpec } from "@/modules/types";
import type { DevelopmentStage } from "@/modules/levels";
import type { AchievementDef } from "@/modules/achievements";
import type { Candle } from "@/lib/market-data/types";

export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface ModuleSummaryDTO {
  id: string;
  slug: string;
  number: number;
  level: number;
  title: string;
  summary: string;
  difficulty: string;
  icon: string | null;
  estimatedMinutes: number;
  lessonCount: number;
  completedLessons: number;
  quiz: { id: string; bestScore: number | null; passed: boolean; passScore: number } | null;
}

export interface LevelDTO {
  level: number;
  slug: string;
  title: string;
  tagline: string;
  stage: DevelopmentStage;
  unlocked: boolean;
  /** 0..1 share of lessons completed */
  completion: number;
  modules: ModuleSummaryDTO[];
}

export interface CurriculumDTO {
  levels: LevelDTO[];
  currentLevel: number;
  totals: {
    lessons: number;
    completedLessons: number;
    modules: number;
    completedModules: number;
    quizzesPassed: number;
    quizzesTotal: number;
    averageScore: number | null;
  };
  nextLesson: { moduleSlug: string; lessonSlug: string; moduleTitle: string; lessonTitle: string; moduleNumber: number } | null;
}

export interface QuizQuestionDTO {
  id: string;
  type: string;
  prompt: string;
  chartRef: string | null;
  /** present only for numeric questions */
  numeric: { unit: string | null } | null;
  options: { id: string; text: string }[];
}

export interface QuizDTO {
  id: string;
  title: string;
  passScore: number;
  bestScore: number | null;
  attempts: number;
  questions: QuizQuestionDTO[];
  /** Chart data for chart-based questions, keyed by scenario id (no annotations: that would leak answers). */
  charts: Record<string, QuizChartDTO>;
}

export interface QuizChartDTO {
  scenarioId: string;
  symbol: string;
  timeframe: string;
  priceDecimals: number;
  candles: Candle[];
}

export interface QuestionFeedbackDTO {
  questionId: string;
  correct: boolean;
  skipped: boolean;
  explanation: string;
  correctOptionIds: string[];
  givenOptionId: string | null;
  givenValue: number | null;
  expectedNumeric: number | null;
  numericTolerance: number | null;
  numericUnit: string | null;
  /** per-option feedback ("porque é que esta opção está errada") */
  optionFeedback: Record<string, string>;
}

export interface QuizResultDTO {
  attemptId: string;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  passed: boolean;
  passScore: number;
  xpAwarded: number;
  lessonCompleted: boolean;
  newAchievements: AchievementDef[];
  feedback: QuestionFeedbackDTO[];
}

export interface LessonNavDTO {
  slug: string;
  title: string;
  moduleSlug: string;
}

export interface LessonDTO {
  id: string;
  slug: string;
  number: number;
  title: string;
  summary: string;
  difficulty: string;
  content: string;
  example: string | null;
  visual: VisualSpec | null;
  exercise: ExerciseSpec | null;
  takeaways: string[];
  videoUrl: string | null;
  estimatedMinutes: number;
  xpReward: number;
  status: LessonStatus;
  module: { id: string; slug: string; number: number; title: string; level: number; icon: string | null; lessonCount: number };
  assets: { id: string; filename: string; kind: "IMAGE" | "PDF" }[];
  prev: LessonNavDTO | null;
  next: LessonNavDTO | null;
  /** When this is the last lesson of the module, points to the module quiz / next module. */
  moduleQuizId: string | null;
  nextModule: { slug: string; title: string; number: number } | null;
  quiz: QuizDTO | null;
}

export interface ModuleDetailDTO {
  module: ModuleSummaryDTO;
  levelTitle: string;
  levelUnlocked: boolean;
  lessons: { id: string; slug: string; number: number; title: string; summary: string; minutes: number; status: LessonStatus; bestQuizScore: number | null }[];
  moduleQuiz: QuizDTO | null;
}

export type { DiagramId };
