"use client";

import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart } from "@/components/ui/line-chart";
import { reasonMeta } from "@/features/trading/logic/entry-reasons";
import { formatUsd } from "@/lib/money";
import type { BacktestSummary } from "../logic/summary";

const pct = (n: number) => `${n.toLocaleString("pt-PT", { maximumFractionDigits: 1 })}%`;
const r = (n: number | null) => (n === null ? "—" : `${n > 0 ? "+" : ""}${n.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}R`);

/** Statistics and process diagnostics. Always shows the sample size and compares process with result. */
export function BacktestReport({ summary, initialBalance }: { summary: BacktestSummary; initialBalance: number }) {
  const p = summary.perf;
  const adh = summary.adherence;
  return (
    <div className="grid gap-4">
      <LineChart values={p.equityCurve} baseline={initialBalance} height={130} ariaLabel="Curva de capital dos trades do backtest" format={(v) => `$${(v / 1000).toFixed(1)}k`} />
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Decisões</dt>
        <dd className="text-right tabular">
          {summary.decisions} ({summary.buys} BUY · {summary.sells} SELL · {summary.waits} WAIT)
        </dd>
        <dt className="text-muted-foreground">% WAIT</dt>
        <dd className="text-right tabular">{pct(summary.waitRate)}</dd>
        <dt className="text-muted-foreground">Trades</dt>
        <dd className="text-right tabular">{p.trades}</dd>
        <dt className="text-muted-foreground">Win rate</dt>
        <dd className="text-right tabular">{pct(p.winRate)}</dd>
        <dt className="text-muted-foreground">Payoff</dt>
        <dd className="text-right tabular">{p.payoff ?? "—"}</dd>
        <dt className="text-muted-foreground">R médio</dt>
        <dd className="text-right tabular">{r(p.avgR)}</dd>
        <dt className="text-muted-foreground">Expectancy</dt>
        <dd className="text-right tabular">{formatUsd(p.expectancy)}/trade</dd>
        <dt className="text-muted-foreground">Profit factor</dt>
        <dd className="text-right tabular">{p.profitFactor ?? "—"}</dd>
        <dt className="text-muted-foreground">Máx. drawdown</dt>
        <dd className="text-right tabular">
          {formatUsd(p.maxDrawdown)}
          {p.maxDrawdownPercent !== null && ` (${pct(p.maxDrawdownPercent)})`}
        </dd>
        <dt className="text-muted-foreground">Máx. perdas seguidas</dt>
        <dd className="text-right tabular">{p.maxConsecutiveLosses}</dd>
        <dt className="text-muted-foreground">Duração média</dt>
        <dd className="text-right tabular">{summary.avgHoldBars === null ? "—" : `${summary.avgHoldBars} barras`}</dd>
      </dl>

      {p.trades > 0 && (
        <div className="grid gap-1.5 rounded-lg border bg-muted/30 p-3 text-sm">
          <p className="font-medium">Processo vs. resultado</p>
          <p className="text-xs text-muted-foreground">Entradas com todas as regras ticadas face às incompletas.</p>
          <dl className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1 text-xs">
            <dt className="text-muted-foreground" />
            <dd className="text-right text-muted-foreground">nº</dd>
            <dd className="text-right text-muted-foreground">R médio</dd>
            <dt>Regras completas</dt>
            <dd className="text-right tabular">{adh.full.count}</dd>
            <dd className="text-right tabular">{r(adh.full.avgR)}</dd>
            <dt>Regras incompletas</dt>
            <dd className="text-right tabular">{adh.partial.count}</dd>
            <dd className="text-right tabular">{r(adh.partial.avgR)}</dd>
          </dl>
          {summary.byReason.length > 0 && (
            <ul className="mt-1 grid gap-0.5 text-xs text-muted-foreground">
              {summary.byReason.map((x) => (
                <li key={x.reason} className="flex justify-between">
                  <span>{reasonMeta(x.reason)?.label ?? x.reason}</span>
                  <span className="tabular">
                    {x.count} · {r(x.avgR)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {summary.notes.map((n) => (
        <Alert key={n} variant="info">
          <Info />
          <AlertDescription className="text-xs">{n}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
