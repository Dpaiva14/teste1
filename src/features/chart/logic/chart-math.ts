import type { Candle } from "@/lib/market-data/types";
import type { ChartViewport } from "../types";

export const DEFAULT_PADDING = { top: 12, right: 64, bottom: 26, left: 8 } as const;

export function plotWidth(vp: ChartViewport): number {
  return Math.max(1, vp.width - vp.padding.left - vp.padding.right);
}

export function plotHeight(vp: ChartViewport): number {
  return Math.max(1, vp.height - vp.padding.top - vp.padding.bottom);
}

/** Pixel width of one candle slot. */
export function slotWidth(vp: ChartViewport): number {
  return plotWidth(vp) / vp.count;
}

/** x of the CENTRE of candle `index`. */
export function xForIndex(vp: ChartViewport, index: number): number {
  return vp.padding.left + (index - vp.first + 0.5) * slotWidth(vp);
}

/** Candle index nearest to pixel x (integer). */
export function indexForX(vp: ChartViewport, x: number): number {
  return Math.round((x - vp.padding.left) / slotWidth(vp) + vp.first - 0.5);
}

export function yForPrice(vp: ChartViewport, price: number): number {
  const span = vp.maxPrice - vp.minPrice || 1;
  return vp.padding.top + ((vp.maxPrice - price) / span) * plotHeight(vp);
}

export function priceForY(vp: ChartViewport, y: number): number {
  const span = vp.maxPrice - vp.minPrice || 1;
  return vp.maxPrice - ((y - vp.padding.top) / plotHeight(vp)) * span;
}

/** Price range of the visible window, widened by `padRatio` and optionally by extra prices (overlays). */
export function computeDomain(
  candles: readonly Candle[],
  first: number,
  count: number,
  extraPrices: readonly number[] = [],
  padRatio = 0.06,
): { min: number; max: number } {
  const from = Math.max(0, Math.floor(first));
  const to = Math.min(candles.length - 1, Math.ceil(first + count) - 1);
  let min = Infinity;
  let max = -Infinity;
  for (let i = from; i <= to; i++) {
    const c = candles[i]!;
    if (c.low < min) min = c.low;
    if (c.high > max) max = c.high;
  }
  for (const p of extraPrices) {
    if (Number.isFinite(p)) {
      if (p < min) min = p;
      if (p > max) max = p;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: 0, max: 1 };
  const span = max - min || Math.max(1, Math.abs(max) * 0.001);
  return { min: min - span * padRatio, max: max + span * padRatio };
}

/** "Nice" axis ticks (1/2/5 × 10^n) covering [min,max]. */
export function niceTicks(min: number, max: number, target = 6): number[] {
  const span = max - min;
  if (!(span > 0)) return [min];
  const rough = span / Math.max(1, target);
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const frac = rough / pow;
  const step = (frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10) * pow;
  const first = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = first; v <= max + step * 1e-9; v += step) ticks.push(Number(v.toFixed(10)));
  return ticks;
}

/** Choose the candle slot closest to a price when the user clicks near a high/low (for snapping marks). */
export function snapToExtreme(candle: Candle, price: number): { price: number; side: "high" | "low" } {
  const mid = (candle.high + candle.low) / 2;
  return price >= mid ? { price: candle.high, side: "high" } : { price: candle.low, side: "low" };
}

export function formatAxisTime(epochSec: number, intraday: boolean, timeZone = "UTC"): string {
  const d = new Date(epochSec * 1000);
  if (intraday) {
    return new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone }).format(d);
  }
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", timeZone }).format(d);
}

export function formatDayLabel(epochSec: number, timeZone = "UTC"): string {
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", timeZone }).format(new Date(epochSec * 1000));
}
