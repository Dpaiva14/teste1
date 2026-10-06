import "server-only";
import { prisma } from "@/database/client";
import { performanceStats } from "@/features/stats/logic/performance";
import { dayKey } from "@/features/gamification/logic/streak";
import { advanceAccount, type AdvTrade } from "@/features/trading/logic/advance";
import { accountSnapshot, closeMath, costsFor, marginRequired } from "@/features/trading/logic/engine";
import { toTradeDTO } from "@/features/trading/server/dto";
import { buildOpenTrade } from "@/features/trading/server/execution";
import { demoStartFromSeed, loadSeries, randomSeed } from "@/features/trading/server/feed";
import type { OpenTradeInput } from "@/features/trading/schemas";
import type { SessionUser } from "@/lib/auth/session";
import { badRequest, conflict, notFound } from "@/lib/errors";
import { isTimeframe, type Timeframe } from "@/lib/market-data/types";
import type { AccountStateDTO, AccountSummaryDTO } from "../types";

const WINDOW = 300;
const INITIAL_CURSOR = 200;
const TOTAL_BARS = 3000;
const MAX_ACTIVE_ACCOUNTS = 5;
const MAX_OPEN_TRADES = 10;
const SYMBOLS = ["YM", "MYM", "US30"] as const;

async function owned(user: SessionUser, id: string) {
  const acc = await prisma.simulationAccount.findFirst({ where: { id, userId: user.id } });
  if (!acc) throw notFound("Conta de simulação não encontrada.");
  return acc;
}

function seriesFor(acc: { feedTimeframe: string; feedSeed: number }) {
  const tf: Timeframe = isTimeframe(acc.feedTimeframe) ? acc.feedTimeframe : "M5";
  return loadSeries({ symbol: "YM", timeframe: tf, seed: acc.feedSeed, start: demoStartFromSeed(acc.feedSeed), count: TOTAL_BARS });
}

export async function listAccounts(user: SessionUser): Promise<AccountSummaryDTO[]> {
  const rows = await prisma.simulationAccount.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { trades: { where: { status: "OPEN" } } } } },
  });
  return rows.map((a) => ({ id: a.id, name: a.name, initialBalance: a.initialBalance, balance: a.balance, createdAt: a.createdAt.toISOString(), openTrades: a._count.trades }));
}

export async function createAccount(user: SessionUser, input: { name: string; initialBalance: number; timeframe: string }) {
  if (!isTimeframe(input.timeframe) || input.timeframe === "D1") throw badRequest("Timeframe inválido para o simulador.");
  const count = await prisma.simulationAccount.count({ where: { userId: user.id, status: "ACTIVE" } });
  if (count >= MAX_ACTIVE_ACCOUNTS) throw conflict(`Máximo de ${MAX_ACTIVE_ACCOUNTS} contas ativas. Arquiva uma para criar outra.`);
  const today = new Date(`${dayKey(new Date(), user.timezone)}T00:00:00Z`);
  const acc = await prisma.simulationAccount.create({
    data: {
      userId: user.id,
      name: input.name,
      initialBalance: input.initialBalance,
      balance: input.initialBalance,
      peakEquity: input.initialBalance,
      dayStartEquity: input.initialBalance,
      dayStartDate: today,
      feedSymbol: "YM",
      feedTimeframe: input.timeframe,
      feedSeed: randomSeed(),
      feedCursor: INITIAL_CURSOR,
    },
  });
  return { id: acc.id };
}

export async function archiveAccount(user: SessionUser, id: string) {
  await owned(user, id);
  await prisma.simulationAccount.update({ where: { id }, data: { status: "ARCHIVED" } });
}

