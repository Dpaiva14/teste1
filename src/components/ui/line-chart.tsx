import { niceTicks } from "@/features/chart/logic/chart-math";
import { cn } from "@/lib/utils";

/**
 * Minimal responsive line/area chart (equity curves, R curves). Server- and client-safe, no dependencies.
 * `baseline` draws a dashed reference line (e.g. starting balance, or 0R).
 */
export function LineChart({
  values,
  height = 160,
  baseline,
  format = (v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 0 }),
  className,
  ariaLabel,
}: {
  values: readonly number[];
  height?: number;
  baseline?: number;
  format?: (v: number) => string;
  className?: string;
  ariaLabel: string;
}) {
  const W = 600;
  const pad = { l: 8, r: 54, t: 10, b: 14 };
  if (values.length < 2) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border text-sm text-muted-foreground", className)} style={{ height }}>
        Sem dados suficientes
      </div>
    );
  }
  const extra = baseline === undefined ? [] : [baseline];
  const min = Math.min(...values, ...extra);
  const max = Math.max(...values, ...extra);
  const span = max - min || 1;
  const lo = min - span * 0.08;
  const hi = max + span * 0.08;
  const x = (i: number) => pad.l + (i / (values.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + ((hi - v) / (hi - lo)) * (height - pad.t - pad.b);
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1).toFixed(1)} ${y(lo)} L${x(0).toFixed(1)} ${y(lo)} Z`;
  const last = values[values.length - 1]!;
  const up = baseline === undefined ? last >= values[0]! : last >= baseline;
  const col = up ? "var(--success)" : "var(--danger)";
  const ticks = niceTicks(lo, hi, 4);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={ariaLabel} className={cn("w-full rounded-lg border bg-[var(--chart-bg)]", className)} style={{ height }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" />
          <text x={W - pad.r + 6} y={y(t) + 3.5} fontSize={10} fill="var(--chart-axis)" className="tabular">{format(t)}</text>
        </g>
      ))}
      {baseline !== undefined && <line x1={pad.l} x2={W - pad.r} y1={y(baseline)} y2={y(baseline)} stroke="var(--muted-foreground)" strokeDasharray="4 4" />}
      <path d={area} fill={col} opacity={0.12} />
      <path d={line} fill="none" stroke={col} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(last)} r={3.5} fill={col} />
    </svg>
  );
}
