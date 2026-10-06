import { StaticChart } from "@/features/chart/components/static-chart";
import { buildScenarioCandles, structureOverlays } from "@/features/scenarios/build";
import { getInstrument } from "@/modules/instruments";
import { getScenario } from "@/modules/scenarios";
import type { VisualSpec } from "@/modules/types";
import type { Candle } from "@/lib/market-data/types";
import { Diagram } from "./diagrams";

function Caption({ children }: { children: React.ReactNode }) {
  return <figcaption className="mt-2 text-center text-xs text-muted-foreground">{children}</figcaption>;
}

/** Server component: resolves a lesson's VisualSpec into a chart or diagram. */
export function LessonVisual({ spec }: { spec: VisualSpec }) {
  if (spec.kind === "diagram") {
    return (
      <figure>
        <Diagram id={spec.id} />
        {spec.caption && <Caption>{spec.caption}</Caption>}
      </figure>
    );
  }

  if (spec.kind === "candles") {
    const base = Date.UTC(2025, 0, 6, 14, 0) / 1000;
    const candles: Candle[] = spec.candles.map(([open, high, low, close], i) => ({ time: base + i * 900, open, high, low, close, volume: 1 }));
    return (
      <figure>
        <StaticChart candles={candles} overlays={[...(spec.overlays ?? [])]} height={spec.height ?? 300} demo={false} ariaLabel={spec.caption ?? "Ilustração de candles"} />
        <Caption>{spec.caption ? `${spec.caption} · ` : ""}Ilustração didática (não são dados reais).</Caption>
      </figure>
    );
  }

  const def = getScenario(spec.scenarioId);
  if (!def) return <p className="text-sm text-danger">Cenário em falta: {spec.scenarioId}</p>;
  const candles = buildScenarioCandles(def);
  const overlays = spec.annotations === "solution" ? [...(def.structure ? structureOverlays(def) : []), ...(def.annotations ?? [])] : [];
  return (
    <figure>
      <StaticChart
        candles={candles}
        overlays={overlays}
        height={spec.height ?? 360}
        priceDecimals={getInstrument(def.symbol)?.priceDecimals ?? 0}
        ariaLabel={`${def.title} — ${def.symbol} ${def.timeframe} (DEMO)`}
      />
      <Caption>{spec.caption ?? def.title} · {def.symbol} {def.timeframe} · dados sintéticos DEMO</Caption>
    </figure>
  );
}