async function buildState(user: SessionUser, id: string, warnings: string[] = []): Promise<AccountStateDTO> {
  const acc = await owned(user, id);
  const series = await seriesFor(acc);
  const cursor = Math.min(acc.feedCursor, series.length);
  const visible = series.slice(0, cursor);
  const last = visible[visible.length - 1];
  if (!last) throw badRequest("Feed vazio.");

  const basis = Object.fromEntries(SYMBOLS.map((s) => [s, costsFor(s).basisPoints])) as Record<string, number>;
  const bids = Object.fromEntries(SYMBOLS.map((s) => [s, last.close + (basis[s] ?? 0)])) as Record<string, number>;

  const [openRows, closedRows] = await Promise.all([
    prisma.trade.findMany({ where: { simulationAccountId: id, status: "OPEN" }, orderBy: { openedAt: "asc" }, include: { journalEntry: { select: { id: true } } } }),
    prisma.trade.findMany({ where: { simulationAccountId: id, status: "CLOSED" }, orderBy: { closedAt: "asc" }, include: { journalEntry: { select: { id: true } } } }),
  ]);

  let snapshot = accountSnapshot({
    balance: acc.balance,
    openTrades: openRows.map((t) => ({ symbol: t.symbol, direction: t.direction, contracts: t.contracts, entryPrice: t.entryPrice })),
    bids,
    dayStartEquity: acc.dayStartEquity,
    peakEquity: acc.peakEquity,
    maxDrawdown: acc.maxDrawdown,
  });

  // New (user-timezone) day → today's P&L restarts from the current equity.
  const today = dayKey(new Date(), user.timezone);
  if (acc.dayStartDate.toISOString().slice(0, 10) !== today) {
    await prisma.simulationAccount.update({ where: { id }, data: { dayStartDate: new Date(`${today}T00:00:00Z`), dayStartEquity: snapshot.equity } });
    snapshot = { ...snapshot, dailyPnl: 0 };
  }
  if (snapshot.peakEquity !== acc.peakEquity || snapshot.maxDrawdown !== acc.maxDrawdown) {
    await prisma.simulationAccount.update({ where: { id }, data: { peakEquity: snapshot.peakEquity, maxDrawdown: snapshot.maxDrawdown } });
  }

  const closedDTOs = closedRows.map(toTradeDTO);
  return {
    id: acc.id,
    name: acc.name,
    timeframe: acc.feedTimeframe,
    initialBalance: acc.initialBalance,
    cursor,
    totalBars: series.length,
    finished: cursor >= series.length,
    snapshot,
    candles: visible.slice(-WINDOW),
    windowStart: Math.max(0, cursor - WINDOW),
    bids,
    basis,
    openTrades: openRows.map(toTradeDTO),
    closedTrades: closedDTOs.slice(-50).reverse(),
    stats: performanceStats(closedRows.map((t) => ({ pnl: t.pnl ?? 0, r: t.rMultiple })), { startingBalance: acc.initialBalance }),
    warnings,
  };
}

export const getAccountState = (user: SessionUser, id: string) => buildState(user, id);

