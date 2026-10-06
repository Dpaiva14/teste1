"use client";

import { CandleChart } from "./candle-chart";
import type { Candle } from "@/lib/market-data/types";
import type { ChartOverlay } from "../types";

/** Non-interactive chart used inside lessons and quiz questions. */
export function StaticChart({
  candles,
  overlays = [],
  height = 340,
  priceDecimals = 0,
  demo = true,
  ariaLabel,
  intraday = true,
}: {
  candles: Candle[];
  overlays?: ChartOverlay[];
  height?: number;
  priceDecimals?: number;
  demo?: boolean;
  ariaLabel: string;
  intraday?: boolean;
}) {
  return (
    <CandleChart
      candles={candles}
      visibleCount={candles.length + 4}
      startIndex={0}
      rightPadSlots={0}
      overlays={overlays}
      height={height}
      priceDecimals={priceDecimals}
      showDemoBadge={demo}
      showVolume={demo}
      intraday={intraday}
      ariaLabel={ariaLabel}
    />
  );
}
