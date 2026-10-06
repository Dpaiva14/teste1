import { Rng } from "./prng";
import { TIMEFRAME_MINUTES, type Candle, type Timeframe } from "./types";

/**
 * SYNTHETIC market simulator used by the DEMO provider. Nothing here reproduces real Dow history.
 *
 * Structure: the price path is built as a sequence of legs (impulse / pullback / range swings) so the
 * resulting charts have readable market structure; every leg is a Brownian bridge between its endpoints,
 * which keeps noise realistic while guaranteeing the leg targets. Volatility is modulated by time of day
 * so session effects (quiet Asia, active NY open) show up in demo statistics.
 */

const BASE_ATR_M1 = 12; // synthetic points of ATR on a 1-minute bar
const EFFECTIVE_MINUTES: Record<Timeframe, number> = { M1: 1, M5: 5, M15: 15, H1: 60, H4: 240, D1: 900 };

export function barAtr(tf: Timeframe): number {
  return BASE_ATR_M1 * Math.sqrt(EFFECTIVE_MINUTES[tf]);
}

/** Volatility multiplier by UTC time of day (approximation; ignores DST). Applies to intraday only. */
export function sessionVolMultiplier(epochSec: number, tf: Timeframe): number {
  if (tf === "H4" || tf === "D1") return 1;
  const d = new Date(epochSec * 1000);
  const t = d.getUTCHours() + d.getUTCMinutes() / 60;
  if (t >= 13.5 && t < 16) return 1.7; // US cash open window
  if (t >= 16 && t < 20) return 1.1;
  if (t >= 7 && t < 13.5) return 1.0; // London + pre-US
  if (t >= 20 && t < 22) return 0.7;
  return 0.55; // Asia / overnight
}

function isClosed(epochSec: number, tf: Timeframe): boolean {
  const d = new Date(epochSec * 1000);
  const dow = d.getUTCDay();
  if (tf === "D1") return dow === 0 || dow === 6;
  const h = d.getUTCHours();
  if (dow === 6) return true;
  if (dow === 5 && h >= 22) return true;
  if (dow === 0 && h < 22) return true;
  return false;
}

/** Bar open times, skipping the weekend closure. */
export function buildTimes(startSec: number, tf: Timeframe, count: number): number[] {
  const step = TIMEFRAME_MINUTES[tf] * 60;
  let t = Math.floor(startSec / step) * step;
  const out: number[] = [];
  while (out.length < count) {
    if (!isClosed(t, tf)) out.push(t);
    t += step;
  }
  return out;
}

interface Leg {
  to: number;
  bars: number;
}

type Regime = "up" | "down" | "range";
export type Bias = "mixed" | "bullish" | "bearish" | "range";

function planLegs(rng: Rng, startPrice: number, atr: number, totalBars: number, bias: Bias): Leg[] {
  const legs: Leg[] = [];
  let price = startPrice;
  let planned = 0;
  let regime: Regime = bias === "bullish" ? "up" : bias === "bearish" ? "down" : bias === "range" ? "range" : rng.pick<Regime>(["up", "down", "range"]);
  let rangeCenter = startPrice;
  let rangeHalf = atr * rng.range(3.5, 5.5);

  while (planned < totalBars + 24) {
    const legsInRegime = rng.int(3, 7);
    let lastImpulse = atr * rng.range(4, 7);
    for (let i = 0; i < legsInRegime && planned < totalBars + 24; i++) {
      if (regime === "range") {
        const upper = rangeCenter + rangeHalf * rng.range(0.7, 1);
        const lower = rangeCenter - rangeHalf * rng.range(0.7, 1);
        const goUp = price < rangeCenter ? rng.chance(0.8) : rng.chance(0.2);
        const to = goUp ? upper : lower;
        const bars = rng.int(5, 12);
        legs.push({ to, bars });
        planned += bars;
        price = to;
      } else {
        const sign = regime === "up" ? 1 : -1;
        const impBars = rng.int(6, 15);
        const impLen = atr * rng.range(0.35, 0.75) * impBars;
        legs.push({ to: price + sign * impLen, bars: impBars });
        planned += impBars;
        price += sign * impLen;
        lastImpulse = impLen;
        const pbBars = rng.int(4, 11);
        const pbLen = lastImpulse * rng.range(0.3, 0.78);
        legs.push({ to: price - sign * pbLen, bars: pbBars });
        planned += pbBars;
        price -= sign * pbLen;
      }
    }
    // Regime transition: reversals and ranges are both common.
    const r = rng.random();
    if (bias === "bullish") regime = r < 0.6 ? "up" : r < 0.8 ? "range" : "down";
    else if (bias === "bearish") regime = r < 0.6 ? "down" : r < 0.8 ? "range" : "up";
    else if (bias === "range") regime = r < 0.7 ? "range" : r < 0.85 ? "up" : "down";
    else if (regime === "up") regime = r < 0.4 ? "down" : r < 0.8 ? "range" : "up";
    else if (regime === "down") regime = r < 0.4 ? "up" : r < 0.8 ? "range" : "down";
    else regime = r < 0.4 ? "up" : r < 0.8 ? "down" : "range";
    rangeCenter = price;
    rangeHalf = atr * rng.range(3.5, 5.5);
  }
  return legs;
}

