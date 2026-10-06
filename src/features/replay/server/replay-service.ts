import "server-only";
import { prisma, type Prisma, type Trade } from "@/database/client";
import { awardXp, evaluateAchievements, recordActivity, XP } from "@/features/gamification/server/gamification-service";
import { performanceStats } from "@/features/stats/logic/performance";
import { advanceAccount, type AdvTrade } from "@/features/trading/logic/advance";
import { accountSnapshot, closeMath, costsFor } from "@/features/trading/logic/engine";
import { evaluateTrade, type TradeEvaluation } from "@/features/trading/logic/evaluation";
import type { OpenTradeInput } from "@/features/trading/schemas";
import { toTradeDTO } from "@/features/trading/server/dto";
import { buildOpenTrade, readChecklist } from "@/features/trading/server/execution";
import { demoStartFromSeed, loadSeries, randomSeed } from "@/features/trading/server/feed";
import type { SessionUser } from "@/lib/auth/session";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { isTimeframe, type Timeframe } from "@/lib/market-data/types";
import { roundMoney } from "@/lib/money";
import { isPrepared } from "../logic/drawings";
import { reviewSession, type ReviewTrade } from "../logic/review";
import { drawingsSchema, MAX_DRAWINGS, type CreateReplayInput, type Drawing } from "../schemas";
import type { ReplayListItemDTO, ReplayStateDTO } from "../types";

const INITIAL_BALANCE = 10_000;
const INITIAL_CURSOR = 200;
const TOTAL_BARS = 1500;
const WINDOW = 300;
const MAX_ACTIVE = 8;
const MAX_OPEN_TRADES = 5;
const FEED_SYMBOL = "YM";
const SYMBOLS = ["YM", "MYM", "US30"] as const;

type Session = Prisma.ReplaySessionGetPayload<object>;

async function owned(user: SessionUser, id: string): Promise<Session> {
  const s = await prisma.replaySession.findFirst({ where: { id, userId: user.id } });
  if (!s) throw notFound("Sessão de replay não encontrada.");
  return s;
}

function seriesFor(s: Pick<Session, "timeframe" | "seed" | "totalBars">) {
  const tf: Timeframe = isTimeframe(s.timeframe) ? s.timeframe : "M5";
  return loadSeries({ symbol: FEED_SYMBOL, timeframe: tf, seed: s.seed, start: demoStartFromSeed(s.seed), count: s.totalBars });
}

function readDrawings(json: unknown): Drawing[] {
  const parsed = drawingsSchema.safeParse(json);
  return parsed.success ? parsed.data : [];
}

function evaluateStored(t: Trade): { evaluation: TradeEvaluation; review: ReviewTrade } {
  const cl = readChecklist(t.checklist);
  const evaluation = evaluateTrade({
    hasStop: t.stopLoss !== null,
    rewardRisk: cl.rewardRisk ?? null,
    riskPercent: cl.riskPercent ?? null,
    checklistPercent: cl.percent ?? null,
    prepared: Boolean(cl.prepared),
    entryReason: t.entryReason,
    exitedBy: t.exitReason,
    hasThesis: Boolean(t.thesis && t.thesis.trim().length > 0),
  });
  const emotional = t.entryReason !== null && t.entryReason !== "SETUP_VALID" && t.entryReason !== "OTHER";
  return { evaluation, review: { id: t.id, evaluation, prepared: Boolean(cl.prepared), hasStop: t.stopLoss !== null, emotional } };
}

export async function listReplays(user: SessionUser): Promise<ReplayListItemDTO[]> {
  const rows = await prisma.replaySession.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 30, include: { _count: { select: { trades: true } } } });
  return rows.map((r) => ({ id: r.id, symbol: r.symbol, timeframe: r.timeframe, startDate: r.startDate.toISOString(), status: r.status, trades: r._count.trades, createdAt: r.createdAt.toISOString() }));
}

export async function createReplay(user: SessionUser, input: CreateReplayInput): Promise<{ id: string }> {
  const active = await prisma.replaySession.count({ where: { userId: user.id, status: "IN_PROGRESS" } });
  if (active >= MAX_ACTIVE) throw conflict(`Máximo de ${MAX_ACTIVE} sessões em curso. Termina ou apaga uma para criar outra.`);
  const seed = randomSeed();
  const series = await seriesFor({ timeframe: input.timeframe, seed, totalBars: TOTAL_BARS });
  const first = series[0];
  if (!first || series.length < INITIAL_CURSOR + 100) throw badRequest("Não foi possível gerar dados suficientes para esta sessão.");
  return prisma.replaySession.create({
    data: { userId: user.id, symbol: input.symbol, timeframe: input.timeframe, startDate: new Date(first.time * 1000), seed, cursor: INITIAL_CURSOR, totalBars: series.length },
    select: { id: true },
  });
}

export async function deleteReplay(user: SessionUser, id: string) {
  await owned(user, id);
  await prisma.replaySession.delete({ where: { id } });
}

