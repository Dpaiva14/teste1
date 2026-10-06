import { INSTRUMENTS, requireInstrument } from "@/modules/instruments";
import { generateCandles } from "../demo-generator";
import { hashSeed } from "../prng";
import { TIMEFRAME_MINUTES, type Candle, type CandleQuery, type Instrument, type MarketDataProvider } from "../types";

const MAX_BARS = 5000;

/**
 * DEMO provider: synthetic, deterministic candles. NEVER real market data — every consumer must
 * show the DEMO badge when `isDemo` is true.
 */
export class DemoProvider implements MarketDataProvider {
  readonly name = "demo";
  readonly isDemo = true;
  readonly cacheable = false;

  async listInstruments(): Promise<Instrument[]> {
    return [...INSTRUMENTS];
  }

  async getCandles(q: CandleQuery): Promise<Candle[]> {
    const inst = requireInstrument(q.symbol);
    const fromSec = Math.floor(q.from.getTime() / 1000);
    const toSec = Math.floor(q.to.getTime() / 1000);
    if (toSec <= fromSec) return [];
    const stepSec = TIMEFRAME_MINUTES[q.timeframe] * 60;
    const cap = Math.min(q.limit ?? MAX_BARS, MAX_BARS);
    const naive = Math.min(cap, Math.ceil((toSec - fromSec) / stepSec) + 1);
    const seed = q.seed ?? hashSeed(`${q.symbol}|${q.timeframe}|${q.from.toISOString().slice(0, 10)}`);
    const candles = generateCandles({
      seed,
      startPrice: inst.demoBasePrice,
      timeframe: q.timeframe,
      startTime: fromSec,
      count: naive,
      tickSize: inst.tickSize,
    });
    return candles.filter((c) => c.time <= toSec);
  }
}