/** Brownian bridge from `a` to `b` over `n` steps (returns n values, the last equal to `b`). */
export function bridge(rng: Rng, a: number, b: number, n: number, sigma: (i: number) => number): number[] {
  const walk: number[] = [];
  let w = 0;
  for (let i = 1; i <= n; i++) {
    w += rng.normal(0, sigma(i - 1));
    walk.push(w);
  }
  const wn = walk[n - 1] ?? 0;
  return walk.map((wi, idx) => {
    const frac = (idx + 1) / n;
    return a + (b - a) * frac + (wi - frac * wn);
  });
}

export function roundToTick(price: number, tick: number): number {
  const decimals = Math.max(0, Math.ceil(-Math.log10(tick)));
  return Number((Math.round(price / tick) * tick).toFixed(decimals));
}

export interface GenerateOptions {
  seed: number;
  startPrice: number;
  timeframe: Timeframe;
  /** epoch seconds (UTC) of the first bar */
  startTime: number;
  count: number;
  tickSize: number;
  bias?: Bias;
  /** noise std-dev of the bridge, as a fraction of ATR */
  noise?: number;
}

function makeCandle(rng: Rng, time: number, open: number, close: number, atr: number, vol: number, tick: number, tf: Timeframe): Candle {
  const m = sessionVolMultiplier(time, tf);
  const upWick = Math.abs(rng.normal(0, 1)) * atr * 0.2 * m;
  const dnWick = Math.abs(rng.normal(0, 1)) * atr * 0.2 * m;
  const high = Math.max(open, close) + upWick;
  const low = Math.min(open, close) - dnWick;
  const body = Math.abs(close - open);
  const volume = Math.round(vol * m * (0.6 + (2 * body) / atr) * Math.exp(rng.normal(0, 0.3)));
  return {
    time,
    open: roundToTick(open, tick),
    high: roundToTick(high, tick),
    low: roundToTick(low, tick),
    close: roundToTick(close, tick),
    volume: Math.max(1, volume),
  };
}

export function generateCandles(opts: GenerateOptions): Candle[] {
  const { seed, startPrice, timeframe: tf, startTime, count, tickSize, bias = "mixed", noise = 0.42 } = opts;
  if (count <= 0) return [];
  const rng = new Rng(seed);
  const atr = barAtr(tf);
  const times = buildTimes(startTime, tf, count);
  const baseVol = 120 * Math.pow(TIMEFRAME_MINUTES[tf], 0.7);

  const legs = planLegs(rng, startPrice, atr, count, bias);
  const candles: Candle[] = [];
  let price = startPrice;
  for (const leg of legs) {
    if (candles.length >= count) break;
    const path = bridge(rng, price, leg.to, leg.bars, (i) => {
      const t = times[Math.min(count - 1, candles.length + i)] ?? times[count - 1] ?? startTime;
      return atr * noise * sessionVolMultiplier(t, tf);
    });
    for (const close of path) {
      if (candles.length >= count) break;
      const open = candles.length === 0 ? startPrice : candles[candles.length - 1]!.close;
      candles.push(makeCandle(rng, times[candles.length]!, open, close, atr, baseVol, tickSize, tf));
    }
    price = leg.to;
  }
  return candles;
}

// ───────────────────────── Scripted scenarios (known swings) ─────────────────────────

export interface ScriptPoint {
  /** bar index of the waypoint */
  at: number;
  price: number;
}

export interface ScriptedOptions {
  seed: number;
  timeframe: Timeframe;
  startTime: number;
  tickSize: number;
  /** strictly increasing `at`; first must be 0. The last point ends the series (plus `tail` bars). */
  points: readonly ScriptPoint[];
  /** extra bars after the last waypoint (continuation noise), default 0 */
  tail?: number;
  noise?: number;
  /** half-window enforced around each swing extreme so it is a clean fractal (default 3) */
  swingWindow?: number;
  /** Hand-set candles (e.g. an engulfing bar at the decision point). Applied last. */
  overrides?: readonly { at: number; ohlc: readonly [open: number, high: number, low: number, close: number] }[];
}

