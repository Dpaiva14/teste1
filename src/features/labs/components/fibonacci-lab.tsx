"use client";

import { useMemo, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CandleChart } from "@/features/chart/components/candle-chart";
import { snapToExtreme } from "@/features/chart/logic/chart-math";
import type { ChartOverlay } from "@/features/chart/types";
import type { Candle } from "@/lib/market-data/types";
import { cn } from "@/lib/utils";
import {
  EXTENSION_RATIOS,
  KEY_RETRACEMENTS,
  RATIO_ORIGIN,
  RETRACEMENT_RATIOS,
  extensionLevels,
  projectionLevels,
  ratioLabel,
  retracementLevels,
  type FibCheck,
  type FibTool,
} from "../logic/fibonacci";
import { snapToSwing } from "../logic/snap";
import { DemoFootnote, LabHint, LabLoading, ScenarioPicker, ScoreBanner, useAchievementToasts, type ScenarioOption } from "./lab-frame";
import { useLabCheck, useLabScenario, type LabCheckResponse } from "./use-lab";

type Anchor = { index: number; price: number };
const NO_CANDLES: Candle[] = [];
const EMPHASIS = new Set<number>([0.382, 0.5, 0.618, 0.786, 1.272, 1.618]);
const ORIGIN_TEXT = { golden: "razão áurea (φ)", root: "derivado de raiz quadrada", convention: "convenção" } as const;

