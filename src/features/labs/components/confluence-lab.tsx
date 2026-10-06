"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, Loader2, RotateCcw, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CandleChart } from "@/features/chart/components/candle-chart";
import type { ChartOverlay } from "@/features/chart/types";
import { rewardRisk } from "@/features/calculators/logic/risk";
import type { Candle } from "@/lib/market-data/types";
import { formatR } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ConfluenceFactorKey } from "@/modules/scenarios/types";
import { CONFLUENCE_FACTORS, MIN_ACCEPTABLE_RR, type ConfluenceCheck, type ConfluenceDecision, type OutcomeResult } from "../logic/confluence";
import { DemoFootnote, LabHint, LabLoading, ScenarioPicker, ScoreBanner, useAchievementToasts, type ScenarioOption } from "./lab-frame";
import { useLabCheck, useLabScenario, type LabCheckResponse } from "./use-lab";

type Feedback = ConfluenceCheck & { annotations: ChartOverlay[]; reveal: { candles: Candle[]; outcome: OutcomeResult } };
type Ctx = { direction: "LONG" | "SHORT"; entry: number; stop: number; target: number; decisionIndex: number };

export function ConfluenceLab({ scenarios, initialId, compact = false }: { scenarios: ScenarioOption[]; initialId?: string; compact?: boolean }) {
  const [id, setId] = useState(initialId && scenarios.some((s) => s.id === initialId) ? initialId : scenarios[0]!.id);
  const { data, loading, error } = useLabScenario("confluence", id);
  const { check, pending, error: checkError } = useLabCheck<Feedback>("confluence", id);
  const [selected, setSelected] = useState<Set<ConfluenceFactorKey>>(new Set());
  const [decision, setDecision] = useState<ConfluenceDecision | null>(null);
  const [result, setResult] = useState<LabCheckResponse<Feedback> | null>(null);
  const [revealed, setRevealed] = useState(false);
  useAchievementToasts(result);

  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    setSelected(new Set());
    setDecision(null);
    setResult(null);
    setRevealed(false);
  }


  const ctx = data?.context as Ctx | undefined;
  const rr = ctx ? rewardRisk({ direction: ctx.direction, entry: ctx.entry, stop: ctx.stop, target: ctx.target }) : null;
  const score = selected.size;

  const candles = useMemo(() => (data ? (revealed && result ? [...data.candles, ...result.feedback.reveal.candles] : data.candles) : []), [data, revealed, result]);
  const overlays = useMemo<ChartOverlay[]>(() => {
    if (!ctx) return [];
    const out: ChartOverlay[] = [
      { type: "position", id: "pos", direction: ctx.direction, entry: ctx.entry, stop: ctx.stop, target: ctx.target, fromIndex: ctx.decisionIndex },
      { type: "vline", id: "decision", index: ctx.decisionIndex, label: "Decisão", tone: "muted" },
    ];
    if (result) out.push(...result.feedback.annotations);
    return out;
  }, [ctx, result]);

  const fb = result?.feedback;
  const outcome = fb?.reveal.outcome;

  return (
    <div className={cn("grid gap-5", !compact && "xl:grid-cols-[minmax(0,1fr)_23rem]")}>
      <div className="grid min-w-0 content-start gap-3">
        {loading && <LabLoading />}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {data && ctx && (
          <>
            <CandleChart
              candles={candles}
              visibleCount={Math.max(candles.length + 6, 90)}
              startIndex={Math.max(0, candles.length - 84)}
              rightPadSlots={0}
              overlays={overlays}
              height={compact ? 360 : 460}
              priceDecimals={data.priceDecimals}
              ariaLabel={`Gráfico ${data.symbol} ${data.timeframe} (DEMO) no ponto de decisão. Trade proposto: ${ctx.direction}.`}
            />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <DemoFootnote />
              <Badge variant={ctx.direction === "LONG" ? "success" : "danger"}>{ctx.direction === "LONG" ? "Compra (LONG)" : "Venda (SHORT)"}</Badge>
              <span className="tabular text-muted-foreground">Entrada {ctx.entry.toLocaleString("en-US")} · Stop {ctx.stop.toLocaleString("en-US")} · Alvo {ctx.target.toLocaleString("en-US")}</span>
              {rr?.valid && <Badge variant={(rr.ratio ?? 0) >= MIN_ACCEPTABLE_RR ? "success" : "warning"}>R:R {rr.ratio}:1</Badge>}
            </div>
            {outcome && revealed && (
              <Alert variant={outcome.outcome === "TARGET" ? "success" : outcome.outcome === "STOP" ? "destructive" : "info"}>
                <AlertDescription>
                  <p className="font-medium">
                    O que aconteceu: {outcome.outcome === "TARGET" ? `alvo atingido (${formatR(outcome.rMultiple)})` : outcome.outcome === "STOP" ? `stop atingido (${formatR(outcome.rMultiple)})` : `trade ainda aberto (${formatR(outcome.rMultiple)})`}.
                  </p>
                  <p className="mt-1">Um resultado isolado não prova nem refuta o processo. Avalia a decisão com a informação que tinhas <strong>antes</strong> de ver o futuro.</p>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>

      <div className="grid content-start gap-4">
        <ScenarioPicker scenarios={scenarios} value={id} onChange={setId} />
        {data && <p className="text-sm text-muted-foreground">{data.description}</p>}

        <Card>
          <CardContent className="grid gap-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Confluence Score</span>
              <span className={cn("rounded-md px-2 py-0.5 text-lg font-semibold tabular", score >= 6 ? "bg-success/15 text-success" : score >= 4 ? "bg-warning/15 text-warning" : "bg-muted")}>{score} / 8</span>
            </div>
            <ul className="grid gap-1.5">
              {CONFLUENCE_FACTORS.map((f) => {
                const row = fb?.factors.find((x) => x.key === f.key);
                return (
                  <li key={f.key} className={cn("rounded-md border p-2.5", row && (row.correct ? "border-success/40" : "border-danger/40"))}>
                    <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                      <Checkbox
                        className="mt-0.5"
                        disabled={Boolean(result)}
                        checked={selected.has(f.key)}
                        onCheckedChange={(v) =>
                          setSelected((s) => {
                            const n = new Set(s);
                            if (v) n.add(f.key);
                            else n.delete(f.key);
                            return n;
                          })
                        }
                      />
                      <span className="flex-1">
                        <span className="font-medium">{f.label}</span>
                        <span className="block text-xs text-muted-foreground">{f.question}</span>
                      </span>
                      {row && (row.correct ? <CheckCircle2 className="size-4 shrink-0 text-success" /> : <XCircle className="size-4 shrink-0 text-danger" />)}
                    </label>
                    {row && (
                      <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
                        <strong className={row.present ? "text-success" : "text-danger"}>{row.present ? "Presente" : "Ausente"}.</strong> {row.note}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="grid gap-1.5">
              <span className="text-sm font-medium">A tua decisão, com base no processo</span>
              <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Decisão">
                {([["TAKE", "Executaria"], ["NO_TRADE", "Ficaria de fora"]] as const).map(([v, label]) => (
                  <button key={v} type="button" role="radio" aria-checked={decision === v} disabled={Boolean(result)} onClick={() => setDecision(v)} className={cn("rounded-md border px-2 py-2 text-sm font-medium disabled:opacity-60", decision === v ? "border-primary bg-primary/15" : "hover:bg-accent")}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {!result ? (
              <Button
                disabled={pending || decision === null}
                onClick={async () => {
                  if (!decision) return;
                  const r = await check({ selected: [...selected], decision });
                  if (r) setResult(r);
                }}
              >
                {pending && <Loader2 className="animate-spin" />} Verificar análise
              </Button>
            ) : (
              <div className="flex flex-wrap gap-2">
                {!revealed && (
                  <Button onClick={() => setRevealed(true)}>
                    <Eye /> Revelar o que aconteceu
                  </Button>
                )}
                <Button variant="outline" onClick={() => { setSelected(new Set()); setDecision(null); setResult(null); setRevealed(false); }}>
                  <RotateCcw /> Repetir
                </Button>
              </div>
            )}
            {checkError && <p className="text-sm text-danger">{checkError}</p>}
          </CardContent>
        </Card>

        {!result && <LabHint>O score é uma ferramenta educativa: serve para tornar visível o que sustenta (ou não) a ideia. 8/8 não é garantia de nada, e 3/8 não é garantia de perda.</LabHint>}

        {fb && result && (
          <div className="grid gap-3">
            <ScoreBanner result={result} />
            <Card>
              <CardContent className="grid gap-2 p-4 text-sm">
                <p>
                  Tu: <strong className="tabular">{fb.studentScore}/8</strong> · Análise de referência: <strong className="tabular">{fb.trueScore}/8</strong> (qualidade <strong>{fb.quality}</strong>).
                </p>
                <p>
                  Decisão recomendada pelo <em>processo</em>: <strong>{fb.recommendedDecision === "TAKE" ? "Executaria" : "Ficaria de fora"}</strong>{" "}
                  {fb.decisionCorrect ? <span className="text-success">(coincide com a tua)</span> : <span className="text-danger">(diferente da tua)</span>}.
                </p>
                <p className="rounded-md bg-muted p-3 text-muted-foreground">{fb.verdict}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
