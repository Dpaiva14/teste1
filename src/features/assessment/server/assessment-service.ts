import "server-only";
import { prisma, type Prisma } from "@/database/client";
import { computeUnlocked } from "@/features/academy/server/progress-service";
import { awardXp, evaluateAchievements, recordActivity, XP } from "@/features/gamification/server/gamification-service";
import { demoStartFromSeed, loadSeries, randomSeed } from "@/features/trading/server/feed";
import type { SessionUser } from "@/lib/auth/session";
import { badRequest, conflict, forbidden, notFound } from "@/lib/errors";
import type { Candle } from "@/lib/market-data/types";
import { UNLOCK_THRESHOLD } from "@/modules/levels";
import { analyzeChart, pickDecisionIndex } from "../logic/analysis";
import { evaluateAssessment } from "../logic/evaluate";
import { revealOutcome } from "../logic/outcome";
import {
  ACCOUNT_BALANCE,
  ASSESSMENT_FEED_SYMBOL,
  ASSESSMENT_SYMBOL,
  ASSESSMENT_TIMEFRAME,
  MAX_ATTEMPTS,
  MAX_DECISION_INDEX,
  MIN_DECISION_INDEX,
  PASS_SCORE,
  REVEAL_BARS,
  RISK_PERCENT,
  TOTAL_BARS,
  VISIBLE_WINDOW,
  answersSchema,
  completenessProblems,
  type Answers,
} from "../schemas";
import type { AssessmentListItemDTO, AssessmentOverviewDTO, AssessmentReportDTO, AssessmentStateDTO, StoredReview } from "../types";

/** The assessment belongs to the last level (Professional Development): it opens with that level. */
export const ASSESSMENT_LEVEL = 10;

type Row = Prisma.FinalAssessmentGetPayload<object>;

async function owned(user: SessionUser, id: string): Promise<Row> {
  const row = await prisma.finalAssessment.findFirst({ where: { id, userId: user.id } });
  if (!row) throw notFound("Avaliação não encontrada.");
  return row;
}

async function seriesFor(seed: number): Promise<Candle[]> {
  return loadSeries({ symbol: ASSESSMENT_FEED_SYMBOL, timeframe: ASSESSMENT_TIMEFRAME, seed, start: demoStartFromSeed(seed), count: TOTAL_BARS });
}

/** Deterministic split of a seed's series into what the student sees and what is revealed after submission. */
async function splitFor(seed: number) {
  const series = await seriesFor(seed);
  const max = Math.min(MAX_DECISION_INDEX, series.length - REVEAL_BARS - 1);
  if (series.length < MIN_DECISION_INDEX + REVEAL_BARS || max < MIN_DECISION_INDEX) throw badRequest("Não foi possível gerar dados suficientes para a avaliação.");
  const decisionIndex = pickDecisionIndex(series, seed, MIN_DECISION_INDEX, max);
  return { series, decisionIndex, visible: series.slice(0, decisionIndex), future: series.slice(decisionIndex, decisionIndex + REVEAL_BARS) };
}

function readAnswers(json: unknown): Answers {
  const parsed = answersSchema.safeParse(json ?? {});
  return parsed.success ? parsed.data : answersSchema.parse({});
}

function readReview(json: unknown): StoredReview | null {
  if (!json || typeof json !== "object") return null;
  const r = json as Partial<StoredReview>;
  return r.version === 1 && r.evaluation && r.outcome && r.reference && typeof r.decisionIndex === "number" ? (r as StoredReview) : null;
}

const toListItem = (r: Row): AssessmentListItemDTO => ({
  id: r.id,
  status: r.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
  processScore: r.processScore,
  grade: readReview(r.review)?.evaluation.grade ?? null,
  createdAt: r.createdAt.toISOString(),
  submittedAt: r.submittedAt?.toISOString() ?? null,
});

export async function getOverview(user: SessionUser): Promise<AssessmentOverviewDTO> {
  const [unlock, rows] = await Promise.all([computeUnlocked(user), prisma.finalAssessment.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: MAX_ATTEMPTS })]);
  const gateProgress = unlock.levelProgress.find((p) => p.level === ASSESSMENT_LEVEL - 1);
  const attempts = rows.map(toListItem);
  const scores = attempts.map((a) => a.processScore).filter((s): s is number => s !== null);
  const best = scores.length ? Math.max(...scores) : null;
  return {
    unlocked: unlock.unlocked.has(ASSESSMENT_LEVEL),
    gate: {
      level: ASSESSMENT_LEVEL - 1,
      completedLessons: gateProgress?.completedLessons ?? 0,
      totalLessons: gateProgress?.totalLessons ?? 0,
      neededLessons: Math.ceil((gateProgress?.totalLessons ?? 0) * UNLOCK_THRESHOLD),
    },
    attempts,
    inProgressId: rows.find((r) => r.status === "IN_PROGRESS")?.id ?? null,
    bestScore: best,
    passed: best !== null && best >= PASS_SCORE,
  };
}

