import "server-only";
import { Prisma, prisma } from "@/database/client";
import { awardXp, evaluateAchievements, recordActivity, XP } from "@/features/gamification/server/gamification-service";
import { costsFor } from "@/features/trading/logic/engine";
import { demoStartFromSeed, loadSeries, randomSeed } from "@/features/trading/server/feed";
import type { SessionUser } from "@/lib/auth/session";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { isTimeframe, type Timeframe } from "@/lib/market-data/types";
import { roundMoney } from "@/lib/money";
import { getStrategy } from "@/modules/strategies";
import { MAX_HOLD_BARS, takeTrade, WAIT_STEP } from "../logic/resolve";
import { summarizeBacktest, type DecisionRecord } from "../logic/summary";
import type { CreateBacktestInput, DecisionInput } from "../schemas";
import type { BacktestListItemDTO, BacktestStateDTO, DecisionDTO, DecisionResultDTO } from "../types";

const INITIAL_CURSOR = 150;
const WINDOW = 300;
const MAX_ACTIVE = 10;
/** The feed symbol is always the YM-based synthetic series; US30 only differs by its basis. */
const FEED_SYMBOL = "YM";

type Row = Prisma.BacktestGetPayload<object>;

async function owned(user: SessionUser, id: string): Promise<Row> {
  const bt = await prisma.backtest.findFirst({ where: { id, userId: user.id } });
  if (!bt) throw notFound("Backtest não encontrado.");
  return bt;
}

function seriesFor(bt: Pick<Row, "timeframe" | "seed" | "totalBars">) {
  const tf: Timeframe = isTimeframe(bt.timeframe) ? bt.timeframe : "M15";
  return loadSeries({ symbol: FEED_SYMBOL, timeframe: tf, seed: bt.seed, start: demoStartFromSeed(bt.seed), count: bt.totalBars });
}

function toDecisionDTO(d: Prisma.BacktestDecisionGetPayload<object>): DecisionDTO {
  return {
    seq: d.seq,
    barIndex: d.barIndex,
    choice: d.choice,
    outcome: d.outcome,
    entry: d.entry,
    stop: d.stop,
    target: d.target,
    exitIndex: d.exitIndex,
    exitPrice: d.exitPrice,
    rMultiple: d.rMultiple,
    pnl: d.pnl,
    riskAmount: d.riskAmount,
    reason: d.reason,
    note: d.note,
    rulesMet: d.rulesMet,
    rulesTotal: d.rulesTotal,
  };
}

export async function listBacktests(user: SessionUser): Promise<BacktestListItemDTO[]> {
  const rows = await prisma.backtest.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { _count: { select: { decisions: true } }, decisions: { select: { pnl: true } } },
  });
  return rows.map((b) => ({
    id: b.id,
    name: b.name,
    symbol: b.symbol,
    timeframe: b.timeframe,
    strategyName: getStrategy(b.strategyKey)?.name ?? b.strategyKey,
    status: b.status,
    decisions: b._count.decisions,
    balance: roundMoney(b.initialBalance + b.decisions.reduce((s, d) => s + (d.pnl ?? 0), 0)),
    initialBalance: b.initialBalance,
    updatedAt: b.updatedAt.toISOString(),
  }));
}

export async function createBacktest(user: SessionUser, input: CreateBacktestInput): Promise<{ id: string }> {
  if (!getStrategy(input.strategyKey)) throw badRequest("Estratégia inválida.");
  const active = await prisma.backtest.count({ where: { userId: user.id, status: "IN_PROGRESS" } });
  if (active >= MAX_ACTIVE) throw conflict(`Máximo de ${MAX_ACTIVE} backtests em curso. Termina ou apaga um para criar outro.`);

  const seed = randomSeed();
  const series = await seriesFor({ timeframe: input.timeframe, seed, totalBars: input.bars });
  const first = series[0];
  const last = series[series.length - 1];
  if (!first || !last || series.length < INITIAL_CURSOR + 50) throw badRequest("Não foi possível gerar dados suficientes para este backtest.");

  const bt = await prisma.backtest.create({
    data: {
      userId: user.id,
      name: input.name,
      symbol: input.symbol,
      timeframe: input.timeframe,
      rangeStart: new Date(first.time * 1000),
      rangeEnd: new Date(last.time * 1000),
      seed,
      dataSource: "DEMO",
      strategyKey: input.strategyKey,
      riskPercent: input.riskPercent,
      initialBalance: input.initialBalance,
      cursor: INITIAL_CURSOR,
      totalBars: series.length,
    },
    select: { id: true },
  });
  return bt;
}

export async function deleteBacktest(user: SessionUser, id: string) {
  await owned(user, id);
  await prisma.backtest.delete({ where: { id } });
}

