"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, RotateCcw, Undo2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CandleChart } from "@/features/chart/components/candle-chart";
import type { ChartOverlay } from "@/features/chart/types";
import type { StructureLabel } from "@/lib/market-data/indicators";
import type { Candle } from "@/lib/market-data/types";
import { cn } from "@/lib/utils";
import { snapToSwing } from "../logic/snap";
import type { StructureCheck, StructureKind, StructureMark } from "../logic/structure";
import { DemoFootnote, LabHint, LabLoading, ScenarioPicker, ScoreBanner, useAchievementToasts, type ScenarioOption } from "./lab-frame";
import { useLabCheck, useLabScenario, type LabCheckResponse } from "./use-lab";

const LABELS: { label: StructureLabel; hint: string }[] = [
  { label: "HH", hint: "Higher High" },
  { label: "HL", hint: "Higher Low" },
  { label: "LH", hint: "Lower High" },
  { label: "LL", hint: "Lower Low" },
];
const NO_CANDLES: Candle[] = [];
const isHigh = (l: StructureLabel) => l === "HH" || l === "LH";
const labelTone = (l: StructureLabel) => (l === "HH" || l === "HL" ? ("success" as const) : ("danger" as const));

const STRUCTURES: { value: StructureKind; label: string }[] = [
  { value: "BULLISH", label: "Bullish" },
  { value: "BEARISH", label: "Bearish" },
  { value: "RANGE", label: "Range / transição" },
];

