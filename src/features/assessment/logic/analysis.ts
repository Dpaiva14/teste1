import { atrSeries, classifyStructure, detectSwings, labelStructure, type MarketStructure, type StructureLabel } from "@/lib/market-data/indicators";
import type { Candle } from "@/lib/market-data/types";
import { roundTo } from "@/lib/money";

/**
 * Objective facts about the VISIBLE part of the chart (everything here is computed from candles up to the decision point;
 * nothing after it is ever used). They are the reference the evaluation compares the student's work with. Swing/structure
 * detection is a simple, transparent rule — in ambiguous charts more than one reading is accepted (see evaluate.ts).
 */

export type Trend = "UP" | "DOWN" | "RANGE";

const LOOKBACK = 220;
const DRIFT_BARS = 100;
/** Trend by drift: net move over DRIFT_BARS must be ≥ this many ATR AND directional enough (efficiency ratio = |net| ÷ path travelled). */
const DRIFT_THRESHOLD_ATR = 5;
const DRIFT_MIN_EFFICIENCY = 0.15;
const CLUSTER_ATR = 0.6;

export interface FactSwing {
  index: number;
  type: "high" | "low";
  price: number;
  label: StructureLabel | null;
}
export interface FactLevel {
  price: number;
  touches: number;
}
export interface LiquidityPool {
  side: "high" | "low";
  price: number;
  touches: number;
}
export interface ZoneCandidate {
  role: "supply" | "demand";
  top: number;
  bottom: number;
  /** absolute bar index of the candle that left the zone */
  index: number;
  /** how far price moved away afterwards, in ATR */
  departureAtr: number;
}
export interface FibLeg {
  a: { index: number; price: number };
  b: { index: number; price: number };
  direction: "up" | "down";
  sizeAtr: number;
}

export interface AssessmentFacts {
  atr: number;
  lastClose: number;
  /** absolute index of the last visible candle */
  lastIndex: number;
  driftAtr: number;
  /** |net change| ÷ total path over the drift window: 0 = pure noise, 1 = a straight line */
  efficiency: number;
  trendByDrift: Trend;
  trendByStructure: Trend;
  acceptableTrends: Trend[];
  structure: MarketStructure;
  lastHighLabel: StructureLabel | null;
  lastLowLabel: StructureLabel | null;
  swings: FactSwing[];
  levels: FactLevel[];
  pools: LiquidityPool[];
  zones: ZoneCandidate[];
  legs: FibLeg[];
  lastCandle: { direction: "bullish" | "bearish" | "doji"; bodyAtr: number; upperWickPct: number; lowerWickPct: number };
}

const structureTrend = (s: MarketStructure): Trend => (s === "BULLISH" ? "UP" : s === "BEARISH" ? "DOWN" : "RANGE");

/** Clusters sorted prices that sit within `tol` of the previous one. */
function cluster(prices: readonly number[], tol: number): { price: number; touches: number }[] {
  const sorted = [...prices].sort((a, b) => a - b);
  const groups: number[][] = [];
  for (const p of sorted) {
    const g = groups[groups.length - 1];
    if (g && p - g[g.length - 1]! <= tol) g.push(p);
    else groups.push([p]);
  }
  return groups.map((g) => ({ price: roundTo(g.reduce((a, b) => a + b, 0) / g.length, 1), touches: g.length }));
}