export async function getBacktestState(user: SessionUser, id: string): Promise<BacktestStateDTO> {
  const bt = await owned(user, id);
  const [series, rows] = await Promise.all([seriesFor(bt), prisma.backtestDecision.findMany({ where: { backtestId: id }, orderBy: { seq: "asc" } })]);

  // Only candles up to the cursor ever leave the server — the future must not leak to the client.
  const cursor = Math.min(bt.cursor, series.length);
  const basis = costsFor(bt.symbol).basisPoints;
  const visible = series.slice(Math.max(0, cursor - WINDOW), cursor).map((c) => (basis === 0 ? c : { ...c, open: c.open + basis, high: c.high + basis, low: c.low + basis, close: c.close + basis }));
  const lastCandle = visible[visible.length - 1];
  if (!lastCandle) throw badRequest("Feed vazio.");

  const records: DecisionRecord[] = rows.map((d) => ({
    choice: d.choice,
    outcome: d.outcome,
    barIndex: d.barIndex,
    exitIndex: d.exitIndex,
    pnl: d.pnl,
    rMultiple: d.rMultiple,
    reason: d.reason,
    rulesMet: d.rulesMet,
    rulesTotal: d.rulesTotal,
  }));
  const balance = roundMoney(bt.initialBalance + rows.reduce((s, d) => s + (d.pnl ?? 0), 0));
  return {
    id: bt.id,
    name: bt.name,
    symbol: bt.symbol,
    timeframe: bt.timeframe,
    strategyKey: bt.strategyKey,
    riskPercent: bt.riskPercent,
    initialBalance: bt.initialBalance,
    balance,
    status: bt.status,
    cursor,
    totalBars: series.length,
    candles: visible,
    windowStart: Math.max(0, cursor - WINDOW),
    bid: lastCandle.close,
    decisions: rows.slice(-200).map(toDecisionDTO),
    summary: summarizeBacktest(records, bt.initialBalance),
  };
}

export async function finishBacktest(user: SessionUser, id: string): Promise<BacktestStateDTO> {
  await owned(user, id);
  await prisma.backtest.update({ where: { id }, data: { status: "COMPLETED" } });
  return getBacktestState(user, id);
}

/**
 * Records one decision (BUY / SELL / WAIT) at the current bar and moves the feed forward:
 *  - WAIT skips `WAIT_STEP` bars;
 *  - BUY/SELL are sized from the risk budget, replayed through the shared engine, and the feed jumps to the bar
 *    after the exit so the whole trade is visible.
 * Compare-and-swap on the cursor makes a double-click or a parallel tab harmless.
 */
export async function decide(user: SessionUser, id: string, input: DecisionInput): Promise<DecisionResultDTO> {
  const bt = await owned(user, id);
  if (bt.status !== "IN_PROGRESS") throw conflict("Este backtest já terminou.");
  const series = await seriesFor(bt);
  if (bt.cursor >= series.length) throw conflict("O feed chegou ao fim.");

  const agg = await prisma.backtestDecision.aggregate({ where: { backtestId: id }, _sum: { pnl: true }, _count: { _all: true }, _max: { seq: true } });
  const balance = roundMoney(bt.initialBalance + (agg._sum.pnl ?? 0));
  if (balance <= 0) throw conflict("A conta chegou a zero — backtest terminado.");
  const seq = (agg._max.seq ?? 0) + 1;
  const barIndex = bt.cursor - 1;
  const lastClose = series[barIndex]!.close;

  let newCursor: number;
  let data: Omit<Prisma.BacktestDecisionUncheckedCreateInput, "backtestId" | "seq" | "barIndex">;
  const rules = { rulesMet: input.rulesMet ?? null, rulesTotal: input.rulesTotal ?? null };

  if (input.choice === "WAIT") {
    newCursor = Math.min(series.length, bt.cursor + WAIT_STEP);
    data = { choice: "WAIT", outcome: "NO_TRADE", note: input.note ?? null, ...rules };
  } else {
    const res = takeTrade({
      symbol: bt.symbol,
      direction: input.choice === "BUY" ? "LONG" : "SHORT",
      balance,
      riskPercent: bt.riskPercent,
      lastClose,
      stopPoints: input.stopPoints,
      targetR: input.targetR,
      futureBars: series.slice(bt.cursor, bt.cursor + MAX_HOLD_BARS),
    });
    if (!res.ok) throw badRequest(res.message);
    const exitIndex = bt.cursor + res.exitOffset;
    newCursor = Math.min(series.length, exitIndex + 1);
    data = {
      choice: input.choice,
      entry: res.entry,
      stop: res.stop,
      target: res.target,
      exitIndex,
      exitPrice: res.exitPrice,
      outcome: res.outcome,
      rMultiple: res.rMultiple,
      pnl: res.pnl,
      riskAmount: res.riskAmount,
      reason: input.reason,
      note: input.note ?? null,
      ...rules,
    };
  }

  // Finished when the feed is (almost) exhausted: with fewer than a handful of bars there is nothing left to decide on.
  const finished = newCursor >= series.length - 1;
  try {
    await prisma.$transaction(async (tx) => {
      const cas = await tx.backtest.updateMany({ where: { id, cursor: bt.cursor, status: "IN_PROGRESS" }, data: { cursor: newCursor, status: finished ? "COMPLETED" : "IN_PROGRESS" } });
      if (cas.count === 0) throw conflict("O backtest já avançou noutro pedido. Atualiza a página.");
      await tx.backtestDecision.create({ data: { ...data, backtestId: id, seq, barIndex } });
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw conflict("Decisão duplicada. Atualiza a página.");
    throw e;
  }

  // Equal XP for BUY, SELL and WAIT, with a daily cap: practice is rewarded, trading more is not.
  const xp = await awardXp(user.id, "BACKTEST_DECISION", `${id}:${seq}`, XP.backtestDecision);
  await recordActivity(user.id);
  const unlocked = await evaluateAchievements(user.id);
  return { state: await getBacktestState(user, id), unlockedAchievements: unlocked.map((a) => ({ key: a.key, title: a.title })), xp };
}
