"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { DemoBadge } from "@/components/brand/demo-badge";
import { useElementWidth } from "@/hooks/use-element-width";
import { cn } from "@/lib/utils";
import type { Candle } from "@/lib/market-data/types";
import {
  DEFAULT_PADDING,
  computeDomain,
  formatAxisTime,
  formatDayLabel,
  indexForX,
  niceTicks,
  plotHeight,
  plotWidth,
  priceForY,
  slotWidth,
  xForIndex,
  yForPrice,
} from "../logic/chart-math";
import type { ChartMode, ChartOverlay, ChartPoint, ChartViewport, OverlayTone } from "../types";

const TONE: Record<OverlayTone, string> = {
  primary: "var(--primary)",
  success: "var(--success)",
  danger: "var(--danger)",
  warning: "var(--warning)",
  muted: "var(--muted-foreground)",
  info: "var(--info)",
};
const tone = (t: OverlayTone | undefined, fallback: OverlayTone = "primary") => TONE[t ?? fallback];

export interface CandleChartProps {
  candles: readonly Candle[];
  /** Number of candle slots shown across the chart. */
  visibleCount?: number;
  /** Fixed first visible index; default keeps the latest candles in view. */
  startIndex?: number;
  /** Empty slots kept free on the right (room for what hasn't happened yet). */
  rightPadSlots?: number;
  overlays?: readonly ChartOverlay[];
  /** Overlay shown while the user is dragging (zone preview). */
  draftZone?: { top: number; bottom: number; fromIndex: number; toIndex: number } | null;
  height?: number;
  mode?: ChartMode;
  onPointClick?: (p: ChartPoint) => void;
  onDragEnd?: (a: ChartPoint, b: ChartPoint) => void;
  onHover?: (p: ChartPoint | null) => void;
  priceDecimals?: number;
  showVolume?: boolean;
  showDemoBadge?: boolean;
  intraday?: boolean;
  timeZone?: string;
  /** Extra prices that must stay inside the y-domain (e.g. stop/target lines). */
  extraPrices?: readonly number[];
  ariaLabel: string;
  className?: string;
}

function CandleLayerImpl({ candles, vp, showVolume }: { candles: readonly Candle[]; vp: ChartViewport; showVolume: boolean }) {
  const slot = slotWidth(vp);
  const bodyW = Math.max(1, Math.min(slot * 0.72, 14));
  const from = Math.max(0, Math.floor(vp.first));
  const to = Math.min(candles.length - 1, Math.ceil(vp.first + vp.count));
  let up = "";
  let down = "";
  let volUp = "";
  let volDown = "";
  let maxVol = 1;
  for (let i = from; i <= to; i++) maxVol = Math.max(maxVol, candles[i]!.volume);
  const volH = plotHeight(vp) * 0.14;
  const baseY = vp.height - vp.padding.bottom;

  for (let i = from; i <= to; i++) {
    const c = candles[i]!;
    const x = xForIndex(vp, i);
    const yH = yForPrice(vp, c.high);
    const yL = yForPrice(vp, c.low);
    const yO = yForPrice(vp, c.open);
    const yC = yForPrice(vp, c.close);
    const top = Math.min(yO, yC);
    const h = Math.max(1, Math.abs(yC - yO));
    const seg = `M${x.toFixed(1)} ${yH.toFixed(1)}V${yL.toFixed(1)}M${(x - bodyW / 2).toFixed(1)} ${top.toFixed(1)}h${bodyW.toFixed(1)}v${h.toFixed(1)}h${(-bodyW).toFixed(1)}z`;
    const vh = (c.volume / maxVol) * volH;
    const vseg = `M${(x - bodyW / 2).toFixed(1)} ${baseY}h${bodyW.toFixed(1)}v${(-vh).toFixed(1)}h${(-bodyW).toFixed(1)}z`;
    if (c.close >= c.open) {
      up += seg;
      volUp += vseg;
    } else {
      down += seg;
      volDown += vseg;
    }
  }
  return (
    <g>
      {showVolume && (
        <>
          <path d={volUp} fill="var(--candle-up)" opacity={0.22} />
          <path d={volDown} fill="var(--candle-down)" opacity={0.22} />
        </>
      )}
      <path d={up} fill="var(--candle-up)" stroke="var(--candle-up)" strokeWidth={1} />
      <path d={down} fill="var(--candle-down)" stroke="var(--candle-down)" strokeWidth={1} />
    </g>
  );
}
const CandleLayer = memo(CandleLayerImpl);

