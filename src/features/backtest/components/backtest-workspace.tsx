"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Flag, Trash2 } from "lucide-react";
import { DemoBadge } from "@/components/brand/demo-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CandleChart } from "@/features/chart/components/candle-chart";
import type { ChartOverlay } from "@/features/chart/types";
import { api, errorMessage } from "@/lib/api-client";
import { lastAtr } from "@/lib/market-data/indicators";
import { formatR, formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";
import { getStrategy } from "@/modules/strategies";
import { previewPlan } from "../logic/preview";
import { reflect } from "../logic/reflection";
import type { DecisionInput } from "../schemas";
import type { BacktestStateDTO, DecisionDTO, DecisionResultDTO } from "../types";
import { BacktestReport } from "./backtest-report";
import { DecisionPanel, type Draft } from "./decision-panel";

const OUTCOME_TEXT: Record<DecisionDTO["outcome"], string> = { WIN: "Alvo", LOSS: "Stop", TIMEOUT: "Tempo limite", NO_TRADE: "—" };
const OUTCOME_TONE = { WIN: "success", LOSS: "danger", TIMEOUT: "warning", NO_TRADE: "muted" } as const;

function LastDecision({ d }: { d: DecisionDTO }) {
  if (d.choice === "WAIT") {
    return (
      <p className="text-sm text-muted-foreground">
        Última decisão: <strong className="text-foreground">WAIT</strong> — ficaste de fora. Não negociar também é uma decisão.
      </p>
    );
  }
  const ref = reflect(d);
  return (
    <div className="grid gap-2 text-sm">
      <p>
        <strong>
          #{d.seq} {d.choice}
        </strong>{" "}
        → {OUTCOME_TEXT[d.outcome].toLowerCase()}{" "}
        <span className={cn("font-semibold tabular", (d.pnl ?? 0) >= 0 ? "text-success" : "text-danger")}>
          {d.rMultiple !== null && `${formatR(d.rMultiple)} · `}
          {formatUsd(d.pnl ?? 0)}
        </span>
        {d.rulesTotal !== null && (
          <span className="text-muted-foreground">
            {" "}
            · regras {d.rulesMet}/{d.rulesTotal}
          </span>
        )}
      </p>
      {ref && (
        <div className={cn("rounded-md border p-3", ref.process === "weak" ? "border-warning/50 bg-warning/5" : ref.process === "solid" ? "border-success/40 bg-success/5" : "bg-muted/30")}>
          <p className="font-medium">{ref.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{ref.text}</p>
        </div>
      )}
    </div>
  );
}

export function BacktestWorkspace({ initial }: { initial: BacktestStateDTO }) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [draft, setDraft] = useState<Draft>({ choice: "BUY", stopPts: "", targetR: "2", noTarget: false });
  const busy = useRef(false);
  const strategy = getStrategy(state.strategyKey)!;
  const finished = state.status === "COMPLETED";
  const intraday = state.timeframe !== "D1";
  const dec = state.symbol === "US30" ? 1 : 0;

  const atr = useMemo(() => lastAtr(state.candles), [state.candles]);
  const stopDefault = Math.max(5, Math.round(atr * 1.5));

  const plan = useMemo(() => {
    if (draft.choice === "WAIT") return null;
    const stop = Number(draft.stopPts.replace(",", ".")) || stopDefault;
    const r = Number(draft.targetR.replace(",", "."));
    return previewPlan({ symbol: state.symbol, choice: draft.choice, balance: state.balance, riskPercent: state.riskPercent, bid: state.bid, stopPoints: stop, targetR: draft.noTarget || !(r > 0) ? null : r });
  }, [draft, state.symbol, state.balance, state.riskPercent, state.bid, stopDefault]);

  const lastDecision = state.decisions[state.decisions.length - 1];

  const overlays = useMemo<ChartOverlay[]>(() => {
    const out: ChartOverlay[] = [];
    const rel = (abs: number) => abs - state.windowStart;
    for (const d of state.decisions.slice(-60)) {
      const i = rel(d.barIndex);
      const c = state.candles[i];
      if (!c) continue;
      if (d.choice === "WAIT") {
        out.push({ type: "marker", id: `d${d.seq}`, index: i, price: c.high, label: "W", placement: "above", tone: "muted" });
      } else {
        out.push({ type: "arrow", id: `d${d.seq}`, index: i, price: d.choice === "BUY" ? c.low : c.high, direction: d.choice === "BUY" ? "up" : "down", tone: OUTCOME_TONE[d.outcome] });
      }
    }
    if (lastDecision && lastDecision.choice !== "WAIT" && lastDecision.entry !== null && lastDecision.exitIndex !== null) {
      out.push({
        type: "position",
        id: "last",
        direction: lastDecision.choice === "BUY" ? "LONG" : "SHORT",
        entry: lastDecision.entry,
        stop: lastDecision.stop,
        target: lastDecision.target,
        fromIndex: Math.max(0, rel(lastDecision.barIndex)),
        toIndex: rel(lastDecision.exitIndex),
      });
    }
    if (plan && !finished && plan.sizing.valid) {
      out.push({ type: "position", id: "preview", direction: plan.direction, entry: plan.entry, stop: plan.stop, target: plan.target, fromIndex: state.candles.length - 1 });
    }
    return out;
  }, [state.decisions, state.candles, state.windowStart, lastDecision, plan, finished]);

  const submit = useCallback(
    async (input: DecisionInput): Promise<boolean> => {
      if (busy.current) return false;
      busy.current = true;
      try {
        const res = await api<DecisionResultDTO>(`/api/backtests/${initial.id}/decisions`, { method: "POST", body: input });
        setState(res.state);
        for (const a of res.unlockedAchievements) toast.success(`Conquista desbloqueada: ${a.title}`);
        return true;
      } catch (e) {
        toast.error(errorMessage(e));
        return false;
      } finally {
        busy.current = false;
      }
    },
    [initial.id],
  );

  async function finish() {
    if (!confirm("Terminar este backtest? Deixas de poder tomar decisões, mas o relatório fica guardado.")) return;
    try {
      const res = await api<{ backtest: BacktestStateDTO }>(`/api/backtests/${initial.id}/finish`, { method: "POST" });
      setState(res.backtest);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function remove() {
    if (!confirm("Apagar este backtest e todas as decisões? Não é possível desfazer.")) return;
    try {
      await api(`/api/backtests/${initial.id}`, { method: "DELETE" });
      router.replace("/backtest");
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const pnl = state.balance - state.initialBalance;
  const s = state.summary;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-2xl font-semibold tracking-tight">{state.name}</h1>
        <DemoBadge />
        <Badge variant="outline">{state.symbol}</Badge>
        <Badge variant="outline">{state.timeframe}</Badge>
        <Badge variant="secondary">{strategy.name}</Badge>
        <span className="text-xs text-muted-foreground tabular">
          barra {state.cursor}/{state.totalBars}
        </span>
        <div className="ml-auto flex gap-2">
          {!finished && (
            <Button variant="outline" size="sm" onClick={finish}>
              <Flag /> Terminar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={remove}>
            <Trash2 /> Apagar
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Saldo" value={formatUsd(state.balance)} tone={pnl >= 0 ? "success" : "danger"} hint={`inicial ${formatUsd(state.initialBalance)}`} />
        <Stat label="P&L" value={formatUsd(pnl)} tone={pnl > 0 ? "success" : pnl < 0 ? "danger" : "default"} />
        <Stat label="Decisões" value={s.decisions} />
        <Stat label="Trades" value={s.trades} hint={s.trades < 30 ? "amostra pequena" : undefined} />
        <Stat label="WAIT" value={`${s.waitRate.toLocaleString("pt-PT", { maximumFractionDigits: 0 })}%`} hint={`${s.waits} decisões`} />
        <Stat label="Risco por trade" value={`${state.riskPercent}%`} hint="tamanho automático" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="grid min-w-0 content-start gap-4">
          {finished && (
            <Alert variant="info">
              <AlertDescription className="flex flex-wrap items-center gap-2">
                Backtest terminado. Revê o relatório ao lado — e compara o processo com o resultado, não só o saldo final.
                <Button asChild size="sm" variant="outline">
                  <Link href="/backtest">Novo backtest</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <CandleChart
            candles={state.candles}
            visibleCount={110}
            overlays={overlays}
            height={440}
            priceDecimals={dec}
            intraday={intraday}
            ariaLabel={`Gráfico ${state.symbol} ${state.timeframe} (DEMO) do backtest com decisões marcadas`}
          />
          <p className="text-xs text-muted-foreground">
            Dados sintéticos DEMO — só vês as barras até à decisão atual; o futuro é revelado depois de decidires. ▲/▼ = BUY/SELL (verde alvo, vermelho stop, amarelo tempo limite), W = WAIT.
          </p>

          {lastDecision && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Última decisão</CardTitle>
              </CardHeader>
              <CardContent>
                <LastDecision d={lastDecision} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Histórico de decisões</CardTitle>
            </CardHeader>
            <CardContent>
              {state.decisions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ainda sem decisões. Observa o gráfico e decide: BUY, SELL ou WAIT.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Decisão</TableHead>
                      <TableHead>Resultado</TableHead>
                      <TableHead className="text-right">R</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                      <TableHead className="text-right">Regras</TableHead>
                      <TableHead>Nota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...state.decisions]
                      .reverse()
                      .slice(0, 40)
                      .map((d) => (
                        <TableRow key={d.seq}>
                          <TableCell className="tabular text-muted-foreground">{d.seq}</TableCell>
                          <TableCell>
                            <Badge variant={d.choice === "BUY" ? "success" : d.choice === "SELL" ? "danger" : "secondary"}>{d.choice}</Badge>
                          </TableCell>
                          <TableCell>{OUTCOME_TEXT[d.outcome]}</TableCell>
                          <TableCell className={cn("text-right tabular", (d.rMultiple ?? 0) > 0 ? "text-success" : (d.rMultiple ?? 0) < 0 ? "text-danger" : "")}>{d.rMultiple !== null ? formatR(d.rMultiple) : "—"}</TableCell>
                          <TableCell className={cn("text-right tabular", (d.pnl ?? 0) > 0 ? "text-success" : (d.pnl ?? 0) < 0 ? "text-danger" : "")}>{d.pnl !== null ? formatUsd(d.pnl) : "—"}</TableCell>
                          <TableCell className="text-right tabular">{d.rulesTotal !== null ? `${d.rulesMet}/${d.rulesTotal}` : "—"}</TableCell>
                          <TableCell className="max-w-48 truncate text-xs text-muted-foreground" title={d.note ?? undefined}>
                            {d.note ?? ""}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <DecisionPanel
            strategy={strategy}
            symbol={state.symbol}
            riskPercent={state.riskPercent}
            plan={plan}
            atr={atr}
            draft={draft}
            onDraftChange={setDraft}
            disabled={finished}
            disabledNote={finished ? "Este backtest terminou." : undefined}
            onSubmit={submit}
          />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              <BacktestReport summary={s} initialBalance={state.initialBalance} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