async function buildState(user: SessionUser, id: string, warnings: string[] = []): Promise<ReplayStateDTO> {
  const s = await owned(user, id);
  const series = await seriesFor(s);
  const cursor = Math.min(s.cursor, series.length);
  const windowStart = Math.max(0, cursor - WINDOW);
  const raw = series.slice(windowStart, cursor);
  const last = series[cursor - 1];
  if (!last) throw badRequest("Feed vazio.");

  const basis = Object.fromEntries(SYMBOLS.map((x) => [x, costsFor(x).basisPoints])) as Record<string, number>;
  const bids = Object.fromEntries(SYMBOLS.map((x) => [x, last.close + (basis[x] ?? 0)])) as Record<string, number>;
  const shift = basis[s.symbol] ?? 0;
  const candles = shift === 0 ? raw : raw.map((c) => ({ ...c, open: c.open + shift, high: c.high + shift, low: c.low + shift, close: c.close + shift }));

  const trades = await prisma.trade.findMany({ where: { replaySessionId: id }, orderBy: { openedAt: "asc" }, include: { journalEntry: { select: { id: true } } } });
  const open = trades.filter((t) => t.status === "OPEN");
  const closed = trades.filter((t) => t.status === "CLOSED");
  const stats = performanceStats(closed.map((t) => ({ pnl: t.pnl ?? 0, r: t.rMultiple })), { startingBalance: INITIAL_BALANCE });
  const balance = roundMoney(INITIAL_BALANCE + closed.reduce((sum, t) => sum + (t.pnl ?? 0), 0));
  const snapshot = accountSnapshot({
    balance,
    openTrades: open.map((t) => ({ symbol: t.symbol, direction: t.direction, contracts: t.contracts, entryPrice: t.entryPrice })),
    bids,
    dayStartEquity: INITIAL_BALANCE,
    peakEquity: Math.max(INITIAL_BALANCE, ...stats.equityCurve),
    maxDrawdown: stats.maxDrawdown,
  });

  const evals = closed.map(evaluateStored);
  return {
    id: s.id,
    symbol: s.symbol,
    timeframe: s.timeframe,
    startDate: s.startDate.toISOString(),
    status: s.status,
    initialBalance: INITIAL_BALANCE,
    snapshot,
    cursor,
    totalBars: series.length,
    finished: s.status === "COMPLETED" || cursor >= series.length,
    candles,
    windowStart,
    bids,
    basis,
    openTrades: open.map(toTradeDTO),
    closedTrades: closed.map(toTradeDTO).slice(-50).reverse(),
    evaluations: Object.fromEntries(evals.map((e) => [e.review.id, e.evaluation])),
    drawings: readDrawings(s.drawings),
    review: reviewSession(evals.map((e) => e.review)),
    stats,
    warnings,
  };
}

export const getReplayState = (user: SessionUser, id: string) => buildState(user, id);

async function activeSession(user: SessionUser, id: string): Promise<Session> {
  const s = await owned(user, id);
  if (s.status !== "IN_PROGRESS") throw conflict("Esta sessão já terminou.");
  return s;
}

/** Closes every open trade at the current price, stores the process review and marks the session completed. */
async function finalize(user: SessionUser, s: Session): Promise<void> {
  const series = await seriesFor(s);
  const last = series[Math.min(s.cursor, series.length) - 1];
  if (!last) throw badRequest("Feed vazio.");
  const review = await prisma.$transaction(async (tx) => {
    const open = await tx.trade.findMany({ where: { replaySessionId: s.id, status: "OPEN" } });
    for (const t of open) {
      const math = closeMath({ symbol: t.symbol, direction: t.direction, contracts: t.contracts, entry: t.entryPrice, stop: t.stopLoss, level: last.close + costsFor(t.symbol).basisPoints });
      await tx.trade.update({
        where: { id: t.id },
        data: { status: "CLOSED", exitReason: "END_OF_DATA", exitPrice: math.exitPrice, pnl: math.net, fees: math.fees, rMultiple: math.rMultiple, closedAt: new Date(), closeBarIndex: s.cursor - 1 },
      });
    }
    const closed = await tx.trade.findMany({ where: { replaySessionId: s.id, status: "CLOSED" } });
    const result = reviewSession(closed.map((t) => evaluateStored(t).review));
    await tx.replaySession.update({
      where: { id: s.id },
      data: { status: "COMPLETED", evaluation: { averageScore: result.averageScore, grade: result.grade, trades: result.trades, notes: result.notes } as Prisma.InputJsonValue },
    });
    return result;
  });
  // XP rewards a well-prepared session (average PROCESS score), never the P&L. Capped per 24 h like any exercise.
  // Awarded outside the transaction: a unique-violation (already paid) would otherwise abort it.
  if (review.averageScore !== null && review.averageScore >= 70) await awardXp(user.id, "EXERCISE", `replay:${s.id}`, XP.exercisePass);
  await recordActivity(user.id);
  await evaluateAchievements(user.id);
}