function GridLayerImpl({
  candles,
  vp,
  decimals,
  intraday,
  timeZone,
}: {
  candles: readonly Candle[];
  vp: ChartViewport;
  decimals: number;
  intraday: boolean;
  timeZone: string;
}) {
  const ticks = niceTicks(vp.minPrice, vp.maxPrice, Math.max(3, Math.round(plotHeight(vp) / 56)));
  const slot = slotWidth(vp);
  const stepSlots = Math.max(1, Math.ceil(78 / slot));
  const from = Math.max(0, Math.floor(vp.first));
  const to = Math.min(candles.length - 1, Math.ceil(vp.first + vp.count));
  const labels: { x: number; text: string; day: boolean }[] = [];
  let prevDay = "";
  for (let i = from; i <= to; i++) {
    const c = candles[i]!;
    const day = formatDayLabel(c.time, timeZone);
    const isNewDay = intraday && day !== prevDay;
    prevDay = day;
    if (i % stepSlots === 0 || isNewDay) {
      labels.push({ x: xForIndex(vp, i), text: isNewDay ? day : formatAxisTime(c.time, intraday, timeZone), day: isNewDay });
    }
  }
  // drop labels that would overlap
  const filtered: typeof labels = [];
  for (const l of labels) {
    const last = filtered[filtered.length - 1];
    if (!last || l.x - last.x > 52) filtered.push(l);
    else if (l.day) filtered[filtered.length - 1] = l;
  }
  const right = vp.width - vp.padding.right;
  return (
    <g fontSize={10} fill="var(--chart-axis)">
      {ticks.map((t) => {
        const y = yForPrice(vp, t);
        return (
          <g key={t}>
            <line x1={vp.padding.left} x2={right} y1={y} y2={y} stroke="var(--chart-grid)" strokeWidth={1} />
            <text x={right + 6} y={y + 3.5} className="tabular">
              {t.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
            </text>
          </g>
        );
      })}
      {filtered.map((l, i) => (
        <g key={`${l.x}-${i}`}>
          <line x1={l.x} x2={l.x} y1={vp.padding.top} y2={vp.height - vp.padding.bottom} stroke="var(--chart-grid)" strokeWidth={1} opacity={l.day ? 1 : 0.45} />
          <text x={l.x} y={vp.height - 8} textAnchor="middle" fontWeight={l.day ? 600 : 400}>
            {l.text}
          </text>
        </g>
      ))}
    </g>
  );
}
const GridLayer = memo(GridLayerImpl);

function OverlayLayer({ overlays, vp, decimals }: { overlays: readonly ChartOverlay[]; vp: ChartViewport; decimals: number }) {
  const left = vp.padding.left;
  const right = vp.width - vp.padding.right;
  const fmt = (p: number) => p.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const inView = (y: number) => y >= vp.padding.top - 2 && y <= vp.height - vp.padding.bottom + 2;

  return (
    <g fontSize={10.5}>
      {overlays.map((o) => {
        switch (o.type) {
          case "hline": {
            const y = yForPrice(vp, o.price);
            if (!inView(y)) return null;
            const col = tone(o.tone, "warning");
            return (
              <g key={o.id}>
                <line x1={left} x2={right} y1={y} y2={y} stroke={col} strokeWidth={1.25} strokeDasharray={o.dashed ? "5 4" : undefined} />
                <rect x={right + 1} y={y - 8} width={vp.padding.right - 2} height={16} rx={3} fill={col} />
                <text x={right + 5} y={y + 3.5} fill="var(--background)" fontWeight={600} className="tabular">
                  {fmt(o.price)}
                </text>
                {o.label && (
                  <text x={left + 6} y={y - 4} fill={col} fontWeight={600}>
                    {o.label}
                  </text>
                )}
              </g>
            );
          }
          case "vline": {
            const x = xForIndex(vp, o.index);
            const col = tone(o.tone, "muted");
            return (
              <g key={o.id}>
                <line x1={x} x2={x} y1={vp.padding.top} y2={vp.height - vp.padding.bottom} stroke={col} strokeDasharray="4 4" />
                {o.label && (
                  <text x={x + 4} y={vp.padding.top + 11} fill={col} fontWeight={600}>
                    {o.label}
                  </text>
                )}
              </g>
            );
          }
          case "zone": {
            const x1 = o.fromIndex === undefined ? left : Math.max(left, xForIndex(vp, o.fromIndex) - slotWidth(vp) / 2);
            const x2 = o.toIndex === undefined ? right : Math.min(right, xForIndex(vp, o.toIndex) + slotWidth(vp) / 2);
            const y1 = yForPrice(vp, Math.max(o.top, o.bottom));
            const y2 = yForPrice(vp, Math.min(o.top, o.bottom));
            if (x2 <= x1) return null;
            const col = tone(o.tone, "primary");
            return (
              <g key={o.id}>
                <rect x={x1} y={y1} width={x2 - x1} height={Math.max(2, y2 - y1)} fill={col} opacity={0.16} />
                <rect x={x1} y={y1} width={x2 - x1} height={Math.max(2, y2 - y1)} fill="none" stroke={col} strokeWidth={1} opacity={0.7} />
                {o.label && (
                  <text x={x1 + 6} y={y1 + 12} fill={col} fontWeight={600}>
                    {o.label}
                  </text>
                )}
              </g>
            );
          }
          case "marker": {
            const x = xForIndex(vp, o.index);
            const y = yForPrice(vp, o.price);
            const col = tone(o.tone, "info");
            const ty = o.placement === "above" ? y - 12 : y + 20;
            return (
              <g key={o.id}>
                <circle cx={x} cy={y} r={3.5} fill={col} stroke="var(--background)" strokeWidth={1.5} />
                <text x={x} y={ty} textAnchor="middle" fill={col} fontWeight={700} fontSize={11.5} stroke="var(--background)" strokeWidth={3} paintOrder="stroke">
                  {o.label}
                </text>
              </g>
            );
          }
          case "arrow": {
            const x = xForIndex(vp, o.index);
            const y = yForPrice(vp, o.price);
            const col = tone(o.tone, o.direction === "up" ? "success" : "danger");
            const d = o.direction === "up" ? `M${x} ${y + 4}l-6 10h12z` : `M${x} ${y - 4}l-6 -10h12z`;
            return (
              <g key={o.id}>
                <path d={d} fill={col} />
                {o.label && (
                  <text x={x} y={o.direction === "up" ? y + 28 : y - 20} textAnchor="middle" fill={col} fontWeight={700}>
                    {o.label}
                  </text>
                )}
              </g>
            );
          }
          case "trendline": {
            const x1 = xForIndex(vp, o.from.index);
            const y1 = yForPrice(vp, o.from.price);
            let x2 = xForIndex(vp, o.to.index);
            let y2 = yForPrice(vp, o.to.price);
            if (o.extend && x2 !== x1) {
              const slope = (y2 - y1) / (x2 - x1);
              x2 = right;
              y2 = y1 + slope * (x2 - x1);
            }
            const col = tone(o.tone, "info");
            return (
              <g key={o.id}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={1.75} />
                {o.label && (
                  <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} fill={col} fontWeight={600}>
                    {o.label}
                  </text>
                )}
              </g>
            );
          }
          case "fib": {
            const x0 = Math.max(left, xForIndex(vp, o.fromIndex));
            return (
              <g key={o.id}>
                {o.levels.map((l) => {
                  const y = yForPrice(vp, l.price);
                  if (!inView(y)) return null;
                  const col = l.emphasis ? "var(--warning)" : "var(--info)";
                  return (
                    <g key={l.ratio}>
                      <line x1={x0} x2={right} y1={y} y2={y} stroke={col} strokeWidth={l.emphasis ? 1.5 : 1} strokeDasharray={l.emphasis ? undefined : "4 4"} opacity={0.9} />
                      <text x={x0 + 4} y={y - 3} fill={col} fontWeight={l.emphasis ? 700 : 500} className="tabular" stroke="var(--chart-bg)" strokeWidth={3} paintOrder="stroke">
                        {l.label} · {fmt(l.price)}
                      </text>
                    </g>
                  );
                })}
                {o.anchors?.map((a) => (
                  <g key={a.label}>
                    <circle cx={xForIndex(vp, a.index)} cy={yForPrice(vp, a.price)} r={4} fill="var(--warning)" stroke="var(--background)" strokeWidth={1.5} />
                    <text x={xForIndex(vp, a.index)} y={yForPrice(vp, a.price) - 8} textAnchor="middle" fill="var(--warning)" fontWeight={700} stroke="var(--chart-bg)" strokeWidth={3} paintOrder="stroke">
                      {a.label}
                    </text>
                  </g>
                ))}
              </g>
            );
          }
          case "position": {
            const x1 = Math.max(left, xForIndex(vp, o.fromIndex));
            const x2 = o.toIndex === undefined ? right : Math.min(right, xForIndex(vp, o.toIndex));
            const yE = yForPrice(vp, o.entry);
            const sign = o.direction === "LONG" ? 1 : -1;
            return (
              <g key={o.id}>
                {o.target != null && (
                  <g>
                    <rect x={x1} y={Math.min(yE, yForPrice(vp, o.target))} width={Math.max(0, x2 - x1)} height={Math.abs(yForPrice(vp, o.target) - yE)} fill="var(--success)" opacity={0.15} />
                    <line x1={x1} x2={x2} y1={yForPrice(vp, o.target)} y2={yForPrice(vp, o.target)} stroke="var(--success)" strokeWidth={1.25} />
                    <text x={x1 + 4} y={yForPrice(vp, o.target) + (sign > 0 ? 12 : -4)} fill="var(--success)" fontWeight={600}>
                      TP {fmt(o.target)}
                    </text>
                  </g>
                )}
                {o.stop != null && (
                  <g>
                    <rect x={x1} y={Math.min(yE, yForPrice(vp, o.stop))} width={Math.max(0, x2 - x1)} height={Math.abs(yForPrice(vp, o.stop) - yE)} fill="var(--danger)" opacity={0.15} />
                    <line x1={x1} x2={x2} y1={yForPrice(vp, o.stop)} y2={yForPrice(vp, o.stop)} stroke="var(--danger)" strokeWidth={1.25} />
                    <text x={x1 + 4} y={yForPrice(vp, o.stop) + (sign > 0 ? -4 : 12)} fill="var(--danger)" fontWeight={600}>
                      SL {fmt(o.stop)}
                    </text>
                  </g>
                )}
                <line x1={x1} x2={x2} y1={yE} y2={yE} stroke="var(--foreground)" strokeWidth={1.25} strokeDasharray="3 3" />
                <text x={x1 + 4} y={yE - 4} fill="var(--foreground)" fontWeight={600}>
                  {o.direction === "LONG" ? "LONG" : "SHORT"} {fmt(o.entry)}
                </text>
              </g>
            );
          }
        }
      })}
    </g>
  );
}