export function FibonacciLab({ scenarios, initialId, compact = false }: { scenarios: ScenarioOption[]; initialId?: string; compact?: boolean }) {
  const [id, setId] = useState(initialId && scenarios.some((s) => s.id === initialId) ? initialId : scenarios[0]!.id);
  const { data, loading, error } = useLabScenario("fibonacci", id);
  const { check, pending, error: checkError } = useLabCheck<FibCheck>("fibonacci", id);

  const [tool, setTool] = useState<FibTool>("retracement");
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<LabCheckResponse<FibCheck> | null>(null);
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  useAchievementToasts(result);

  const resetKey = `${id}:${tool}`;
  const [prevKey, setPrevKey] = useState(resetKey);
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setAnchors([]);
    setPicked(null);
    setResult(null);
  }


  const candles = data?.candles ?? NO_CANDLES;
  const needed = tool === "projection" ? 3 : 2;
  const decimals = data?.priceDecimals ?? 0;

  function onPointClick(p: { index: number; price: number }) {
    if (result || candles.length === 0 || anchors.length >= needed) return;
    const base = candles[Math.min(Math.max(p.index, 0), candles.length - 1)]!;
    const side = snapToExtreme(base, p.price).side;
    const index = snapToSwing(candles, p.index, side, 3);
    const c = candles[index]!;
    setAnchors((a) => [...a, { index, price: side === "high" ? c.high : c.low }]);
  }

  const levels = useMemo(() => {
    const [a, b, c] = anchors;
    if (!a || !b) return [];
    const ratios = tool === "retracement" ? RETRACEMENT_RATIOS : EXTENSION_RATIOS;
    let raw: { ratio: number; price: number }[] = [];
    if (tool === "retracement") raw = retracementLevels(a.price, b.price, ratios);
    else if (tool === "extension") raw = extensionLevels(a.price, b.price, ratios);
    else if (c) raw = projectionLevels(a.price, b.price, c.price, ratios);
    return raw.filter((l) => !hidden.has(l.ratio));
  }, [anchors, tool, hidden]);

  const overlays = useMemo<ChartOverlay[]>(() => {
    const out: ChartOverlay[] = [];
    const a = anchors[0];
    if (a) {
      out.push({
        type: "fib",
        id: "fib",
        fromIndex: a.index,
        levels: levels.map((l) => ({ ratio: l.ratio, price: l.price, label: ratioLabel(l.ratio), emphasis: EMPHASIS.has(l.ratio) })),
        anchors: anchors.map((p, i) => ({ index: p.index, price: p.price, label: ["A", "B", "C"][i]! })),
      });
    }
    if (result) {
      const s = result.feedback.solution;
      out.push({ type: "marker", id: "sol-a", index: s.a.at, price: s.a.price, label: "A ✔", placement: s.direction === "up" ? "below" : "above", tone: "warning" });
      out.push({ type: "marker", id: "sol-b", index: s.b.at, price: s.b.price, label: "B ✔", placement: s.direction === "up" ? "above" : "below", tone: "warning" });
      if (s.c) out.push({ type: "marker", id: "sol-c", index: s.c.at, price: s.c.price, label: `C (${ratioLabel(result.feedback.actualRatio)})`, placement: s.direction === "up" ? "below" : "above", tone: "warning" });
    }
    return out;
  }, [anchors, levels, result]);

  const ratioList = tool === "retracement" ? RETRACEMENT_RATIOS : EXTENSION_RATIOS;
  const graded = tool === "retracement";

  return (
    <div className={cn("grid gap-5", !compact && "xl:grid-cols-[minmax(0,1fr)_21rem]")}>
      <div className="grid min-w-0 content-start gap-3">
        {loading && <LabLoading />}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {data && (
          <>
            <CandleChart
              candles={candles}
              visibleCount={candles.length + 4}
              startIndex={0}
              rightPadSlots={0}
              overlays={overlays}
              height={compact ? 340 : 440}
              mode={result || anchors.length >= needed ? "none" : "click"}
              onPointClick={onPointClick}
              priceDecimals={decimals}
              ariaLabel={`Gráfico ${data.symbol} ${data.timeframe} (DEMO). Clica nos swings para ancorar o Fibonacci.`}
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <DemoFootnote />
              <span>{data.symbol} · {data.timeframe}</span>
            </div>
          </>
        )}
      </div>

      <div className="grid content-start gap-4">
        <ScenarioPicker scenarios={scenarios} value={id} onChange={setId} />
        {data && <p className="text-sm text-muted-foreground">{data.description}</p>}
        <Card>
          <CardContent className="grid gap-4 p-4">
            <div className="grid gap-2">
              <span className="text-sm font-medium">Ferramenta</span>
              <div className="grid grid-cols-3 gap-1 rounded-md bg-muted p-1" role="radiogroup" aria-label="Ferramenta de Fibonacci">
                {(["retracement", "extension", "projection"] as const).map((t) => (
                  <button key={t} type="button" role="radio" aria-checked={tool === t} onClick={() => setTool(t)} className={cn("rounded px-1.5 py-1 text-xs font-medium", tool === t ? "bg-card shadow-sm" : "text-muted-foreground")}>
                    {t === "retracement" ? "Retracement" : t === "extension" ? "Extension" : "Projection"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {tool === "retracement" && "2 cliques: A (início do impulso) e B (fim). Mede quanto da correção já aconteceu: preço = B − r·(B−A)."}
                {tool === "extension" && "2 cliques: A e B. Níveis para além de B, medidos a partir de A: preço = A + r·(B−A)."}
                {tool === "projection" && "3 cliques: A, B e C (fim da correção). Projeta o impulso AB a partir de C: preço = C + r·(B−A)."}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span>Âncoras: <strong className="tabular">{anchors.length}/{needed}</strong></span>
                <Button variant="ghost" size="sm" disabled={anchors.length === 0 || Boolean(result)} onClick={() => setAnchors([])}>
                  <RotateCcw /> Limpar
                </Button>
              </div>
            </div>

            <fieldset className="grid gap-1.5">
              <legend className="mb-1 text-sm font-medium">Níveis visíveis</legend>
              <div className="flex flex-wrap gap-1.5">
                {ratioList.map((r) => {
                  const off = hidden.has(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={!off}
                      title={`${ratioLabel(r)} — ${ORIGIN_TEXT[RATIO_ORIGIN[r] ?? "convention"]}`}
                      onClick={() => setHidden((h) => { const n = new Set(h); if (off) n.delete(r); else n.add(r); return n; })}
                      className={cn("rounded border px-1.5 py-0.5 text-xs tabular", off ? "text-muted-foreground line-through opacity-60" : EMPHASIS.has(r) ? "border-warning/60 text-warning" : "border-info/50 text-info")}
                    >
                      {ratioLabel(r)}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">38,2 / 61,8 / 161,8 vêm da razão áurea; 70,7 / 78,6 / 88,6 / 127,2 / 141,4 são raízes quadradas; 50 e 100 são convenções. Nenhum nível faz o preço inverter: são zonas a estudar.</p>
            </fieldset>

            {graded && anchors.length >= 2 && !result && (
              <div className="grid gap-2">
                <span className="text-sm font-medium">Até que nível recuou a correção (C)?</span>
                <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Nível onde a correção parou">
                  {KEY_RETRACEMENTS.map((r) => (
                    <button key={r} type="button" role="radio" aria-checked={picked === r} onClick={() => setPicked(r)} className={cn("rounded-md border px-1 py-1.5 text-sm tabular", picked === r ? "border-primary bg-primary/15" : "hover:bg-accent")}>
                      {ratioLabel(r)}
                    </button>
                  ))}
                </div>
                <Button
                  disabled={pending || picked === null}
                  onClick={async () => {
                    const [a, b] = anchors;
                    if (!a || !b || picked === null) return;
                    const r = await check({ a, b, pickedRatio: picked });
                    if (r) setResult(r);
                  }}
                >
                  {pending && <Loader2 className="animate-spin" />} Verificar
                </Button>
              </div>
            )}
            {!graded && <p className="text-xs text-muted-foreground">Modo livre: explora as ferramentas. A avaliação aplica-se ao Retracement.</p>}
            {result && (
              <Button variant="outline" onClick={() => { setAnchors([]); setPicked(null); setResult(null); }}>
                <RotateCcw /> Tentar de novo
              </Button>
            )}
            {checkError && <p className="text-sm text-danger">{checkError}</p>}
          </CardContent>
        </Card>

        {!result && <LabHint>O primeiro passo é a escolha do swing: o impulso relevante vai do início do movimento (A) ao seu extremo (B). Uma má escolha de swings dá níveis sem significado.</LabHint>}
        {result && (
          <div className="grid gap-3">
            <ScoreBanner result={result} />
            <Card>
              <CardContent className="grid gap-2 p-4 text-sm">
                <p>Ponto A: {result.feedback.aCorrect ? <b className="text-success">correto</b> : <b className="text-danger">incorreto</b>} · Ponto B: {result.feedback.bCorrect ? <b className="text-success">correto</b> : <b className="text-danger">incorreto</b>}{!result.feedback.directionCorrect && <span className="text-danger"> (direção do impulso invertida)</span>}</p>
                <p>Retracement medido: <b className="tabular">{ratioLabel(result.feedback.actualRatio)}</b> → nível-chave mais próximo <b>{ratioLabel(result.feedback.expectedRatio)}</b> {result.feedback.ratioCorrect ? <span className="text-success">(acertaste)</span> : <span className="text-danger">(escolheste {picked !== null ? ratioLabel(picked) : "—"})</span>}</p>
                <p className="rounded-md bg-muted p-3 text-muted-foreground">{result.feedback.note}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
