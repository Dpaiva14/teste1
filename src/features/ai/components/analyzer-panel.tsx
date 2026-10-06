"use client";

import { useMemo, useState } from "react";
import { Bot, Loader2, ScanSearch, ShieldAlert } from "lucide-react";
import { DemoBadge } from "@/components/brand/demo-badge";
import { Markdown } from "@/components/markdown";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { Stat } from "@/components/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CandleChart } from "@/features/chart/components/candle-chart";
import type { ChartOverlay } from "@/features/chart/types";
import { ScreenshotField } from "@/features/media/components/screenshot-field";
import { useApiAction } from "@/hooks/use-api-action";
import { api } from "@/lib/api-client";
import { AI_TUTOR_NOTICE } from "@/modules/legal";
import type { ImageAnalysisDTO, ScenarioAnalysisDTO } from "../types";
import { AiUnavailable } from "./ai-unavailable";

interface ScenarioOption {
  id: string;
  title: string;
  symbol: string;
  timeframe: string;
}

const STRUCTURE_LABEL = { BULLISH: "Alta (HH/HL)", BEARISH: "Baixa (LH/LL)", RANGE: "Lateral / mista" } as const;

function ScenarioTab({ scenarios, aiConfigured }: { scenarios: ScenarioOption[]; aiConfigured: boolean }) {
  const [id, setId] = useState(scenarios[0]?.id ?? "");
  const [result, setResult] = useState<ScenarioAnalysisDTO | null>(null);
  const action = useApiAction((scenarioId: string) => api<{ analysis: ScenarioAnalysisDTO }>("/api/analyzer", { method: "POST", body: { mode: "scenario", scenarioId, narrate: true } }));

  const overlays = useMemo<ChartOverlay[]>(() => {
    if (!result) return [];
    const out: ChartOverlay[] = result.facts.swings.map((s) => ({
      type: "marker" as const,
      id: `sw-${s.index}`,
      index: s.index,
      price: s.price,
      label: s.label ?? (s.type === "high" ? "H" : "L"),
      placement: s.type === "high" ? ("above" as const) : ("below" as const),
      tone: s.label === "HH" || s.label === "HL" ? ("success" as const) : s.label === "LH" || s.label === "LL" ? ("danger" as const) : ("muted" as const),
    }));
    result.facts.levels
      .filter((l) => l.touches >= 2)
      .forEach((l, i) => out.push({ type: "hline", id: `lv-${i}`, price: l.price, label: `${l.kind === "support" ? "S" : "R"} ${l.price.toLocaleString("en-US")} (${l.touches}×)`, tone: l.kind === "support" ? "success" : "danger", dashed: true }));
    return out;
  }, [result]);

  const f = result?.facts;
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Cenário (dados sintéticos DEMO)" htmlFor="an-scenario" className="min-w-64 flex-1">
          <select id="an-scenario" value={id} onChange={(e) => setId(e.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} · {s.symbol} {s.timeframe}
              </option>
            ))}
          </select>
        </Field>
        <Button
          disabled={action.pending || !id}
          onClick={async () => {
            const res = await action.run(id);
            if (res) setResult(res.analysis);
          }}
        >
          {action.pending ? <Loader2 className="animate-spin" /> : <ScanSearch />} Analisar
        </Button>
      </div>
      {action.error && (
        <Alert variant="destructive">
          <AlertDescription>{action.error}</AlertDescription>
        </Alert>
      )}

      {result && f && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid min-w-0 content-start gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{result.scenario.title}</h2>
              <DemoBadge />
            </div>
            <CandleChart candles={result.candles} visibleCount={result.candles.length + 4} startIndex={0} rightPadSlots={0} overlays={overlays} height={420} intraday ariaLabel={`Gráfico ${result.scenario.symbol} ${result.scenario.timeframe} (DEMO) com swings e níveis calculados`} />
            <div className="grid gap-3 sm:grid-cols-4">
              <Stat label="Estrutura" value={STRUCTURE_LABEL[f.structure]} className="sm:col-span-2" />
              <Stat label="ATR" value={`${f.atr} pts`} />
              <Stat label="Posição no range" value={`${f.rangePosition}%`} />
            </div>
          </div>

          <div className="grid min-w-0 content-start gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Leitura educativa (calculada)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {result.reading.map((line) => (
                  <p key={line} className="text-muted-foreground">
                    {line}
                  </p>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="size-4" /> Narrativa de IA
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {result.narrative ? (
                  <>
                    {result.narrativeBlocked && <p className="mb-2 text-xs text-warning">Resposta retida pelo filtro de segurança.</p>}
                    <Markdown>{result.narrative}</Markdown>
                  </>
                ) : (
                  <p className="text-muted-foreground">{aiConfigured ? "Sem narrativa de IA para esta análise." : "A narrativa de IA não está ativa neste ambiente; a leitura calculada ao lado é determinística e funciona sem IA."}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function ImageTab() {
  const [asset, setAsset] = useState<string | null>(null);
  const [symbol, setSymbol] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState<ImageAnalysisDTO | null>(null);
  const action = useApiAction((body: Record<string, unknown>) => api<{ image: ImageAnalysisDTO }>("/api/analyzer", { method: "POST", body }));

  return (
    <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="grid content-start gap-4">
        <ScreenshotField label="Screenshot do gráfico" value={asset} onChange={(v) => { setAsset(v); setResult(null); }} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Instrumento (opcional)" htmlFor="an-symbol">
            <select id="an-symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
              <option value="">—</option>
              {["YM", "MYM", "US30"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Timeframe (opcional)" htmlFor="an-tf">
            <select id="an-tf" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
              <option value="">—</option>
              {["M1", "M5", "M15", "H1", "H4", "D1"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Nota (opcional)" htmlFor="an-note" hint="O que queres perceber neste gráfico?">
          <Textarea id="an-note" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <Button
          disabled={!asset || action.pending}
          onClick={async () => {
            const res = await action.run({ mode: "image", assetId: asset, ...(symbol ? { symbol } : {}), ...(timeframe ? { timeframe } : {}), ...(note.trim() ? { note: note.trim() } : {}) });
            if (res) setResult(res.image);
          }}
        >
          {action.pending ? <Loader2 className="animate-spin" /> : <ScanSearch />} Analisar imagem
        </Button>
        {action.error && (
          <Alert variant="destructive">
            <AlertDescription>{action.error}</AlertDescription>
          </Alert>
        )}
      </div>
      <Card className="self-start">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="size-4" /> Leitura educativa
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {result ? (
            <>
              {result.blocked && <p className="mb-2 text-xs text-warning">Resposta retida pelo filtro de segurança.</p>}
              <Markdown>{result.narrative}</Markdown>
            </>
          ) : (
            <p className="text-muted-foreground">Carrega um screenshot (PNG, JPEG ou WEBP até 5 MB). A imagem fica privada na tua conta. A análise descreve estrutura, níveis e cenários condicionais — não dá sinais.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AnalyzerPanel({ scenarios, aiConfigured, isAdmin }: { scenarios: ScenarioOption[]; aiConfigured: boolean; isAdmin: boolean }) {
  return (
    <div className="grid gap-5">
      <Tabs defaultValue="scenario">
        <TabsList>
          <TabsTrigger value="scenario">Cenário DEMO</TabsTrigger>
          <TabsTrigger value="image">Screenshot</TabsTrigger>
        </TabsList>
        <TabsContent value="scenario" className="mt-4">
          <ScenarioTab scenarios={scenarios} aiConfigured={aiConfigured} />
        </TabsContent>
        <TabsContent value="image" className="mt-4">
          {aiConfigured ? <ImageTab /> : <AiUnavailable isAdmin={isAdmin} feature="A análise de screenshots" />}
        </TabsContent>
      </Tabs>
      <Alert variant="warning">
        <ShieldAlert />
        <AlertDescription>
          {AI_TUTOR_NOTICE} A análise usa linguagem probabilística: descreve o que se observa e o que invalidaria um cenário — nunca prevê o preço.
        </AlertDescription>
      </Alert>
    </div>
  );
}
