import type { QuizInput } from "./schemas";

export interface AdminModuleRow {
  id: string;
  number: number;
  level: number;
  title: string;
  difficulty: string;
  published: boolean;
  managedBySeed: boolean;
  lessons: number;
  questions: number;
}

export interface AdminLessonRow {
  id: string;
  number: number;
  slug: string;
  title: string;
  published: boolean;
  managedBySeed: boolean;
  questions: number;
}

export interface AdminModuleDetail {
  id: string;
  number: number;
  slug: string;
  level: number;
  title: string;
  summary: string;
  difficulty: string;
  estimatedMinutes: number;
  published: boolean;
  managedBySeed: boolean;
  lessons: AdminLessonRow[];
  quiz: QuizInput | null;
}

export interface AdminAsset {
  id: string;
  filename: string;
  kind: "IMAGE" | "PDF";
  sizeBytes: number;
}

export interface AdminLessonDetail {
  id: string;
  moduleId: string;
  moduleTitle: string;
  moduleSlug: string;
  number: number;
  slug: string;
  title: string;
  summary: string;
  difficulty: string;
  content: string;
  example: string | null;
  takeaways: string[];
  videoUrl: string | null;
  estimatedMinutes: number;
  xpReward: number;
  published: boolean;
  managedBySeed: boolean;
  hasVisual: boolean;
  hasExercise: boolean;
  assets: AdminAsset[];
  quiz: QuizInput | null;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  disabled: boolean;
  xp: number;
  createdAt: string;
  lastActiveOn: string | null;
}

export interface AdminEventRow {
  id: string;
  title: string;
  country: string;
  category: string;
  impact: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  scheduledAt: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  description: string | null;
  source: string | null;
  sourceUrl: string | null;
  isDemo: boolean;
}

export interface AdminGlossaryRow {
  id: string;
  slug: string;
  term: string;
  category: string;
  definition: string;
  simpleExplanation: string;
  technicalExplanation: string;
  example: string;
  related: string[];
}

export interface AdminStats {
  users: { total: number; students: number; admins: number; disabled: number; new7d: number; active7d: number };
  content: { modules: number; lessons: number; publishedLessons: number; questions: number };
  learning: { lessonsCompleted: number; quizAttempts: number; avgScore: number | null; passRate: number | null };
  practice: { simulatorTrades: number; replayTrades: number; backtestDecisions: number; journalEntries: number; dailyPlans: number; tutorConversations: number };
  topLessons: { title: string; completions: number }[];
  hardestQuizzes: { title: string; attempts: number; avgScore: number }[];
  recentUsers: { name: string; email: string; createdAt: string }[];
}