export async function startAssessment(user: SessionUser): Promise<{ id: string }> {
  const unlock = await computeUnlocked(user);
  if (!unlock.unlocked.has(ASSESSMENT_LEVEL)) throw forbidden("A avaliação final abre quando completares o nível anterior (80% das aulas).");
  const existing = await prisma.finalAssessment.findFirst({ where: { userId: user.id, status: "IN_PROGRESS" }, select: { id: true } });
  if (existing) return existing; // one attempt at a time: resume it
  const total = await prisma.finalAssessment.count({ where: { userId: user.id } });
  if (total >= MAX_ATTEMPTS) throw conflict(`Atingiste o máximo de ${MAX_ATTEMPTS} tentativas.`);
  return prisma.finalAssessment.create({ data: { userId: user.id, seed: randomSeed(), answers: answersSchema.parse({}) as Prisma.InputJsonValue }, select: { id: true } });
}

export async function abandonAssessment(user: SessionUser, id: string): Promise<void> {
  const row = await owned(user, id);
  if (row.status !== "IN_PROGRESS") throw conflict("Só é possível abandonar uma avaliação em curso.");
  await prisma.finalAssessment.deleteMany({ where: { id, userId: user.id, status: "IN_PROGRESS" } });
}

export async function saveDraft(user: SessionUser, id: string, answers: Answers): Promise<void> {
  const res = await prisma.finalAssessment.updateMany({ where: { id, userId: user.id, status: "IN_PROGRESS" }, data: { answers: answers as Prisma.InputJsonValue } });
  if (res.count === 0) {
    await owned(user, id); // 404 when it isn't theirs
    throw conflict("Esta avaliação já foi submetida.");
  }
}

export async function getAssessmentState(user: SessionUser, id: string): Promise<AssessmentStateDTO> {
  const row = await owned(user, id);
  const { decisionIndex, visible, future } = await splitFor(row.seed);
  const windowStart = Math.max(0, decisionIndex - VISIBLE_WINDOW);
  const facts = analyzeChart(visible);
  const answers = readAnswers(row.answers);

  let report: AssessmentReportDTO | null = null;
  if (row.status === "COMPLETED") {
    const review = readReview(row.review);
    if (review) {
      report = {
        processScore: row.processScore ?? review.evaluation.score,
        passed: (row.processScore ?? review.evaluation.score) >= PASS_SCORE,
        evaluation: review.evaluation,
        outcome: review.outcome,
        reference: review.reference,
        revealCandles: future,
        submittedAt: (row.submittedAt ?? row.createdAt).toISOString(),
        xpAwarded: 0,
        newAchievements: [],
      };
    }
  }
  return {
    id: row.id,
    status: row.status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
    symbol: ASSESSMENT_SYMBOL,
    timeframe: ASSESSMENT_TIMEFRAME,
    account: { balance: ACCOUNT_BALANCE, riskPercent: RISK_PERCENT, riskBudget: (ACCOUNT_BALANCE * RISK_PERCENT) / 100 },
    candles: visible.slice(windowStart),
    windowStart,
    decisionIndex,
    atr: facts.atr,
    lastClose: facts.lastClose,
    answers,
    report,
  };
}

export async function submitAssessment(user: SessionUser, id: string): Promise<AssessmentStateDTO> {
  const row = await owned(user, id);
  if (row.status !== "IN_PROGRESS") throw conflict("Esta avaliação já foi submetida.");
  const answers = readAnswers(row.answers);
  const problems = completenessProblems(answers);
  if (problems.length > 0) throw badRequest(`Ainda falta completar: ${problems.slice(0, 4).join(" ")}${problems.length > 4 ? ` (+${problems.length - 4})` : ""}`, { problems });

  const { decisionIndex, visible, future } = await splitFor(row.seed);
  const facts = analyzeChart(visible);
  // The score only ever sees the answers and the facts of the VISIBLE chart; the outcome is computed separately, for information.
  const evaluation = evaluateAssessment(answers, facts);
  const outcome = revealOutcome(answers, future, decisionIndex);
  const review: StoredReview = { version: 1, decisionIndex, evaluation, outcome, reference: { levels: facts.levels, pools: facts.pools, zones: facts.zones, legs: facts.legs } };

  const res = await prisma.finalAssessment.updateMany({
    where: { id, userId: user.id, status: "IN_PROGRESS" },
    data: { status: "COMPLETED", processScore: evaluation.score, review: review as unknown as Prisma.InputJsonValue, submittedAt: new Date() },
  });
  if (res.count === 0) throw conflict("Esta avaliação já foi submetida.");

  // XP is paid once, ever, and only for a passing process — never for the market outcome.
  let xp = 0;
  if (evaluation.score >= PASS_SCORE) xp = await awardXp(user.id, "FINAL_ASSESSMENT", "final", XP.finalAssessment);
  await recordActivity(user.id);
  const newAchievements = (await evaluateAchievements(user.id)).map((a) => a.title);

  const state = await getAssessmentState(user, id);
  if (state.report) state.report = { ...state.report, xpAwarded: xp, newAchievements };
  return state;
}
