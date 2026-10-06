import type { Candle } from "@/lib/market-data/types";

/**
 * Snaps a click to the most extreme candle (highest high / lowest low) within ±radius of `index`,
 * so students do not have to click pixel-perfectly on the swing candle.
 */
export function snapToSwing(candles: readonly Candle[], index: number, side: "high" | "low", radius = 3): number {
  const from = Math.max(0, index - radius);
  const to = Math.min(candles.length - 1, index + radius);
  let best = Math.min(Math.max(index, 0), candles.length - 1);
  for (let i = from; i <= to; i++) {
    const c = candles[i]!;
    const b = candles[best]!;
    if (side === "high" ? c.high > b.high : c.low < b.low) best = i;
  }
  return best;
}