export function analyzeChart(candles: readonly Candle[]): AssessmentFacts {
  if (candles.length < 60) throw new Error("São precisos pelo menos 60 candles para analisar.");
  const offset = Math.max(0, candles.length - LOOKBACK);
  const slice = candles.slice(offset);
  const atrs = atrSeries(slice, 14);
  const atr = atrs[atrs.length - 1] || 1;
  const lastIndex = candles.length - 1;
  const last = candles[lastIndex]!;

  const labelled = labelStructure(detectSwings(slice, 3, 3));
  const swingsAbs: FactSwing[] = labelled.map((s) => ({ index: s.index + offset, type: s.type, price: s.price, label: s.label ?? null }));
  const structure = classifyStructure(labelled);
  const lastHigh = [...labelled].reverse().find((s) => s.type === "high" && s.label);
  const lastLow = [...labelled].reverse().find((s) => s.type === "low" && s.label);

  const ref = candles[Math.max(0, candles.length - 1 - DRIFT_BARS)]!;
  const driftAtr = roundTo((last.close - ref.close) / atr, 2);
  const driftSeg = candles.slice(Math.max(0, candles.length - 1 - DRIFT_BARS));
  const path = driftSeg.slice(1).reduce((sum, c, i) => sum + Math.abs(c.close - driftSeg[i]!.close), 0);
  const efficiency = path > 0 ? roundTo(Math.abs(last.close - ref.close) / path, 2) : 0;
  const directional = efficiency >= DRIFT_MIN_EFFICIENCY;
  const trendByDrift: Trend = directional && driftAtr >= DRIFT_THRESHOLD_ATR ? "UP" : directional && driftAtr <= -DRIFT_THRESHOLD_ATR ? "DOWN" : "RANGE";
  const trendByStructure = structureTrend(structure);
  const acceptableTrends = [...new Set<Trend>([trendByDrift, trendByStructure])];

  const levels = cluster(swingsAbs.map((s) => s.price), atr * CLUSTER_ATR).filter((c) => c.touches >= 2);
  const poolsOf = (type: "high" | "low"): LiquidityPool[] =>
    cluster(swingsAbs.filter((s) => s.type === type).map((s) => s.price), atr * CLUSTER_ATR)
      .filter((c) => c.touches >= 2)
      .map((c) => ({ side: type, price: c.price, touches: c.touches }));
  const pools = [...poolsOf("high"), ...poolsOf("low")];

  // Supply/demand candidates: the candle of a swing from which price then left by ≥ 2 ATR within 12 bars.
  const zones: ZoneCandidate[] = [];
  for (const s of swingsAbs) {
    const c = candles[s.index]!;
    const after = candles.slice(s.index + 1, s.index + 13);
    if (after.length < 4) continue;
    if (s.type === "high") {
      const departure = (c.high - Math.min(...after.map((x) => x.low))) / atr;
      if (departure < 2) continue;
      const top = c.high;
      const bottom = Math.min(Math.max(Math.min(c.open, c.close), top - atr), top - atr * 0.3);
      zones.push({ role: "supply", top: roundTo(top, 1), bottom: roundTo(bottom, 1), index: s.index, departureAtr: roundTo(departure, 2) });
    } else {
      const departure = (Math.max(...after.map((x) => x.high)) - c.low) / atr;
      if (departure < 2) continue;
      const bottom = c.low;
      const top = Math.max(Math.min(Math.max(c.open, c.close), bottom + atr), bottom + atr * 0.3);
      zones.push({ role: "demand", top: roundTo(top, 1), bottom: roundTo(bottom, 1), index: s.index, departureAtr: roundTo(departure, 2) });
    }
  }

  const recent = swingsAbs.slice(-12);
  const legs: FibLeg[] = [];
  for (let i = 0; i + 1 < recent.length; i++) {
    const a = recent[i]!;
    const b = recent[i + 1]!;
    if (a.type === b.type) continue;
    const sizeAtr = Math.abs(b.price - a.price) / atr;
    if (sizeAtr < 2) continue;
    legs.push({ a: { index: a.index, price: a.price }, b: { index: b.index, price: b.price }, direction: b.price > a.price ? "up" : "down", sizeAtr: roundTo(sizeAtr, 2) });
  }

  const body = last.close - last.open;
  const range = last.high - last.low || 1;
  return {
    atr: roundTo(atr, 2),
    lastClose: last.close,
    lastIndex,
    driftAtr,
    efficiency,
    trendByDrift,
    trendByStructure,
    acceptableTrends,
    structure,
    lastHighLabel: lastHigh?.label ?? null,
    lastLowLabel: lastLow?.label ?? null,
    swings: swingsAbs.slice(-14),
    levels,
    pools,
    zones: zones.slice(-8),
    legs,
    lastCandle: {
      direction: Math.abs(body) < range * 0.1 ? "doji" : body > 0 ? "bullish" : "bearish",
      bodyAtr: roundTo(Math.abs(body) / atr, 2),
      upperWickPct: Math.round(((last.high - Math.max(last.open, last.close)) / range) * 100),
      lowerWickPct: Math.round(((Math.min(last.open, last.close) - last.low) / range) * 100),
    },
  };
}

/**
 * Picks the decision point for a seed: the first candidate bar (from a seed-derived start) where the chart has a readable context
 * — a non-range structure, at least one repeated level and a leg of ≥ 2 ATR. Falls back to the start so it always returns.
 */
export function pickDecisionIndex(candles: readonly Candle[], seed: number, min: number, max: number): number {
  const span = Math.max(1, max - min);
  const start = min + (Math.abs(seed) % span);
  for (let k = 0; k < span; k += 3) {
    const idx = min + ((start - min + k) % span);
    try {
      const f = analyzeChart(candles.slice(0, idx));
      if (f.structure !== "RANGE" && f.levels.length >= 1 && f.legs.length >= 1) return idx;
    } catch {
      /* not enough data: try the next candidate */
    }
  }
  return start;
}
