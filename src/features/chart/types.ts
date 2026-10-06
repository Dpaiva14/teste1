import type { Candle } from "@/lib/market-data/types";

export type OverlayTone = "primary" | "success" | "danger" | "warning" | "muted" | "info";

export interface ChartPoint {
  /** candle index (integer, may be outside the loaded range when pointer is beyond the last candle) */
  index: number;
  price: number;
  /** epoch seconds of the candle at `index`, if it exists */
  time: number | null;
}

export type ChartOverlay =
  | { type: "hline"; id: string; price: number; label?: string; tone?: OverlayTone; dashed?: boolean }
  | { type: "vline"; id: string; index: number; label?: string; tone?: OverlayTone }
  | {
      type: "zone";
      id: string;
      top: number;
      bottom: number;
      /** candle index where the zone starts; default = left edge */
      fromIndex?: number;
      /** candle index where the zone ends; default = right edge */
      toIndex?: number;
      label?: string;
      tone?: OverlayTone;
    }
  | { type: "marker"; id: string; index: number; price: number; label: string; placement: "above" | "below"; tone?: OverlayTone }
  | { type: "trendline"; id: string; from: { index: number; price: number }; to: { index: number; price: number }; tone?: OverlayTone; label?: string; extend?: boolean }
  | {
      type: "fib";
      id: string;
      /** price at ratio 0 / 1 depends on tool: see features/fibonacci/logic */
      levels: readonly { ratio: number; price: number; label: string; emphasis?: boolean }[];
      fromIndex: number;
      /** anchor points drawn as small dots (A, B, C) */
      anchors?: readonly { index: number; price: number; label: string }[];
    }
  | {
      type: "position";
      id: string;
      direction: "LONG" | "SHORT";
      entry: number;
      stop?: number | null;
      target?: number | null;
      fromIndex: number;
      toIndex?: number;
    }
  | { type: "arrow"; id: string; index: number; price: number; direction: "up" | "down"; label?: string; tone?: OverlayTone };

export interface ChartViewport {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  /** index of first visible candle (can be fractional while panning) */
  first: number;
  /** number of candle slots across the plot area */
  count: number;
  minPrice: number;
  maxPrice: number;
}

export type ChartMode = "none" | "click" | "drag";

export type { Candle };