export async function finishReplay(user: SessionUser, id: string) {
  const s = await activeSession(user, id);
  await finalize(user, s);
  return buildState(user, id);
}

export async function advanceReplay(user: SessionUser, id: string, bars: number) {
  const s = await activeSession(user, id);
  const series = await seriesFor(s);
  const n = Math.max(0, Math.min(bars, series.length - s.cursor));
  if (n === 0) {
    await finalize(user, s);
    return buildState(user, id, ["O feed chegou ao fim: a sessão foi terminada e avaliada."]);
  }

  await prisma.$transaction(async (tx) => {
    // Compare-and-swap on the cursor: a parallel request that already advanced the feed makes this a no-op.
    const cas = await tx.replaySession.updateMany({ where: { id, cursor: s.cursor }, data: { cursor: s.cursor + n } });
    if (cas.count === 0) return;
    const open = await tx.trade.findMany({ where: { replaySessionId: id, status: "OPEN" } });
    if (open.length === 0) return;
    const closedAgg = await tx.trade.aggregate({ where: { replaySessionId: id, status: "CLOSED" }, _sum: { pnl: true } });
    const balance = INITIAL_BALANCE + (closedAgg._sum.pnl ?? 0);
    const adv: AdvTrade[] = open.map((t) => ({ id: t.id, symbol: t.symbol, direction: t.direction, contracts: t.contracts, entryPrice: t.entryPrice, stopLoss: t.stopLoss, takeProfit: t.takeProfit }));
    const res = advanceAccount({ balance, peakEquity: balance, maxDrawdown: 0, dayStartEquity: balance, openTrades: adv, bars: series.slice(s.cursor, s.cursor + n) });
    for (const c of res.closed) {
      await tx.trade.update({
        where: { id: c.tradeId },
        data: { status: "CLOSED", exitReason: c.reason, exitPrice: c.math.exitPrice, pnl: c.math.net, fees: c.math.fees, rMultiple: c.math.rMultiple, closedAt: new Date(), closeBarIndex: s.cursor + c.barIndex },
      });
    }
  });

  const fresh = await owned(user, id);
  if (fresh.cursor >= series.length) {
    await finalize(user, fresh);
    return buildState(user, id, ["O feed chegou ao fim: a sessão foi terminada e avaliada."]);
  }
  return buildState(user, id);
}

export async function placeReplayTrade(user: SessionUser, id: string, input: OpenTradeInput) {
  const s = await activeSession(user, id);
  const state = await buildState(user, id);
  if (state.openTrades.length >= MAX_OPEN_TRADES) throw badRequest(`Máximo de ${MAX_OPEN_TRADES} posições abertas.`);
  const bid = state.bids[input.symbol];
  if (bid === undefined) throw badRequest("Instrumento inválido.");
  const drawings = readDrawings(s.drawings);
  const built = buildOpenTrade(input, { bid, balance: state.snapshot.equity, barIndex: state.cursor - 1, context: { prepared: isPrepared(drawings), drawings: drawings.length } });
  if (state.snapshot.freeMargin < built.margin) {
    throw badRequest(`Margem livre insuficiente (precisas de $${built.margin.toLocaleString("en-US")} — margem ilustrativa — e tens $${state.snapshot.freeMargin.toLocaleString("en-US")}). Reduz o tamanho.`);
  }
  await prisma.trade.create({ data: { ...built.data, userId: user.id, replaySessionId: id, source: "REPLAY" } });
  return buildState(user, id, built.warnings);
}

export async function closeReplayTrade(user: SessionUser, id: string, tradeId: string) {
  await activeSession(user, id);
  const state = await buildState(user, id);
  const trade = await prisma.trade.findFirst({ where: { id: tradeId, replaySessionId: id, userId: user.id, status: "OPEN" } });
  if (!trade) throw notFound("Posição aberta não encontrada.");
  const bid = state.bids[trade.symbol];
  if (bid === undefined) throw badRequest("Instrumento inválido.");
  const math = closeMath({ symbol: trade.symbol, direction: trade.direction, contracts: trade.contracts, entry: trade.entryPrice, stop: trade.stopLoss, level: bid });
  // Guard on status so a double click cannot close (and book) the same trade twice.
  const res = await prisma.trade.updateMany({
    where: { id: tradeId, status: "OPEN" },
    data: { status: "CLOSED", exitReason: "MANUAL", exitPrice: math.exitPrice, pnl: math.net, fees: math.fees, rMultiple: math.rMultiple, closedAt: new Date(), closeBarIndex: state.cursor - 1 },
  });
  if (res.count === 0) throw conflict("A posição já foi fechada.");
  return buildState(user, id);
}

export async function saveDrawings(user: SessionUser, id: string, drawings: Drawing[]) {
  await activeSession(user, id);
  if (drawings.length > MAX_DRAWINGS) throw badRequest(`Máximo de ${MAX_DRAWINGS} desenhos.`);
  await prisma.replaySession.update({ where: { id }, data: { drawings: drawings as unknown as Prisma.InputJsonValue } });
  return { saved: drawings.length };
}
