import { scriptedSeries } from "@/lib/market-data/demo-generator";
import { detectSwings, labelStructure, type LabelledSwing } from "@/lib/market-data/indicators";
import type { Candle } from "@/lib/market-data/types";
import type { ChartOverlay } from "@/features/chart/types";
import type { ScenarioDef } from "@/modules/scenarios/types";

export function buildScenarioCandles(def: ScenarioDef): Candle[] {
  return scriptedSeries({
    seed: def.seed,
    timeframe: def.timeframe,
    startTime: Date.parse(def.startISO) / 1000,
    tickSize: def.symbol === "US30" ? 0.1 : 1,
    points: def.points,
    tail: def.tail ?? 0,
    noise: def.noise ?? 0.2,
    overrides: def.overrides,
  });
}

/** Interior waypoints are, by construction, the scenario's *intended* swings. */
export function intendedSwings(def: ScenarioDef): LabelledSwing[] {
  const pts = def.points;
  const swings = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1]!;
    const cur = pts[i]!;
    const next = pts[i + 1]!;
    if (cur.price > prev.price && cur.price > next.price) swings.push({ index: cur.at, type: "high" as const, price: cur.price });
    else if (cur.price < prev.price && cur.price < next.price) swings.push({ index: cur.at, type: "low" as const, price: cur.price });
  }
  return labelStructure(swings);
}

/** What a fractal detector (3/3) sees in the generated candles — must equal `intendedSwings` for structure scenarios. */
export function detectedSwings(candles: readonly Candle[]) {
  return labelStructure(detectSwings(candles, 3, 3));
}

/** Marker overlays (HH/HL/LH/LL) generated from the intended swings of a structure scenario. */
export function structureOverlays(def: ScenarioDef): ChartOverlay[] {
  return intendedSwings(def).map((s) => ({
    type: "marker" as const,
    id: `swing-${s.index}`,
    index: s.index,
    price: s.price,
    label: s.label ?? (s.type === "high" ? "H" : "L"),
    placement: s.type === "high" ? ("above" as const) : ("below" as const),
    tone: s.label === "HH" || s.label === "HL" ? ("success" as const) : s.label === "LH" || s.label === "LL" ? ("danger" as const) : ("muted" as const),
  }));
}
