"use client";

import { useMemo, useState } from "react";
import { Loader2, RotateCcw, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CandleChart } from "@/features/chart/components/candle-chart";
import type { ChartOverlay } from "@/features/chart/types";
import { lastAtr } from "@/lib/market-data/indicators";
import type { Candle } from "@/lib/market-data/types";
import { cn } from "@/lib/utils";
import type { LevelsCheck, UserZone } from "../logic/levels";
import { DemoFootnote, LabHint, LabLoading, ScenarioPicker, ScoreBanner, useAchievementToasts, type ScenarioOption } from "./lab-frame";
import { useLabCheck, useLabScenario, type LabCheckResponse } from "./use-lab";

type Kind = UserZone["kind"];
const NO_CANDLES: Candle[] = [];

export function LevelsLab({ scenarios, initialId, compact = false }: { scenarios: ScenarioOption[]; initialId?: string; compact?: boolean }) {
  const [id, setId] = useState(initialId && scenarios.some((s) => s.id === initialId) ? initialId : scenarios[0]!.id);
  const { data, loading, error } = useLabScenario("levels", id);
  const { check, pending, error: checkError } = useLabCheck<LevelsCheck>("levels", id);
  const [zones, setZones] = useState<UserZone[]>([]);
  const [kind, setKind] = useState<Kind>("resistance");
  const [result, setResult] = useState<LabCheckResponse<LevelsCheck> | null>(null);
  useAchievementToasts(result);

  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    setZones([]);
    setResult(null);
  }


  const candles = data?.candles ?? NO_CANDLES;
  const atr = useMemo(() => (candles.length ? lastAtr(candles) : 40), [candles]);
  const decimals = data?.priceDecimals ?? 0;

  function addZone(a: number, b: number) {
    if (result) return;
    let top = Math.max(a, b);
    let bottom = Math.min(a, b);
    if (top - bottom < atr * 0.3) {
      const mid = (top + bottom) / 2;
      top = mid + atr * 0.2;
      bottom = mid - atr * 0.2;
    }
    setZones((z) => (z.length >= 12 ? z : [...z, { top: Math.round(top), bottom: Math.round(bottom), kind }]));
  }

  const overlays = useMemo<ChartOverlay[]>(() => {
    const out: ChartOverlay[] = zones.map((z, i) => ({
      type: "zone" as const,
      id: `u-${i}`,
      top: z.top,
      bottom: z.bottom,
      label: `${z.kind === "support" ? "S" : "R"}${i + 1}`,
      tone: z.kind === "support" ? ("success" as const) : ("danger" as const),
    }));
    if (result) {
      result.feedback.matches.forEach((m, i) => {
        out.push({
          type: "zone",
          id: `sol-${i}`,
          top: m.solution.top,
          bottom: m.solution.bottom,
          label: `Solução: ${m.solution.kind === "support" ? "suporte" : "resistência"} (${m.solution.touches} toques)`,
          tone: "warning",
        });
      });
    }
    return out;
  }, [zones, result]);

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
              mode={result ? "none" : "drag"}
              onDragEnd={(a, b) => addZone(a.price, b.price)}
              onPointClick={(p) => addZone(p.price, p.price)}
              priceDecimals={decimals}
              ariaLabel={`Gráfico ${data.symbol} ${data.timeframe} (DEMO). Arrasta para desenhar zonas de suporte e resistência.`}
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <DemoFootnote />
              <span>{data.symbol} · {data.timeframe} · ATR ≈ {atr.toFixed(0)} pts</span>
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
              <span className="text-sm font-medium">1. Tipo da próxima zona</span>
              <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Tipo de zona">
                {(["resistance", "support"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={kind === k}
                    disabled={Boolean(result)}
                    onClick={() => setKind(k)}
                    className={cn("rounded-md border px-2 py-2 text-sm font-semibold disabled:opacity-50", kind === k ? (k === "support" ? "border-success bg-success/20 text-success" : "border-danger bg-danger/20 text-danger") : "text-muted-foreground hover:bg-accent")}
                  >
                    {k === "support" ? "Suporte" : "Resistência"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">2. <strong>Arrasta</strong> sobre o gráfico para desenhar uma zona (ou clica para criar uma zona padrão).</p>
            </div>

            {zones.length > 0 && (
              <ul className="grid gap-1.5" aria-label="Zonas desenhadas">
                {zones.map((z, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm">
                    <span className={cn("w-7 font-semibold", z.kind === "support" ? "text-success" : "text-danger")}>{z.kind === "support" ? "S" : "R"}{i + 1}</span>
                    <span className="tabular flex-1 text-muted-foreground">{z.bottom.toLocaleString("en-US")} – {z.top.toLocaleString("en-US")}</span>
                    <Button variant="ghost" size="icon-sm" disabled={Boolean(result)} aria-label={`Remover zona ${i + 1}`} onClick={() => setZones((all) => all.filter((_, j) => j !== i))}>
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {!result ? (
              <Button disabled={pending || zones.length === 0} onClick={async () => { const r = await check({ zones }); if (r) setResult(r); }}>
                {pending && <Loader2 className="animate-spin" />} Comparar com a solução
              </Button>
            ) : (
              <Button variant="outline" onClick={() => { setZones([]); setResult(null); }}>
                <RotateCcw /> Tentar de novo
              </Button>
            )}
            {checkError && <p className="text-sm text-danger">{checkError}</p>}
          </CardContent>
        </Card>

        {!result && <LabHint>Procura preços onde o mercado reagiu várias vezes (rejeições, pavios, viragens). Pensa em zonas com espessura — não em linhas exatas.</LabHint>}

        {result && (
          <div className="grid gap-3">
            <ScoreBanner result={result} />
            {result.feedback.matches.map((m) => (
              <Card key={m.solutionIndex}>
                <CardContent className="grid gap-1 p-4 text-sm">
                  <p className="font-medium">
                    {m.solution.kind === "support" ? "Suporte" : "Resistência"} {m.solution.bottom.toLocaleString("en-US")}–{m.solution.top.toLocaleString("en-US")}{" "}
                    {m.userIndex === null ? <span className="text-danger">· não encontrado</span> : m.kindCorrect ? <span className="text-success">· encontrado</span> : <span className="text-warning">· encontrado, mas tipo trocado</span>}
                  </p>
                  <p className="text-muted-foreground">{m.note}</p>
                </CardContent>
              </Card>
            ))}
            {result.feedback.extraZones.length > 0 && (
              <p className="text-sm text-muted-foreground">Desenhaste {result.feedback.extraZones.length} zona(s) fora da solução educativa. Isso não é necessariamente errado — mas zonas a mais diluem o que realmente importa.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
