"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Archive, FastForward, NotebookPen, Pause, Play, StepForward } from "lucide-react";
import { DemoBadge } from "@/components/brand/demo-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/ui/line-chart";
import { Stat } from "@/components/ui/stat";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CandleChart } from "@/features/chart/components/candle-chart";
import type { ChartOverlay } from "@/features/chart/types";
import { exitFill } from "@/features/trading/logic/engine";
import { TradeTicket } from "@/features/trading/components/trade-ticket";
import type { OpenTradeInput } from "@/features/trading/schemas";
import { api, errorMessage } from "@/lib/api-client";
import { lastAtr } from "@/lib/market-data/indicators";
import { formatR, formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";
import { pointValueUsd } from "@/modules/instruments";
import type { AccountStateDTO, TradeDTO } from "../types";

const REASON_TEXT: Record<string, string> = { TAKE_PROFIT: "Alvo", STOP_LOSS: "Stop", MANUAL: "Manual", END_OF_DATA: "Fim do feed" };

function openPnl(t: TradeDTO, bids: Record<string, number>): number {
  const bid = bids[t.symbol];
  if (bid === undefined) return 0;
  const exit = exitFill(t.symbol, t.direction, bid);
  const pts = t.direction === "LONG" ? exit - t.entryPrice : t.entryPrice - exit;
  return Math.round(pts * pointValueUsd(t.symbol) * t.contracts * 100) / 100;
}

export function SimulatorWorkspace({ initial }: { initial: AccountStateDTO }) {
  const router = useRouter();
  const [account, setAccount] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [chartSymbol, setChartSymbol] = useState<"YM" | "MYM" | "US30">("YM");
  const busy = useRef(false);

  const call = useCallback(
    async (path: string, body?: unknown): Promise<AccountStateDTO | null> => {
      if (busy.current) return null;
      busy.current = true;
      try {
        const res = await api<{ account: AccountStateDTO }>(`/api/simulator/accounts/${initial.id}${path}`, { method: "POST", body: body ?? {} });
        setAccount(res.account);
        return res.account;
      } catch (e) {
        toast.error(errorMessage(e));
        setPlaying(false);
        return null;
      } finally {
        busy.current = false;
      }
    },
    [initial.id],
  );

  // Autoplay: one bar per tick; paused automatically when the tab is hidden or the feed ends.
  useEffect(() => {
    if (!playing || account.finished) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      void call("/advance", { bars: 1 });
    }, 1000 / speed);
    return () => clearInterval(id);
  }, [playing, speed, account.finished, call]);

  const shiftBasis = account.basis[chartSymbol] ?? 0;
  const candles = useMemo(() => (shiftBasis === 0 ? account.candles : account.candles.map((c) => ({ ...c, open: c.open + shiftBasis, high: c.high + shiftBasis, low: c.low + shiftBasis, close: c.close + shiftBasis }))), [account.candles, shiftBasis]);
  const atr = useMemo(() => lastAtr(account.candles), [account.candles]);

  const overlays = useMemo<ChartOverlay[]>(
    () =>
      account.openTrades
        .filter((t) => (account.basis[t.symbol] ?? 0) === shiftBasis)
        .map((t) => ({
          type: "position" as const,
          id: t.id,
          direction: t.direction,
          entry: t.entryPrice,
          stop: t.stopLoss,
          target: t.takeProfit,
          fromIndex: Math.max(0, (t.openBarIndex ?? account.windowStart) - account.windowStart),
        })),
    [account.openTrades, account.basis, account.windowStart, shiftBasis],
  );

  const s = account.snapshot;
  const dec = chartSymbol === "US30" ? 1 : 0;

  async function placeTrade(input: OpenTradeInput): Promise<boolean> {
    const res = await call("/trades", input);
    if (!res) return false;
    for (const w of res.warnings.slice(0, 3)) toast.warning(w);
    toast.success("Posição aberta (simulada).");
    return true;
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-2xl font-semibold tracking-tight">{account.name}</h1>
        <DemoBadge />
        <Badge variant="outline">{account.timeframe}</Badge>
        <span className="text-xs text-muted-foreground tabular">barra {account.cursor}/{account.totalBars}</span>
        <div className="ml-auto flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (!confirm("Arquivar esta conta de simulação? Os trades ficam guardados, mas deixas de a poder usar.")) return;
              await api(`/api/simulator/accounts/${initial.id}/archive`, { method: "POST" });
              router.replace("/simulator");
              router.refresh();
            }}
          >
            <Archive /> Arquivar
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Balance" value={formatUsd(s.balance)} />
        <Stat label="Equity" value={formatUsd(s.equity)} tone={s.equity >= account.initialBalance ? "success" : "danger"} />
        <Stat label="Open P&L" value={formatUsd(s.openPnl)} tone={s.openPnl > 0 ? "success" : s.openPnl < 0 ? "danger" : "default"} />
        <Stat label="Daily P&L" value={formatUsd(s.dailyPnl)} tone={s.dailyPnl > 0 ? "success" : s.dailyPnl < 0 ? "danger" : "default"} />
        <Stat label="Margem usada" value={formatUsd(s.usedMargin)} hint={`livre ${formatUsd(s.freeMargin)} · ilustrativa`} />
        <Stat label="Drawdown" value={formatUsd(s.drawdown)} tone={s.drawdown > 0 ? "warning" : "default"} hint={`máx. ${formatUsd(s.maxDrawdown)}`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant={playing ? "secondary" : "default"} disabled={account.finished} onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause /> : <Play />} {playing ? "Pausar" : "Reproduzir"}
            </Button>
            <Button size="sm" variant="outline" disabled={account.finished || playing} onClick={() => call("/advance", { bars: 1 })}><StepForward /> +1</Button>
            <Button size="sm" variant="outline" disabled={account.finished || playing} onClick={() => call("/advance", { bars: 5 })}><FastForward /> +5</Button>
            <Button size="sm" variant="outline" disabled={account.finished || playing} onClick={() => call("/advance", { bars: 20 })}>+20</Button>
            <div className="ml-2 flex items-center gap-1 rounded-md bg-muted p-1 text-xs" role="radiogroup" aria-label="Velocidade">
              {[1, 2, 5].map((v) => (
                <button key={v} type="button" role="radio" aria-checked={speed === v} onClick={() => setSpeed(v)} className={cn("rounded px-2 py-0.5", speed === v ? "bg-card shadow-sm" : "text-muted-foreground")}>{v}×</button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1 rounded-md bg-muted p-1 text-xs" role="radiogroup" aria-label="Instrumento do gráfico">
              {(["YM", "MYM", "US30"] as const).map((v) => (
                <button key={v} type="button" role="radio" aria-checked={chartSymbol === v} onClick={() => setChartSymbol(v)} className={cn("rounded px-2 py-0.5", chartSymbol === v ? "bg-card shadow-sm" : "text-muted-foreground")}>{v}</button>
              ))}
            </div>
          </div>

          {account.finished && (
            <Alert variant="info">
              <AlertDescription>O feed chegou ao fim e as posições abertas foram liquidadas. Arquiva a conta e cria uma nova para continuar a praticar.</AlertDescription>
            </Alert>
          )}

          <CandleChart
            candles={candles}
            visibleCount={110}
            overlays={overlays}
            height={440}
            priceDecimals={dec}
            ariaLabel={`Gráfico ${chartSymbol} ${account.timeframe} (DEMO) com posições abertas`}
          />
          <p className="text-xs text-muted-foreground">
            {chartSymbol === "US30" ? "US30 (CFD demo): cotação com basis de −15 pts e spread de 1,5 pts. " : "Futuros: tick de 1 ponto, spread de 1 tick. "}
            Dados sintéticos DEMO; custos e margens ilustrativos.
          </p>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Posições abertas ({account.openTrades.length})</CardTitle></CardHeader>
            <CardContent>
              {account.openTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem posições abertas. Estar fora do mercado também é uma decisão.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Instr.</TableHead><TableHead>Lado</TableHead><TableHead className="text-right">Qtd</TableHead><TableHead className="text-right">Entrada</TableHead><TableHead className="text-right">SL</TableHead><TableHead className="text-right">TP</TableHead><TableHead className="text-right">P&L</TableHead><TableHead /></TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.openTrades.map((t) => {
                      const p = openPnl(t, account.bids);
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.symbol}</TableCell>
                          <TableCell><Badge variant={t.direction === "LONG" ? "success" : "danger"}>{t.direction}</Badge></TableCell>
                          <TableCell className="text-right tabular">{t.contracts}</TableCell>
                          <TableCell className="text-right tabular">{t.entryPrice.toLocaleString("en-US")}</TableCell>
                          <TableCell className="text-right tabular">{t.stopLoss?.toLocaleString("en-US") ?? "—"}</TableCell>
                          <TableCell className="text-right tabular">{t.takeProfit?.toLocaleString("en-US") ?? "—"}</TableCell>
                          <TableCell className={cn("text-right tabular", p > 0 ? "text-success" : p < 0 ? "text-danger" : "")}>{formatUsd(p)}</TableCell>
                          <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => call(`/trades/${t.id}/close`)}>Fechar</Button></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Histórico</CardTitle></CardHeader>
            <CardContent>
              {account.closedTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ainda sem trades fechados.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Instr.</TableHead><TableHead>Lado</TableHead><TableHead>Saída</TableHead><TableHead className="text-right">R</TableHead><TableHead className="text-right">P&L</TableHead><TableHead>Razão</TableHead><TableHead>Check</TableHead><TableHead /></TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.closedTrades.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.symbol} ×{t.contracts}</TableCell>
                        <TableCell><Badge variant={t.direction === "LONG" ? "success" : "danger"}>{t.direction}</Badge></TableCell>
                        <TableCell>{REASON_TEXT[t.exitReason ?? ""] ?? "—"}</TableCell>
                        <TableCell className={cn("text-right tabular", (t.rMultiple ?? 0) > 0 ? "text-success" : "text-danger")}>{t.rMultiple !== null ? formatR(t.rMultiple) : "—"}</TableCell>
                        <TableCell className={cn("text-right tabular", (t.pnl ?? 0) > 0 ? "text-success" : "text-danger")}>{formatUsd(t.pnl ?? 0)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{t.entryReason?.replaceAll("_", " ").toLowerCase()}</TableCell>
                        <TableCell className="tabular text-xs">{t.checklistPercent !== null ? `${t.checklistPercent}%` : "—"}</TableCell>
                        <TableCell className="text-right">
                          {t.journaled ? <Badge variant="secondary">no journal</Badge> : (
                            <Button asChild size="sm" variant="ghost"><Link href={`/journal/new?trade=${t.id}`}><NotebookPen /> Journal</Link></Button>
                          )}
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
          <TradeTicket bids={account.bids} equity={s.equity} freeMargin={s.freeMargin} atr={atr} disabled={account.finished} onSubmit={placeTrade} notice={account.finished ? "O feed terminou." : undefined} />
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Estatísticas desta conta</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <LineChart values={account.stats.equityCurve} baseline={account.initialBalance} height={130} ariaLabel="Curva de capital dos trades fechados" format={(v) => `$${(v / 1000).toFixed(1)}k`} />
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Trades</dt><dd className="text-right tabular">{account.stats.trades}</dd>
                <dt className="text-muted-foreground">Win rate</dt><dd className="text-right tabular">{account.stats.winRate}%</dd>
                <dt className="text-muted-foreground">R médio</dt><dd className="text-right tabular">{account.stats.avgR ?? "—"}</dd>
                <dt className="text-muted-foreground">Expectancy</dt><dd className="text-right tabular">{formatUsd(account.stats.expectancy)}</dd>
                <dt className="text-muted-foreground">Profit factor</dt><dd className="text-right tabular">{account.stats.profitFactor ?? "—"}</dd>
                <dt className="text-muted-foreground">Máx. drawdown</dt><dd className="text-right tabular">{formatUsd(account.stats.maxDrawdown)}</dd>
              </dl>
              {account.stats.trades < 30 && <p className="text-xs text-muted-foreground">Amostra pequena ({account.stats.trades} trades): estas estatísticas são ruído, não prova de vantagem.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
