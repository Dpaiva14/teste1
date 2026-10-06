import "server-only";
import { getCandles } from "@/lib/market-data/service";
import { TIMEFRAME_MINUTES, type Candle, type Timeframe } from "@/lib/market-data/types";

const cache = new Map<string, Candle[]>();
const MAX_CACHE = 24;

/**
 * Loads `count` candles for a session. DEMO series are deterministic per (symbol, timeframe, seed, start), so a
 * small in-memory cache avoids regenerating them on every request. Real providers go through the MarketData
 * table cache inside `getCandles`.
 */
export async function loadSeries(opts: { symbol: string; timeframe: Timeframe; seed: number; start: Date; count: number }): Promise<Candle[]> {
  const key = `${opts.symbol}|${opts.timeframe}|${opts.seed}|${opts.start.toISOString()}|${opts.count}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const stepMs = TIMEFRAME_MINUTES[opts.timeframe] * 60_000;
  // Ask for generous headroom: weekends are skipped, so the date range must be wider than count × step.
  const to = new Date(opts.start.getTime() + Math.ceil(opts.count * stepMs * 1.6) + 4 * 86_400_000);
  const candles = (await getCandles({ symbol: opts.symbol, timeframe: opts.timeframe, from: opts.start, to, seed: opts.seed, limit: opts.count + 50 })).slice(0, opts.count);
  cache.set(key, candles);
  if (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value as string);
  return candles;
}

/** Synthetic "calendar" start of a DEMO feed, derived from the seed (always a weekday-aligned past date). */
export function demoStartFromSeed(seed: number): Date {
  return new Date(Date.UTC(2025, 0, 6) + (seed % 300) * 86_400_000);
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}