/**
 * Builds candles that pass exactly through the given waypoints, with the waypoint candle being the local
 * extreme in its ±window. Used for exercises whose solution (swings, structure, levels) is known by design.
 */
export function scriptedSeries(opts: ScriptedOptions): Candle[] {
  const { seed, timeframe: tf, startTime, tickSize, points, tail = 0, noise = 0.2, swingWindow = 3 } = opts;
  if (points.length < 2 || points[0]!.at !== 0) throw new Error("scriptedSeries: need >= 2 points starting at index 0");
  const rng = new Rng(seed);
  const atr = barAtr(tf);
  const lastAt = points[points.length - 1]!.at;
  const count = lastAt + 1 + tail;
  const times = buildTimes(startTime, tf, count);
  const baseVol = 120 * Math.pow(TIMEFRAME_MINUTES[tf], 0.7);

  const closes: number[] = new Array<number>(count).fill(points[0]!.price);
  for (let p = 1; p < points.length; p++) {
    const a = points[p - 1]!;
    const b = points[p]!;
    if (b.at <= a.at) throw new Error("scriptedSeries: points must be strictly increasing");
    const n = b.at - a.at;
    const path = bridge(rng, a.price, b.price, n, () => atr * noise);
    path.forEach((v, i) => (closes[a.at + 1 + i] = v));
  }
  if (tail > 0) {
    const last = points[points.length - 1]!;
    const path = bridge(rng, last.price, last.price + rng.normal(0, atr), tail, () => atr * noise);
    path.forEach((v, i) => (closes[lastAt + 1 + i] = v));
  }

  const candles: Candle[] = [];
  for (let i = 0; i < count; i++) {
    const open = i === 0 ? points[0]!.price : candles[i - 1]!.close;
    candles.push(makeCandle(rng, times[i]!, open, closes[i]!, atr, baseVol, tickSize, tf));
  }

  // Force every interior waypoint to be a clean local extreme.
  for (let p = 0; p < points.length; p++) {
    const pt = points[p]!;
    const prev = points[p - 1];
    const next = points[p + 1];
    const isHigh = (prev ? pt.price > prev.price : true) && (next ? pt.price > next.price : true);
    const isLow = (prev ? pt.price < prev.price : true) && (next ? pt.price < next.price : true);
    if (!prev || !next) continue; // endpoints are not swings
    const k = pt.at;
    const c = candles[k]!;
    const wick = Math.max(tickSize, roundToTick(Math.abs(rng.normal(0, atr * 0.12)), tickSize));
    if (isHigh) {
      const top = roundToTick(pt.price + wick, tickSize);
      candles[k] = { ...c, close: Math.min(c.close, pt.price), open: Math.min(c.open, top), high: top };
      for (let j = Math.max(0, k - swingWindow); j <= Math.min(count - 1, k + swingWindow); j++) {
        if (j === k) continue;
        const cj = candles[j]!;
        const cap = roundToTick(top - tickSize * (Math.abs(j - k) + 1), tickSize);
        if (cj.high > cap) candles[j] = { ...cj, high: cap, open: Math.min(cj.open, cap), close: Math.min(cj.close, cap) };
      }
    } else if (isLow) {
      const bottom = roundToTick(pt.price - wick, tickSize);
      candles[k] = { ...c, close: Math.max(c.close, pt.price), open: Math.max(c.open, bottom), low: bottom };
      for (let j = Math.max(0, k - swingWindow); j <= Math.min(count - 1, k + swingWindow); j++) {
        if (j === k) continue;
        const cj = candles[j]!;
        const floor = roundToTick(bottom + tickSize * (Math.abs(j - k) + 1), tickSize);
        if (cj.low < floor) candles[j] = { ...cj, low: floor, open: Math.max(cj.open, floor), close: Math.max(cj.close, floor) };
      }
    }
  }
  for (const o of opts.overrides ?? []) {
    const c = candles[o.at];
    if (!c) throw new Error(`scriptedSeries: override index ${o.at} out of range`);
    const [open, high, low, close] = o.ohlc;
    candles[o.at] = { ...c, open, high, low, close };
  }
  // Re-normalise OHLC invariants after the edits.
  return candles.map((c) => {
    const high = Math.max(c.high, c.open, c.close);
    const low = Math.min(c.low, c.open, c.close);
    return { ...c, high, low };
  });
}
