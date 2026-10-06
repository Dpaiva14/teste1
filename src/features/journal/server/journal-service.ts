import "server-only";
import { prisma, type Prisma } from "@/database/client";
import { awardXp, evaluateAchievements, recordActivity, XP } from "@/features/gamification/server/gamification-service";
import { classifySession } from "@/features/sessions/logic/sessions";
import { bestAndWorst, groupPerformance, performanceStats } from "@/features/stats/logic/performance";
import { behaviorSummary } from "@/features/trading/logic/behavior";
import { readChecklist } from "@/features/trading/server/execution";
import type { SessionUser } from "@/lib/auth/session";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { roundTo } from "@/lib/money";
import { computeEntryNumbers, MissingResultError } from "../logic/numbers";
import type { JournalInput } from "../schemas";
import type { JournalEntryDTO, JournalStatsDTO } from "../types";

type Row = Prisma.JournalEntryGetPayload<object>;

function numbersOrBadRequest(input: JournalInput) {
  try {
    return computeEntryNumbers(input);
  } catch (e) {
    if (e instanceof MissingResultError) throw badRequest(e.message);
    throw e;
  }
}

export function toDTO(e: Row): JournalEntryDTO {
  return {
    id: e.id, tradeId: e.tradeId, tradeDate: e.tradeDate.toISOString(), instrument: e.instrument, direction: e.direction, timeframe: e.timeframe, setup: e.setup,
    session: e.session, entryPrice: e.entryPrice, stopLoss: e.stopLoss, takeProfit: e.takeProfit, exitPrice: e.exitPrice, contracts: e.contracts, riskAmount: e.riskAmount,
    result: e.result, rMultiple: e.rMultiple, emotionalState: e.emotionalState, mistakes: e.mistakes, mistakeNote: e.mistakeNote, lesson: e.lesson, notes: e.notes,
    followedPlan: e.followedPlan, processRating: e.processRating, screenshotBeforeId: e.screenshotBeforeId, screenshotAfterId: e.screenshotAfterId,
  };
}

async function assertAssets(user: SessionUser, ids: (string | null | undefined)[]) {
  for (const id of ids) {
    if (!id) continue;
    const a = await prisma.mediaAsset.findFirst({ where: { id, ownerId: user.id, kind: "IMAGE" }, select: { id: true } });
    if (!a) throw badRequest("Screenshot inválido.");
  }
}

export async function createEntry(user: SessionUser, input: JournalInput) {
  await assertAssets(user, [input.screenshotBeforeId, input.screenshotAfterId]);
  if (input.tradeId) {
    const trade = await prisma.trade.findFirst({ where: { id: input.tradeId, userId: user.id }, select: { id: true } });
    if (!trade) throw notFound("Trade não encontrado.");
    if (await prisma.journalEntry.findUnique({ where: { tradeId: input.tradeId }, select: { id: true } })) throw conflict("Este trade já tem uma entrada no journal.");
  }
  const nums = numbersOrBadRequest(input);
  const entry = await prisma.journalEntry.create({
    data: {
      userId: user.id,
      tradeId: input.tradeId ?? null,
      tradeDate: input.tradeDate,
      instrument: input.instrument,
      direction: input.direction,
      timeframe: input.timeframe,
      setup: input.setup,
      session: classifySession(input.tradeDate),
      entryPrice: input.entryPrice,
      stopLoss: input.stopLoss,
      takeProfit: input.takeProfit ?? null,
      exitPrice: input.exitPrice ?? null,
      contracts: input.contracts,
      ...nums,
      emotionalState: input.emotionalState,
      mistakes: input.mistakes,
      mistakeNote: input.mistakeNote ?? null,
      lesson: input.lesson ?? null,
      notes: input.notes ?? null,
      followedPlan: input.followedPlan ?? null,
      processRating: input.processRating ?? null,
      screenshotBeforeId: input.screenshotBeforeId ?? null,
      screenshotAfterId: input.screenshotAfterId ?? null,
    },
  });
  // XP rewards REVIEW (a written lesson + a process rating), never the act of trading.
  let xp = 0;
  if (entry.lesson && entry.processRating) xp = await awardXp(user.id, "JOURNAL_REVIEW", entry.id, XP.journalReview);
  await recordActivity(user.id);
  const newAchievements = await evaluateAchievements(user.id);
  return { entry: toDTO(entry), xpAwarded: xp, newAchievements };
}

export async function updateEntry(user: SessionUser, id: string, input: JournalInput) {
  const existing = await prisma.journalEntry.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw notFound("Entrada não encontrada.");
  await assertAssets(user, [input.screenshotBeforeId, input.screenshotAfterId]);
  const nums = numbersOrBadRequest(input);
  const entry = await prisma.journalEntry.update({
    where: { id },
    data: {
      tradeDate: input.tradeDate, instrument: input.instrument, direction: input.direction, timeframe: input.timeframe, setup: input.setup, session: classifySession(input.tradeDate),
      entryPrice: input.entryPrice, stopLoss: input.stopLoss, takeProfit: input.takeProfit ?? null, exitPrice: input.exitPrice ?? null, contracts: input.contracts, ...nums,
      emotionalState: input.emotionalState, mistakes: input.mistakes, mistakeNote: input.mistakeNote ?? null, lesson: input.lesson ?? null, notes: input.notes ?? null,
      followedPlan: input.followedPlan ?? null, processRating: input.processRating ?? null, screenshotBeforeId: input.screenshotBeforeId ?? null, screenshotAfterId: input.screenshotAfterId ?? null,
    },
  });
  let xp = 0;
  if (entry.lesson && entry.processRating) xp = await awardXp(user.id, "JOURNAL_REVIEW", entry.id, XP.journalReview);
  const newAchievements = await evaluateAchievements(user.id);
  return { entry: toDTO(entry), xpAwarded: xp, newAchievements };
}

