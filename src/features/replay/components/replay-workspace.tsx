"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, FastForward, Flag, NotebookPen, Pause, Play, StepForward, Trash2 } from "lucide-react";
import { DemoBadge } from "@/components/brand/demo-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CandleChart } from "@/features/chart/components/candle-chart";
import type { ChartOverlay, ChartPoint } from "@/features/chart/types";
import { exitFill } from "@/features/trading/logic/engine";
import { TradeTicket } from "@/features/trading/components/trade-ticket";
import type { OpenTradeInput } from "@/features/trading/schemas";
import { api, errorMessage } from "@/lib/api-client";
import { lastAtr } from "@/lib/market-data/indicators";
import { formatR, formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";
import { pointValueUsd } from "@/modules/instruments";
import type { TradeDTO } from "@/features/simulator/types";
import { drawingsToOverlays } from "../logic/drawings";
import { MAX_DRAWINGS, type Drawing } from "../schemas";
import type { ReplayStateDTO } from "../types";
import { DrawingToolbar, type Tool } from "./drawing-toolbar";

const EXIT_TEXT: Record<string, string> = { TAKE_PROFIT: "Alvo", STOP_LOSS: "Stop", MANUAL: "Manual", END_OF_DATA: "Fim da sessão" };
const GRADE_VARIANT = { excelente: "success", bom: "success", "a melhorar": "warning", fraco: "danger" } as const;

const newId = () => Math.random().toString(36).slice(2, 10);

function openPnl(t: TradeDTO, bids: Record<string, number>): number {
  const bid = bids[t.symbol];
  if (bid === undefined) return 0;
  const exit = exitFill(t.symbol, t.direction, bid);
  const pts = t.direction === "LONG" ? exit - t.entryPrice : t.entryPrice - exit;
  return Math.round(pts * pointValueUsd(t.symbol) * t.contracts * 100) / 100;
}

export function ReplayWorkspace({ initial }: { initial: ReplayStateDTO }) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [drawings, setDrawings] = useState<Drawing[]>(initial.drawings);
  const [tool, setTool] = useState<Tool>("none");
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const busy = useRef(false);
  const openCount = useRef(initial.openTrades.length);
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());
  const finished = state.finished;
  const dec = state.symbol === "US30" ? 1 : 0;
  const atr = useMemo(() => lastAtr(state.candles), [state.candles]);
  const shiftBasis = state.basis[state.symbol] ?? 0;

  const call = useCallback(
    async (path: string, body?: unknown): Promise<ReplayStateDTO | null> => {
      if (busy.current) return null;
      busy.current = true;
      try {
        const res = await api<{ replay: ReplayStateDTO }>(`/api/replay/${initial.id}${path}`, { method: "POST", body: body ?? {} });
        // Only the feed moving can close a position by itself (stop/target): pause and tell the student.
        if (path === "/advance" && res.replay.openTrades.length < openCount.current && !res.replay.finished) {
          toast.info("Uma posição foi fechada pelo stop ou alvo.");
          setPlaying(false);
        }
        openCount.current = res.replay.openTrades.length;
        setState(res.replay);
        if (res.replay.finished) setPlaying(false);
        return res.replay;
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

  // Autoplay: one bar per tick; paused when the tab is hidden or the session ends.
  useEffect(() => {
    if (!playing || finished) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      void call("/advance", { bars: 1 });
    }, 1000 / speed);
    return () => clearInterval(id);
  }, [playing, speed, finished, call]);

  // Drawings are saved in order; a trade waits for the pending save so the server sees what the student marked.
  const persist = useCallback(
    (next: Drawing[]) => {
      saveChain.current = saveChain.current
        .then(() => api(`/api/replay/${initial.id}/drawings`, { method: "PUT", body: { drawings: next } }))
        .catch((e) => toast.error(errorMessage(e)));
    },
    [initial.id],
  );
  const updateDrawings = useCallback(
    (next: Drawing[]) => {
      setDrawings(next);
      persist(next);
    },
    [persist],
  );

  const toAbs = useCallback((p: ChartPoint) => ({ index: Math.min(state.candles.length - 1, Math.max(0, p.index)) + state.windowStart, price: Math.round(p.price * 10) / 10 }), [state.candles.length, state.windowStart]);

  const addDrawing = useCallback(
    (d: Drawing) => {
      if (drawings.length >= MAX_DRAWINGS) {
        toast.warning(`Máximo de ${MAX_DRAWINGS} desenhos. Apaga alguns primeiro.`);
        return;
      }
      updateDrawings([...drawings, d]);
    },
    [drawings, updateDrawings],
  );

  const onPointClick = useCallback(
    (p: ChartPoint) => {
      if (tool === "level") addDrawing({ id: newId(), kind: "level", price: Math.round(p.price * 10) / 10 });
    },
    [tool, addDrawing],
  );

  const onDragEnd = useCallback(
    (a: ChartPoint, b: ChartPoint) => {
      const pa = toAbs(a);
      const pb = toAbs(b);
      if (tool === "level") return addDrawing({ id: newId(), kind: "level", price: pb.price });
      if (tool === "zone") {
        let top = Math.max(pa.price, pb.price);
        let bottom = Math.min(pa.price, pb.price);
        if (top - bottom < atr * 0.3) {
          const mid = (top + bottom) / 2;
          top = mid + atr * 0.2;
          bottom = mid - atr * 0.2;
        }
        return addDrawing({ id: newId(), kind: "zone", top: Math.round(top * 10) / 10, bottom: Math.round(bottom * 10) / 10, fromIndex: Math.min(pa.index, pb.index) });
      }
      if (tool === "trend" || tool === "fib") {
        if (Math.abs(pa.index - pb.index) < 2 || pa.price === pb.price) {
          toast.info("Arrasta de um ponto a outro para desenhar.");
          return;
        }
        return addDrawing({ id: newId(), kind: tool, from: pa, to: pb });
      }
    },
    [tool, toAbs, addDrawing, atr],
  );

  const overlays = useMemo<ChartOverlay[]>(() => {
    const out = drawingsToOverlays(drawings, state.windowStart);
    for (const t of state.openTrades) {
      if ((state.basis[t.symbol] ?? 0) !== shiftBasis) continue;
      out.push({ type: "position", id: t.id, direction: t.direction, entry: t.entryPrice, stop: t.stopLoss, target: t.takeProfit, fromIndex: Math.max(0, (t.openBarIndex ?? state.windowStart) - state.windowStart) });
    }
    return out;
  }, [drawings, state.windowStart, state.openTrades, state.basis, shiftBasis]);

  async function placeTrade(input: OpenTradeInput): Promise<boolean> {
    await saveChain.current; // make sure the latest drawings are stored before the server judges "preparação"
    const res = await call("/trades", input);
    if (!res) return false;
    for (const w of res.warnings.slice(0, 3)) toast.warning(w);
    toast.success("Posição aberta (simulada).");
    return true;
  }

  async function finish() {
    if (!confirm("Terminar a sessão? As posições abertas são fechadas ao preço atual e recebes a avaliação de processo.")) return;
    setPlaying(false);
    await call("/finish");
  }

  async function remove() {
    if (!confirm("Apagar esta sessão e os respetivos trades? Não é possível desfazer.")) return;
    try {
      await api(`/api/replay/${initial.id}`, { method: "DELETE" });
      router.replace("/labs/replay");
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const s = state.snapshot;
  const review = state.review;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-2xl font-semibold tracking-tight">Chart Replay</h1>
        <DemoBadge />
        <Badge variant="outline">{state.symbol}</Badge>
        <Badge variant="outline">{state.timeframe}</Badge>
        {finished && <Badge variant="secondary">terminada</Badge>}
        <span className="text-xs text-muted-foreground tabular">
          barra {state.cursor}/{state.totalBars}
        </span>
        <div className="ml-auto flex gap-2">
          {!finished && (
            <Button variant="outline" size="sm" onClick={finish}>
              <Flag /> Terminar e avaliar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={remove}>
            <Trash2 /> Apagar
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Balance" value={formatUsd(s.balance)} />
        <Stat label="Equity" value={formatUsd(s.equity)} tone={s.equity >= state.initialBalance ? "success" : "danger"} />
        <Stat label="Open P&L" value={formatUsd(s.openPnl)} tone={s.openPnl > 0 ? "success" : s.openPnl < 0 ? "danger" : "default"} />
        <Stat label="Trades fechados" value={review.trades} />
        <Stat label="Processo (média)" value={review.averageScore === null ? "—" : `${review.averageScore}/100`} tone={review.averageScore === null ? "default" : review.averageScore >= 70 ? "success" : "warning"} hint={review.grade ?? "sem trades fechados"} />
        <Stat label="Desenhos" value={drawings.length} hint="plano marcado" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant={playing ? "secondary" : "default"} disabled={finished} onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause /> : <Play />} {playing ? "Pausar" : "Reproduzir"}
            </Button>
            <Button size="sm" variant="outline" disabled={finished || playing} onClick={() => call("/advance", { bars: 1 })}>
              <StepForward /> +1
            </Button>
            <Button size="sm" variant="outline" disabled={finished || playing} onClick={() => call("/advance", { bars: 5 })}>
              <FastForward /> +5
            </Button>
            <Button size="sm" variant="outline" disabled={finished || playing} onClick={() => call("/advance", { bars: 20 })}>
              +20
            </Button>
            <div className="ml-2 flex items-center gap-1 rounded-md bg-muted p-1 text-xs" role="radiogroup" aria-label="Velocidade">
              {[1, 2, 5].map((v) => (
                <button key={v} type="button" role="radio" aria-checked={speed === v} onClick={() => setSpeed(v)} className={cn("rounded px-2 py-0.5", speed === v ? "bg-card shadow-sm" : "text-muted-foreground")}>
                  {v}×
                </button>
              ))}
            </div>
          </div>

          <DrawingToolbar tool={tool} onTool={setTool} count={drawings.length} disabled={finished} onUndo={() => updateDrawings(drawings.slice(0, -1))} onClear={() => updateDrawings([])} />

          {finished && (
            <Alert variant="info">
              <AlertDescription>Sessão terminada. A avaliação mede a qualidade do teu processo em cada trade — não o dinheiro ganho ou perdido. Cria outra sessão para continuar a praticar.</AlertDescription>
            </Alert>
          )}

          <CandleChart
            candles={state.candles}
            visibleCount={110}
            overlays={overlays}
            height={460}
            priceDecimals={dec}
            intraday
            mode={finished || tool === "none" ? "none" : tool === "level" ? "click" : "drag"}
            onPointClick={onPointClick}
            onDragEnd={onDragEnd}
            ariaLabel={`Gráfico ${state.symbol} ${state.timeframe} (DEMO) em replay. Ferramenta atual: ${tool}.`}
          />
          <p className="text-xs text-muted-foreground">
            Dados sintéticos DEMO (as datas não correspondem a datas reais de mercado) — só vês as barras até ao cursor. Custos e margens ilustrativos.
          </p>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Posições abertas ({state.openTrades.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {state.openTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem posições abertas. Estar fora do mercado também é uma decisão.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instr.</TableHead>
                      <TableHead>Lado</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Entrada</TableHead>
                      <TableHead className="text-right">SL</TableHead>
                      <TableHead className="text-right">TP</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.openTrades.map((t) => {
                      const p = openPnl(t, state.bids);
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.symbol}</TableCell>
                          <TableCell>
                            <Badge variant={t.direction === "LONG" ? "success" : "danger"}>{t.direction}</Badge>
                          </TableCell>
                          <TableCell className="text-right tabular">{t.contracts}</TableCell>
                          <TableCell className="text-right tabular">{t.entryPrice.toLocaleString("en-US")}</TableCell>
                          <TableCell className="text-right tabular">{t.stopLoss?.toLocaleString("en-US") ?? "—"}</TableCell>
                          <TableCell className="text-right tabular">{t.takeProfit?.toLocaleString("en-US") ?? "—"}</TableCell>
                          <TableCell className={cn("text-right tabular", p > 0 ? "text-success" : p < 0 ? "text-danger" : "")}>{formatUsd(p)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" disabled={finished} onClick={() => call(`/trades/${t.id}/close`)}>
                              Fechar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Trades fechados e avaliação de processo</CardTitle>
            </CardHeader>
            <CardContent>
              {state.closedTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ainda sem trades fechados. Cada trade será avaliado pelo processo: stop, R:R, risco, checklist, preparação, razão e saída.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instr.</TableHead>
                      <TableHead>Lado</TableHead>
                      <TableHead>Saída</TableHead>
                      <TableHead className="text-right">R</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                      <TableHead className="text-right">Processo</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.closedTrades.map((t) => {
                      const ev = state.evaluations[t.id];
                      const open = expanded === t.id;
                      return (
                        <Fragment key={t.id}>
                          <TableRow>
                            <TableCell className="font-medium">
                              {t.symbol} ×{t.contracts}
                            </TableCell>
                            <TableCell>
                              <Badge variant={t.direction === "LONG" ? "success" : "danger"}>{t.direction}</Badge>
                            </TableCell>
                            <TableCell>{EXIT_TEXT[t.exitReason ?? ""] ?? "—"}</TableCell>
                            <TableCell className={cn("text-right tabular", (t.rMultiple ?? 0) > 0 ? "text-success" : "text-danger")}>{t.rMultiple !== null ? formatR(t.rMultiple) : "—"}</TableCell>
                            <TableCell className={cn("text-right tabular", (t.pnl ?? 0) > 0 ? "text-success" : "text-danger")}>{formatUsd(t.pnl ?? 0)}</TableCell>
                            <TableCell className="text-right">
                              {ev && (
                                <button type="button" onClick={() => setExpanded(open ? null : t.id)} aria-expanded={open} className="inline-flex items-center gap-1">
                                  <Badge variant={GRADE_VARIANT[ev.grade]}>{ev.score}/100</Badge>
                                  <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
                                  <span className="sr-only">Ver critérios</span>
                                </button>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {t.journaled ? (
                                <Badge variant="secondary">no journal</Badge>
                              ) : (
                                <Button asChild size="sm" variant="ghost">
                                  <Link href={`/journal/new?trade=${t.id}`}>
                                    <NotebookPen /> Journal
                                  </Link>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                          {open && ev && (
                            <TableRow>
                              <TableCell colSpan={7} className="bg-muted/30">
                                <ul className="grid gap-1 py-1 text-xs">
                                  {ev.criteria.map((c) => (
                                    <li key={c.key} className="grid grid-cols-[9rem_3.5rem_1fr] gap-2">
                                      <span className="font-medium">{c.label}</span>
                                      <span className={cn("tabular", c.earned >= c.max ? "text-success" : c.earned > 0 ? "text-warning" : "text-danger")}>
                                        {c.earned}/{c.max}
                                      </span>
                                      <span className="text-muted-foreground">{c.comment}</span>
                                    </li>
                                  ))}
                                </ul>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <TradeTicket bids={state.bids} equity={s.equity} freeMargin={s.freeMargin} atr={atr} disabled={finished} defaultSymbol={state.symbol} onSubmit={placeTrade} notice={finished ? "A sessão terminou." : undefined} />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Avaliação da sessão</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Processo (média)</span>
                <span className="text-xl font-semibold tabular">{review.averageScore === null ? "—" : `${review.averageScore}/100`}</span>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
                <dt className="text-muted-foreground">Trades</dt>
                <dd className="text-right tabular">{state.stats.trades}</dd>
                <dt className="text-muted-foreground">Win rate</dt>
                <dd className="text-right tabular">{state.stats.winRate}%</dd>
                <dt className="text-muted-foreground">R médio</dt>
                <dd className="text-right tabular">{state.stats.avgR ?? "—"}</dd>
                <dt className="text-muted-foreground">P&L</dt>
                <dd className="text-right tabular">{formatUsd(state.stats.totalPnl)}</dd>
              </dl>
              {review.notes.map((n) => (
                <p key={n} className="rounded-md border bg-muted/30 p-2 text-xs text-muted-foreground">
                  {n}
                </p>
              ))}
              <p className="text-xs text-muted-foreground">A pontuação premeia stop, R:R, risco ≤ 2%, checklist, preparação no gráfico, razão de entrada e disciplina de saída. O P&L não entra.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