export function StructureLab({ scenarios, initialId, compact = false }: { scenarios: ScenarioOption[]; initialId?: string; compact?: boolean }) {
  const [id, setId] = useState(initialId && scenarios.some((s) => s.id === initialId) ? initialId : scenarios[0]!.id);
  const { data, loading, error } = useLabScenario("market-structure", id);
  const { check, pending, error: checkError } = useLabCheck<StructureCheck>("market-structure", id);

  const [marks, setMarks] = useState<StructureMark[]>([]);
  const [active, setActive] = useState<StructureLabel>("HH");
  const [structure, setStructure] = useState<StructureKind | null>(null);
  const [result, setResult] = useState<LabCheckResponse<StructureCheck> | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  useAchievementToasts(result);

  // Switching scenario resets the exercise (state reset during render — no effect needed).
  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    setMarks([]);
    setStructure(null);
    setResult(null);
    setShowSolution(false);
  }


  const candles = data?.candles ?? NO_CANDLES;
  const references = useMemo(() => (data?.context.references ?? []) as { index: number; price: number; type: "high" | "low" }[], [data]);

  function onPointClick(p: { index: number }) {
    if (result || candles.length === 0) return;
    const side = isHigh(active) ? "high" : "low";
    const index = snapToSwing(candles, p.index, side, 3);
    setMarks((prev) => {
      const near = prev.findIndex((m) => Math.abs(m.index - index) <= 1 && isHigh(m.label) === isHigh(active));
      if (near >= 0) {
        const existing = prev[near]!;
        if (existing.label === active) return prev.filter((_, i) => i !== near); // clicking the same label again removes it
        return prev.map((m, i) => (i === near ? { index, label: active } : m));
      }
      return [...prev, { index, label: active }];
    });
  }

  async function submit() {
    const res = await check({ marks, structure });
    if (res) setResult(res);
  }

  const overlays = useMemo<ChartOverlay[]>(() => {
    const out: ChartOverlay[] = references.map((r) => ({
      type: "marker" as const,
      id: `ref-${r.index}`,
      index: r.index,
      price: r.price,
      label: r.type === "high" ? "H₀" : "L₀",
      placement: r.type === "high" ? ("above" as const) : ("below" as const),
      tone: "muted" as const,
    }));
    const price = (index: number, label: StructureLabel) => (isHigh(label) ? candles[index]?.high : candles[index]?.low) ?? 0;
    const fb = result?.feedback;
    if (!fb) {
      for (const m of marks) {
        out.push({ type: "marker", id: `m-${m.index}`, index: m.index, price: price(m.index, m.label), label: m.label, placement: isHigh(m.label) ? "above" : "below", tone: labelTone(m.label) });
      }
      return out;
    }
    for (const f of fb.marks) {
      const lab = f.label;
      out.push({
        type: "marker",
        id: `m-${f.index}`,
        index: f.index,
        price: price(f.index, lab),
        label: f.status === "correct" ? `✓ ${lab}` : f.status === "wrong-label" ? `✗ ${lab}→${f.expected}` : `✗ ${lab}`,
        placement: isHigh(lab) ? "above" : "below",
        tone: f.status === "correct" ? "success" : f.status === "wrong-label" ? "warning" : "danger",
      });
    }
    for (const m of fb.missed) {
      out.push({ type: "marker", id: `miss-${m.index}`, index: m.index, price: m.price, label: `? ${m.label}`, placement: isHigh(m.label) ? "above" : "below", tone: "warning" });
    }
    if (showSolution) {
      for (const s of fb.solution) {
        out.push({ type: "marker", id: `sol-${s.index}`, index: s.index, price: s.price, label: s.label, placement: isHigh(s.label) ? "above" : "below", tone: labelTone(s.label) });
      }
    }
    return out;
  }, [marks, result, showSolution, references, candles]);

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
              mode={result ? "none" : "click"}
              onPointClick={onPointClick}
              priceDecimals={data.priceDecimals}
              ariaLabel={`Gráfico ${data.symbol} ${data.timeframe} (DEMO). Clica nos swings para os rotular.`}
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <DemoFootnote />
              <span>{data.symbol} · {data.timeframe}</span>
              <span>· H₀ / L₀ = primeiros swings (referência, sem rótulo)</span>
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
              <span className="text-sm font-medium">1. Escolhe o rótulo e clica no swing</span>
              <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Rótulo ativo">
                {LABELS.map(({ label, hint }) => (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={active === label}
                    title={hint}
                    disabled={Boolean(result)}
                    onClick={() => setActive(label)}
                    className={cn(
                      "rounded-md border px-2 py-2 text-sm font-semibold transition-colors disabled:opacity-50",
                      active === label ? (labelTone(label) === "success" ? "border-success bg-success/20 text-success" : "border-danger bg-danger/20 text-danger") : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Clicar no mesmo swing com o mesmo rótulo remove-o. Marcas: <strong className="tabular">{marks.length}</strong></p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={marks.length === 0 || Boolean(result)} onClick={() => setMarks((m) => m.slice(0, -1))}>
                  <Undo2 /> Desfazer
                </Button>
                <Button variant="outline" size="sm" disabled={marks.length === 0 || Boolean(result)} onClick={() => setMarks([])}>
                  Limpar
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <span className="text-sm font-medium">2. Qual é a estrutura deste mercado?</span>
              <div className="grid gap-1.5" role="radiogroup" aria-label="Estrutura do mercado">
                {STRUCTURES.map((s) => (
                  <label key={s.value} className={cn("flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm", structure === s.value && "border-primary bg-primary/10", result && "cursor-default")}>
                    <input type="radio" name="structure" className="accent-[var(--primary)]" disabled={Boolean(result)} checked={structure === s.value} onChange={() => setStructure(s.value)} />
                    {s.label}
                    {result && s.value === result.feedback.expectedStructure && <span className="ml-auto text-xs font-medium text-success">← correta</span>}
                  </label>
                ))}
              </div>
            </div>

            {!result ? (
              <Button onClick={submit} disabled={pending || marks.length === 0 || structure === null}>
                {pending && <Loader2 className="animate-spin" />} Verificar
              </Button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => { setMarks([]); setStructure(null); setResult(null); setShowSolution(false); }}>
                  <RotateCcw /> Tentar de novo
                </Button>
                <Button variant="outline" onClick={() => setShowSolution((v) => !v)}>
                  {showSolution ? <EyeOff /> : <Eye />} {showSolution ? "Esconder solução" : "Ver solução"}
                </Button>
              </div>
            )}
            {checkError && <p className="text-sm text-danger">{checkError}</p>}
          </CardContent>
        </Card>

        {!result && <LabHint>Procura os pontos de viragem: um swing high é um máximo mais alto do que os vizinhos; um swing low o contrário. Compara cada swing com o anterior do mesmo tipo.</LabHint>}

        {result && (
          <div className="grid gap-3">
            <ScoreBanner result={result} />
            <Card>
              <CardContent className="grid gap-2 p-4 text-sm">
                <p>
                  <strong>{result.feedback.counts.correct}</strong> de <strong>{result.feedback.counts.expected}</strong> swings rotulados corretamente
                  {result.feedback.counts.wrongLabel > 0 && <> · {result.feedback.counts.wrongLabel} com rótulo errado</>}
                  {result.feedback.counts.extra > 0 && <> · {result.feedback.counts.extra} marcas a mais</>}
                  {result.feedback.counts.missed > 0 && <> · {result.feedback.counts.missed} por marcar</>}.
                </p>
                <p>
                  Estrutura: {result.feedback.structureCorrect ? <span className="font-medium text-success">correta</span> : <span className="font-medium text-danger">incorreta (era {result.feedback.expectedStructure})</span>}.
                </p>
                <p className="rounded-md bg-muted p-3 text-muted-foreground">{result.feedback.note}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
