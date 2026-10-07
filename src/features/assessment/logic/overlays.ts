import type { ChartOverlay } from "@/features/chart/types";
import { KEY_RETRACEMENTS, ratioLabel, retracementLevels } from "@/features/labs/logic/fibonacci";
import type { Answers } from "../schemas";
import type { ReferenceDTO } from "../types";

/** Pure, client-safe helpers that turn the student's answers (and the reference reading) into chart overlays. */

export function fibOverlay(id: string, from: { index: number; price: number }, to: { index: number; price: number }, windowStart: number): ChartOverlay {
  const rel = (abs: number) => abs - windowStart;
  return {
    type: "fib",
    id,
    fromIndex: rel(Math.min(from.index, to.index)),
    anchors: [
      { index: rel(from.index), price: from.price, label: "A" },
      { index: rel(to.index), price: to.price, label: "B" },
    ],
    levels: retracementLevels(from.price, to.price, [0, 0.382, 0.5, 0.618, 0.786, 1]).map((l) => ({ ratio: l.ratio, price: l.price, label: ratioLabel(l.ratio), emphasis: (KEY_RETRACEMENTS as readonly number[]).includes(l.ratio) })),
  };
}

export function answersToOverlays(a: Answers, windowStart: number, lastRelIndex: number): ChartOverlay[] {
  const out: ChartOverlay[] = [];
  a.sr.forEach((s, n) => out.push({ type: "hline", id: `sr-${s.id}`, price: s.price, label: `S/R ${n + 1}`, tone: "info", dashed: true }));
  for (const z of a.zones) {
    out.push({
      type: "zone",
      id: `zn-${z.id}`,
      top: Math.max(z.top, z.bottom),
      bottom: Math.min(z.top, z.bottom),
      fromIndex: Math.max(0, z.fromIndex - windowStart),
      label: z.role === "demand" ? "Procura" : "Oferta",
      tone: z.role === "demand" ? "success" : "danger",
    });
  }
  if (a.fib) out.push(fibOverlay("fib", a.fib.from, a.fib.to, windowStart));
  a.liquidity.levels.forEach((l) => out.push({ type: "hline", id: `lq-${l.id}`, price: l.price, label: "Liquidez", tone: "warning", dashed: true }));
  if (a.direction && a.entry !== null) out.push({ type: "position", id: "plan", direction: a.direction, entry: a.entry, stop: a.stop, target: a.target, fromIndex: Math.max(0, lastRelIndex) });
  return out;
}

/** The computed reference reading, drawn in muted tones so it never competes with the student's own marks. */
export function referenceOverlays(ref: ReferenceDTO, windowStart: number): ChartOverlay[] {
  const out: ChartOverlay[] = [];
  ref.levels.forEach((l, n) => out.push({ type: "hline", id: `rf-lv-${n}`, price: l.price, label: `Ref. nível (${l.touches}×)`, tone: "muted", dashed: true }));
  ref.pools.forEach((p, n) => out.push({ type: "hline", id: `rf-pl-${n}`, price: p.price, label: `Ref. liquidez (${p.side === "high" ? "highs" : "lows"})`, tone: "warning", dashed: true }));
  ref.zones.slice(-4).forEach((z, n) =>
    out.push({ type: "zone", id: `rf-zn-${n}`, top: z.top, bottom: z.bottom, fromIndex: Math.max(0, z.index - windowStart), label: `Ref. ${z.role === "demand" ? "procura" : "oferta"}`, tone: "muted" }),
  );
  const leg = [...ref.legs].sort((x, y) => y.sizeAtr - x.sizeAtr)[0];
  if (leg) out.push(fibOverlay("rf-fib", leg.a, leg.b, windowStart));
  return out;
}
