import "server-only";
import { prisma } from "@/database/client";
import { badRequest } from "@/lib/errors";
import { getInstrument } from "@/modules/instruments";
import { getMarketDataProvider } from "./registry";
import { TIMEFRAME_MINUTES, type Candle, type CandleQuery, type DataSourceInfo, type Instrument } from "./types";

/** Application-facing market-data API. Routes and services call this, never a provider directly. */
export function dataSource(): DataSourceInfo {
  const p = getMarketDataProvider();
  return { provider: p.name, isDemo: p.isDemo };
}

export async function listInstruments(): Promise<Instrument[]> {
  return getMarketDataProvider().listInstruments();
}

export async function getCandles(query: CandleQuery): Promise<Candle[]> {
  if (!getInstrument(query.symbol)) throw badRequest(`Instrumento desconhecido: ${query.symbol}`);
  const provider = getMarketDataProvider();
  if (!provider.cacheable) return provider.getCandles(query);

  // Write-through cache for vendor data: serve from the MarketData table when the range is fully covered.
  const stepMs = TIMEFRAME_MINUTES[query.timeframe] * 60_000;
  const cached = await prisma.marketData.findMany({
    where: { symbol: query.symbol, timeframe: query.timeframe, source: provider.name, ts: { gte: query.from, lte: query.to } },
    orderBy: { ts: "asc" },
  });
  const expectedMin = Math.floor((query.to.getTime() - query.from.getTime()) / stepMs) * 0.5; // weekends/holidays: be lenient
  if (cached.length >= expectedMin && cached.length > 0) {
    return cached.map((r) => ({ time: Math.floor(r.ts.getTime() / 1000), open: r.open, high: r.high, low: r.low, close: r.close, volume: r.volume ?? 0 }));
  }
  const fresh = await provider.getCandles(query);
  if (fresh.length > 0) {
    await prisma.marketData.createMany({
      data: fresh.map((c) => ({
        symbol: query.symbol,
        timeframe: query.timeframe,
        ts: new Date(c.time * 1000),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
        source: provider.name,
      })),
      skipDuplicates: true,
    });
  }
  return fresh;
}
