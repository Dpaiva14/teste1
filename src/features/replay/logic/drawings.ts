import type { ChartOverlay } from "@/features/chart/types";
import { KEY_RETRACEMENTS, ratioLabel, retracementLevels } from "@/features/labs/logic/fibonacci";
import type { Drawing } from "../schemas";

/** Converts the student's annotations into chart overlays (indices become relative to the visible window). */
export function drawingsToOverlays(drawings: readonly Drawing[], windowStart: number): ChartOverlay[] {
  const rel = (abs: number) => abs - windowStart;
  return drawings.map((d, n): ChartOverlay => {
    switch (d.kind) {
      case "level":
        return { type: "hline", id: `dr-${d.id}`, price: d.price, label: `N${n + 1}`, tone: "info", dashed: true };
      case "zone":
        return { type: "zone", id: `dr-${d.id}`, top: Math.max(d.top, d.bottom), bottom: Math.min(d.top, d.bottom), fromIndex: rel(d.fromIndex), label: `Z${n + 1}`, tone: "primary" };
      case "trend":
        return { type: "trendline", id: `dr-${d.id}`, from: { index: rel(d.from.index), price: d.from.price }, to: { index: rel(d.to.index), price: d.to.price }, tone: "warning", extend: true };
      case "fib":
        return {
          type: "fib",
          id: `dr-${d.id}`,
          fromIndex: rel(Math.min(d.from.index, d.to.index)),
          anchors: [
            { index: rel(d.from.index), price: d.from.price, label: "A" },
            { index: rel(d.to.index), price: d.to.price, label: "B" },
          ],
          levels: retracementLevels(d.from.price, d.to.price, [0, 0.382, 0.5, 0.618, 0.786, 1]).map((l) => ({
            ratio: l.ratio,
            price: l.price,
            label: ratioLabel(l.ratio),
            emphasis: (KEY_RETRACEMENTS as readonly number[]).includes(l.ratio),
          })),
        };
    }
  });
}

/**
 * Did the student mark anything on the chart before entering? Used by the process evaluation ("preparação").
 * Counted on the SERVER from the stored drawings, never trusted from the client.
 */
export function isPrepared(drawings: readonly Drawing[]): boolean {
  return drawings.length > 0;
}

export const TOOL_LABEL: Record<Drawing["kind"], string> = { level: "Nível", zone: "Zona", trend: "Tendência", fib: "Fibonacci" };
