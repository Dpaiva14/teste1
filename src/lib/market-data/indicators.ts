import type { Candle } from "./types";

/** Average True Range (Wilder smoothing). Returns one value per candle (the first `period-1` are partial averages). */
export function atrSeries(candles: readonly Candle[], period = 14): number[] {
  const out: number[] = [];
  let prevClose: number | null = null;
  let atr = 0;
  candles.forEach((c, i) => {
    const tr: number = prevClose === null ? c.high - c.low : Math.max(c.high - c.low, Math.abs(c.high - prevClose), Math.abs(c.low - prevClose));
    if (i < period) {
      atr = (atr * i + tr) / (i + 1);
    } else {
      atr = (atr * (period - 1) + tr) / period;
    }
    out.push(atr);
    prevClose = c.close;
  });
  return out;
}

export function lastAtr(candles: readonly Candle[], period = 14): number {
  const s = atrSeries(candles, period);
  return s[s.length - 1] ?? 0;
}

export type SwingType = "high" | "low";

export interface Swing {
  index: number;
  type: SwingType;
  price: number;
}

/**
 * Fractal swing detection: a swing high is a candle whose high is strictly greater than the highs of
 * `left` candles before and `right` candles after (mirror for lows). Consecutive swings of the same type
 * are collapsed to the most extreme one so highs and lows alternate (classic zig-zag clean-up).
 */
export function detectSwings(candles: readonly Candle[], left = 3, right = 3): Swing[] {
  const raw: Swing[] = [];
  for (let i = left; i < candles.length - right; i++) {
    const c = candles[i]!;
    let isHigh = true;
    let isLow = true;
    for (let k = 1; k <= left && (isHigh || isLow); k++) {
      const p = candles[i - k]!;
      if (p.high >= c.high) isHigh = false;
      if (p.low <= c.low) isLow = false;
    }
    for (let k = 1; k <= right && (isHigh || isLow); k++) {
      const n = candles[i + k]!;
      if (n.high >= c.high) isHigh = false;
      if (n.low <= c.low) isLow = false;
    }
    if (isHigh) raw.push({ index: i, type: "high", price: c.high });
    if (isLow) raw.push({ index: i, type: "low", price: c.low });
  }
  raw.sort((a, b) => a.index - b.index);

  const out: Swing[] = [];
  for (const s of raw) {
    const last = out[out.length - 1];
    if (last && last.type === s.type) {
      const better = s.type === "high" ? s.price > last.price : s.price < last.price;
      if (better) out[out.length - 1] = s;
    } else {
      out.push(s);
    }
  }
  return out;
}

export type StructureLabel = "HH" | "HL" | "LH" | "LL";

export interface LabelledSwing extends Swing {
  /** undefined for the first swing of each type (nothing to compare with). */
  label?: StructureLabel;
}

/** Labels every swing HH/LH (highs) or HL/LL (lows) by comparing with the previous swing of the same type. */
export function labelStructure(swings: readonly Swing[]): LabelledSwing[] {
  let prevHigh: Swing | null = null;
  let prevLow: Swing | null = null;
  return swings.map((s) => {
    if (s.type === "high") {
      const label: StructureLabel | undefined = prevHigh ? (s.price > prevHigh.price ? "HH" : "LH") : undefined;
      prevHigh = s;
      return label ? { ...s, label } : { ...s };
    }
    const label: StructureLabel | undefined = prevLow ? (s.price > prevLow.price ? "HL" : "LL") : undefined;
    prevLow = s;
    return label ? { ...s, label } : { ...s };
  });
}

export type MarketStructure = "BULLISH" | "BEARISH" | "RANGE";

/**
 * Classifies structure from the most recent labelled swings.
 * BULLISH: latest high is HH and latest low is HL. BEARISH: latest high LH and latest low LL.
 * Anything else (mixed signals = LH+HL compression, HH+LL expansion, or too little data) is RANGE.
 */
export function classifyStructure(labelled: readonly LabelledSwing[]): MarketStructure {
  const lastHigh = [...labelled].reverse().find((s) => s.type === "high" && s.label);
  const lastLow = [...labelled].reverse().find((s) => s.type === "low" && s.label);
  if (!lastHigh?.label || !lastLow?.label) return "RANGE";
  if (lastHigh.label === "HH" && lastLow.label === "HL") return "BULLISH";
  if (lastHigh.label === "LH" && lastLow.label === "LL") return "BEARISH";
  return "RANGE";
}

export function highestHigh(candles: readonly Candle[]): number {
  return candles.reduce((m, c) => Math.max(m, c.high), -Infinity);
}

export function lowestLow(candles: readonly Candle[]): number {
  return candles.reduce((m, c) => Math.min(m, c.low), Infinity);
}

/** Simple moving average of closes (null until enough data). */
export function smaSeries(candles: readonly Candle[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  candles.forEach((c, i) => {
    sum += c.close;
    if (i >= period) sum -= candles[i - period]!.close;
    out.push(i >= period - 1 ? sum / period : null);
  });
  return out;
}