export async function deleteEntry(user: SessionUser, id: string) {
  const res = await prisma.journalEntry.deleteMany({ where: { id, userId: user.id } });
  if (res.count === 0) throw notFound("Entrada não encontrada.");
}

export async function getEntry(user: SessionUser, id: string) {
  const e = await prisma.journalEntry.findFirst({ where: { id, userId: user.id } });
  if (!e) throw notFound("Entrada não encontrada.");
  return toDTO(e);
}

export async function listEntries(user: SessionUser, opts: { limit: number; cursor?: string; setup?: string }) {
  const rows = await prisma.journalEntry.findMany({
    where: { userId: user.id, ...(opts.setup ? { setup: opts.setup } : {}) },
    orderBy: [{ tradeDate: "desc" }, { id: "desc" }],
    take: opts.limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > opts.limit;
  const page = hasMore ? rows.slice(0, opts.limit) : rows;
  return { entries: page.map(toDTO), nextCursor: hasMore ? page[page.length - 1]!.id : null };
}

/** Pre-fills a journal form from a simulated trade (spec: simulator ↔ journal). */
export async function prefillFromTrade(user: SessionUser, tradeId: string) {
  const t = await prisma.trade.findFirst({ where: { id: tradeId, userId: user.id, status: "CLOSED" }, include: { simulationAccount: { select: { feedTimeframe: true } }, journalEntry: { select: { id: true } } } });
  if (!t) return null;
  if (t.journalEntry) return { existingEntryId: t.journalEntry.id };
  return {
    tradeId: t.id, instrument: t.symbol, direction: t.direction, timeframe: t.simulationAccount?.feedTimeframe ?? "M5", entryPrice: t.entryPrice, stopLoss: t.stopLoss ?? t.entryPrice,
    takeProfit: t.takeProfit, exitPrice: t.exitPrice, contracts: t.contracts, result: t.pnl, riskAmount: t.riskAmount, closedAt: (t.closedAt ?? t.openedAt).toISOString(),
    emotionalState: "CALM", entryReason: t.entryReason,
  };
}

export async function getStats(user: SessionUser): Promise<JournalStatsDTO> {
  const rows = await prisma.journalEntry.findMany({ where: { userId: user.id }, orderBy: { tradeDate: "asc" }, include: { trade: { select: { entryReason: true, checklist: true, stopLoss: true } } } });
  const perf = rows.map((r) => ({ pnl: r.result, r: r.rMultiple, setup: r.setup, session: r.session, emotion: r.emotionalState }));
  const bySetup = groupPerformance(perf, (t) => t.setup);
  const bySession = groupPerformance(perf, (t) => t.session);
  const byEmotion = groupPerformance(perf, (t) => t.emotion);
  const setupBW = bestAndWorst(bySetup);
  const sessionBW = bestAndWorst(bySession);

  const mistakeCount = new Map<string, number>();
  for (const r of rows) for (const m of r.mistakes) mistakeCount.set(m, (mistakeCount.get(m) ?? 0) + 1);
  const rated = rows.filter((r) => r.processRating !== null);
  const planKnown = rows.filter((r) => r.followedPlan !== null);

  // "Was my process correct, regardless of the result?" — 2×2 of process quality vs outcome.
  const good = (r: Row) => (r.processRating ?? 0) >= 4;
  const poor = (r: Row) => r.processRating !== null && r.processRating <= 2;
  const grid = {
    goodProcessWin: rows.filter((r) => good(r) && r.result > 0).length,
    goodProcessLoss: rows.filter((r) => good(r) && r.result < 0).length,
    poorProcessWin: rows.filter((r) => poor(r) && r.result > 0).length,
    poorProcessLoss: rows.filter((r) => poor(r) && r.result < 0).length,
  };

  const behavior = behaviorSummary(
    rows.filter((r) => r.trade).map((r) => {
      const cl = readChecklist(r.trade!.checklist);
      return { entryReason: r.trade!.entryReason, rMultiple: r.rMultiple, checklistPercent: cl.percent ?? null, hadStop: r.trade!.stopLoss !== null, rewardRisk: cl.rewardRisk ?? null };
    }),
  );

  return {
    stats: performanceStats(perf),
    bySetup, bySession, byEmotion,
    bestSetup: setupBW?.best ?? null, worstSetup: setupBW?.worst ?? null,
    bestSession: sessionBW?.best ?? null, worstSession: sessionBW?.worst ?? null,
    mistakes: [...mistakeCount.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count),
    avgProcessRating: rated.length ? roundTo(rated.reduce((s, r) => s + (r.processRating ?? 0), 0) / rated.length, 2) : null,
    followedPlanPercent: planKnown.length ? roundTo((planKnown.filter((r) => r.followedPlan).length / planKnown.length) * 100, 1) : null,
    processVsOutcome: grid,
    behavior,
  };
}