export async function advance(user: SessionUser, id: string, bars: number) {
  const acc = await owned(user, id);
  if (acc.status !== "ACTIVE") throw badRequest("Conta arquivada.");
  const series = await seriesFor(acc);
  const n = Math.max(0, Math.min(bars, series.length - acc.feedCursor));
  if (n === 0) return buildState(user, id, ["O feed chegou ao fim. Arquiva a conta e cria uma nova para continuar."]);

  await prisma.$transaction(async (tx) => {
    // Compare-and-swap on the cursor: if a parallel request already advanced the feed, do nothing.
    const cas = await tx.simulationAccount.updateMany({ where: { id, feedCursor: acc.feedCursor }, data: { feedCursor: acc.feedCursor + n } });
    if (cas.count === 0) return;

    const open = await tx.trade.findMany({ where: { simulationAccountId: id, status: "OPEN" } });
    const adv: AdvTrade[] = open.map((t) => ({ id: t.id, symbol: t.symbol, direction: t.direction, contracts: t.contracts, entryPrice: t.entryPrice, stopLoss: t.stopLoss, takeProfit: t.takeProfit }));
    const newBars = series.slice(acc.feedCursor, acc.feedCursor + n);
    const res = advanceAccount({ balance: acc.balance, peakEquity: acc.peakEquity, maxDrawdown: acc.maxDrawdown, dayStartEquity: acc.dayStartEquity, openTrades: adv, bars: newBars });

    let balance = res.balance;
    let peak = res.peakEquity;
    let maxDd = res.maxDrawdown;
    for (const c of res.closed) {
      await tx.trade.update({
        where: { id: c.tradeId },
        data: { status: "CLOSED", exitReason: c.reason, exitPrice: c.math.exitPrice, pnl: c.math.net, fees: c.math.fees, rMultiple: c.math.rMultiple, closedAt: new Date(), closeBarIndex: acc.feedCursor + c.barIndex },
      });
    }

    // End of feed: liquidate what is still open at the last price.
    const reachedEnd = acc.feedCursor + n >= series.length;
    if (reachedEnd && res.lastClose !== null) {
      for (const t of res.stillOpen) {
        const bid = res.lastClose + costsFor(t.symbol).basisPoints;
        const math = closeMath({ symbol: t.symbol, direction: t.direction, contracts: t.contracts, entry: t.entryPrice, stop: t.stopLoss, level: bid });
        balance += math.net;
        await tx.trade.update({
          where: { id: t.id },
          data: { status: "CLOSED", exitReason: "END_OF_DATA", exitPrice: math.exitPrice, pnl: math.net, fees: math.fees, rMultiple: math.rMultiple, closedAt: new Date(), closeBarIndex: series.length - 1 },
        });
      }
      const snap = accountSnapshot({ balance, openTrades: [], bids: {}, dayStartEquity: acc.dayStartEquity, peakEquity: peak, maxDrawdown: maxDd });
      peak = snap.peakEquity;
      maxDd = snap.maxDrawdown;
    }
    await tx.simulationAccount.update({ where: { id }, data: { balance: Math.round(balance * 100) / 100, peakEquity: peak, maxDrawdown: maxDd } });
  });

  return buildState(user, id);
}

export async function placeTrade(user: SessionUser, id: string, input: OpenTradeInput) {
  const acc = await owned(user, id);
  if (acc.status !== "ACTIVE") throw badRequest("Conta arquivada.");
  const state = await buildState(user, id);
  if (state.finished) throw badRequest("O feed terminou: cria uma nova conta de simulação.");
  if (state.openTrades.length >= MAX_OPEN_TRADES) throw badRequest(`Máximo de ${MAX_OPEN_TRADES} posições abertas.`);

  const bid = state.bids[input.symbol];
  if (bid === undefined) throw badRequest("Instrumento inválido.");
  const built = buildOpenTrade(input, { bid, balance: state.snapshot.equity, barIndex: state.cursor - 1 });
  if (state.snapshot.freeMargin < built.margin) {
    throw badRequest(`Margem livre insuficiente (precisas de $${built.margin.toLocaleString("en-US")} — margem ilustrativa — e tens $${state.snapshot.freeMargin.toLocaleString("en-US")}). Reduz o tamanho.`);
  }
  await prisma.trade.create({ data: { ...built.data, userId: user.id, simulationAccountId: id, source: "SIMULATOR" } });
  return buildState(user, id, built.warnings);
}

export async function closeTrade(user: SessionUser, id: string, tradeId: string) {
  await owned(user, id);
  const state = await buildState(user, id);
  const trade = await prisma.trade.findFirst({ where: { id: tradeId, simulationAccountId: id, userId: user.id, status: "OPEN" } });
  if (!trade) throw notFound("Posição aberta não encontrada.");
  const bid = state.bids[trade.symbol];
  if (bid === undefined) throw badRequest("Instrumento inválido.");
  const math = closeMath({ symbol: trade.symbol, direction: trade.direction, contracts: trade.contracts, entry: trade.entryPrice, stop: trade.stopLoss, level: bid });
  await prisma.$transaction([
    prisma.trade.update({
      where: { id: tradeId },
      data: { status: "CLOSED", exitReason: "MANUAL", exitPrice: math.exitPrice, pnl: math.net, fees: math.fees, rMultiple: math.rMultiple, closedAt: new Date(), closeBarIndex: state.cursor - 1 },
    }),
    prisma.simulationAccount.update({ where: { id }, data: { balance: { increment: math.net } } }),
  ]);
  return buildState(user, id);
}

export { marginRequired };