export function CandleChart({
  candles,
  visibleCount = 120,
  startIndex,
  rightPadSlots = 6,
  overlays = [],
  draftZone = null,
  height = 420,
  mode = "none",
  onPointClick,
  onDragEnd,
  onHover,
  priceDecimals = 0,
  showVolume = true,
  showDemoBadge = true,
  intraday = true,
  timeZone = "UTC",
  extraPrices = [],
  ariaLabel,
  className,
}: CandleChartProps) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<ChartPoint | null>(null);
  const [drag, setDrag] = useState<{ start: ChartPoint; current: ChartPoint; px: number; py: number } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const count = visibleCount;
  const first = startIndex ?? Math.max(0, candles.length - (count - rightPadSlots));

  const overlayPrices = useMemo(() => {
    const out: number[] = [...extraPrices];
    for (const o of overlays) {
      if (o.type === "hline") out.push(o.price);
      else if (o.type === "zone") out.push(o.top, o.bottom);
      else if (o.type === "marker" || o.type === "arrow") out.push(o.price);
      else if (o.type === "position") out.push(o.entry, ...(o.stop != null ? [o.stop] : []), ...(o.target != null ? [o.target] : []));
      else if (o.type === "fib") out.push(...o.levels.map((l) => l.price));
    }
    return out;
  }, [overlays, extraPrices]);

  const vp: ChartViewport = useMemo(() => {
    const dom = computeDomain(candles, first, count, overlayPrices);
    return { width, height, padding: DEFAULT_PADDING, first, count, minPrice: dom.min, maxPrice: dom.max };
  }, [candles, first, count, overlayPrices, width, height]);

  const toPoint = useCallback(
    (clientX: number, clientY: number): ChartPoint | null => {
      const el = svgRef.current;
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      const index = indexForX(vp, x);
      return { index, price: priceForY(vp, y), time: candles[index]?.time ?? null };
    },
    [vp, candles],
  );

  const interactive = mode !== "none";

  const last = candles[candles.length - 1];
  const lastY = last ? yForPrice(vp, last.close) : null;
  const lastUp = last ? last.close >= last.open : true;
  const fmt = (p: number) => p.toLocaleString("en-US", { minimumFractionDigits: priceDecimals, maximumFractionDigits: priceDecimals });

  const draft = drag && mode === "drag"
    ? { top: Math.max(drag.start.price, drag.current.price), bottom: Math.min(drag.start.price, drag.current.price), fromIndex: Math.min(drag.start.index, drag.current.index), toIndex: Math.max(drag.start.index, drag.current.index) }
    : draftZone;

  const hoverCandle = hover ? candles[hover.index] : undefined;

  return (
    <div ref={ref} className={cn("relative w-full select-none overflow-hidden rounded-lg border bg-[var(--chart-bg)]", className)} style={{ height }}>
      {showDemoBadge && (
        <div className="pointer-events-none absolute left-2 top-2 z-10">
          <DemoBadge />
        </div>
      )}
      {hoverCandle && (
        <div className="pointer-events-none absolute right-16 top-2 z-10 hidden rounded-md border bg-card/90 px-2 py-1 text-[11px] tabular text-muted-foreground backdrop-blur sm:block">
          O {fmt(hoverCandle.open)} · H {fmt(hoverCandle.high)} · L {fmt(hoverCandle.low)} · C {fmt(hoverCandle.close)}
        </div>
      )}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        className={cn("block", mode === "click" && "cursor-crosshair touch-pan-y", mode === "drag" && "cursor-crosshair touch-none")}
        onPointerDown={(e) => {
          if (!interactive) return;
          const p = toPoint(e.clientX, e.clientY);
          if (!p) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag({ start: p, current: p, px: e.clientX, py: e.clientY });
        }}
        onPointerMove={(e) => {
          const p = toPoint(e.clientX, e.clientY);
          if (!p) return;
          setHover(p);
          onHover?.(p);
          if (drag) setDrag({ ...drag, current: p });
        }}
        onPointerUp={(e) => {
          if (!drag) return;
          const p = toPoint(e.clientX, e.clientY) ?? drag.current;
          const moved = Math.hypot(e.clientX - drag.px, e.clientY - drag.py) > 5;
          const start = drag.start;
          setDrag(null);
          if (mode === "drag" && moved) onDragEnd?.(start, p);
          else onPointClick?.(p);
        }}
        onPointerCancel={() => setDrag(null)}
        onPointerLeave={() => {
          setHover(null);
          onHover?.(null);
        }}
      >
        <title>{ariaLabel}</title>
        <rect x={0} y={0} width={width} height={height} fill="var(--chart-bg)" />
        <GridLayer candles={candles} vp={vp} decimals={priceDecimals} intraday={intraday} timeZone={timeZone} />
        <g clipPath="url(#plot-clip)">
          <CandleLayer candles={candles} vp={vp} showVolume={showVolume} />
        </g>
        <defs>
          <clipPath id="plot-clip">
            <rect x={vp.padding.left} y={vp.padding.top} width={plotWidth(vp)} height={plotHeight(vp)} />
          </clipPath>
        </defs>
        <g clipPath="url(#plot-clip)">
          <OverlayLayer overlays={overlays} vp={vp} decimals={priceDecimals} />
          {draft && (
            <rect
              x={xForIndex(vp, draft.fromIndex) - slotWidth(vp) / 2}
              y={yForPrice(vp, draft.top)}
              width={Math.max(2, xForIndex(vp, draft.toIndex) - xForIndex(vp, draft.fromIndex) + slotWidth(vp))}
              height={Math.max(2, yForPrice(vp, draft.bottom) - yForPrice(vp, draft.top))}
              fill="var(--primary)"
              opacity={0.2}
              stroke="var(--primary)"
              strokeDasharray="4 3"
            />
          )}
        </g>
        {last && lastY !== null && lastY >= vp.padding.top && lastY <= vp.height - vp.padding.bottom && (
          <g>
            <line x1={vp.padding.left} x2={vp.width - vp.padding.right} y1={lastY} y2={lastY} stroke={lastUp ? "var(--candle-up)" : "var(--candle-down)"} strokeDasharray="2 3" opacity={0.7} />
            <rect x={vp.width - vp.padding.right + 1} y={lastY - 8} width={vp.padding.right - 2} height={16} rx={3} fill={lastUp ? "var(--candle-up)" : "var(--candle-down)"} />
            <text x={vp.width - vp.padding.right + 5} y={lastY + 3.5} fontSize={10.5} fontWeight={700} fill="#fff" className="tabular">
              {fmt(last.close)}
            </text>
          </g>
        )}
        {hover && interactive && (
          <g pointerEvents="none" opacity={0.65}>
            <line x1={xForIndex(vp, hover.index)} x2={xForIndex(vp, hover.index)} y1={vp.padding.top} y2={vp.height - vp.padding.bottom} stroke="var(--chart-axis)" strokeDasharray="3 3" />
            <line x1={vp.padding.left} x2={vp.width - vp.padding.right} y1={yForPrice(vp, hover.price)} y2={yForPrice(vp, hover.price)} stroke="var(--chart-axis)" strokeDasharray="3 3" />
            <rect x={vp.width - vp.padding.right + 1} y={yForPrice(vp, hover.price) - 8} width={vp.padding.right - 2} height={16} rx={3} fill="var(--muted-foreground)" />
            <text x={vp.width - vp.padding.right + 5} y={yForPrice(vp, hover.price) + 3.5} fontSize={10.5} fill="var(--background)" className="tabular">
              {fmt(hover.price)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
