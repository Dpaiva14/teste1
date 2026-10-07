"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Loader2, Send, Trash2 } from "lucide-react";
import { DemoBadge } from "@/components/brand/demo-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandleChart } from "@/features/chart/components/candle-chart";
import type { ChartPoint } from "@/features/chart/types";
import { api, errorMessage } from "@/lib/api-client";
import { parseNumber } from "@/lib/parse-number";
import { cn } from "@/lib/utils";
import { planMetrics } from "../logic/evaluate";
import { answersToOverlays } from "../logic/overlays";
import { completenessProblems, STEP_KEYS, STEP_META, type Answers, type StepKey } from "../schemas";
import type { AssessmentStateDTO } from "../types";
import { AssessmentReport } from "./assessment-report";
import { StepPanel, type PriceField } from "./step-panels";

const newId = () => Math.random().toString(36).slice(2, 10);
const round = (n: number) => Math.round(n);
const FIELD_RANGE = { min: 1, max: 1_000_000 };

type SaveState = "saved" | "saving" | "error";

function textsOf(a: Answers): Record<PriceField, string> {
  return { entry: a.entry?.toString() ?? "", stop: a.stop?.toString() ?? "", target: a.target?.toString() ?? "", contracts: a.contracts?.toString() ?? "" };
}

export function AssessmentWorkspace({ initial }: { initial: AssessmentStateDTO }) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [answers, setAnswers] = useState<Answers>(initial.answers);
  const [texts, setTexts] = useState(() => textsOf(initial.answers));
  const [stepIdx, setStepIdx] = useState(() => {
    const firstOpen = STEP_KEYS.findIndex((k) => !initial.answers.done.includes(k));
    return firstOpen === -1 ? STEP_KEYS.length - 1 : firstOpen;
  });
  const [picking, setPicking] = useState(false);
  const [zoneRole, setZoneRole] = useState<"demand" | "supply">("demand");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [submitting, setSubmitting] = useState(false);

  const latest = useRef(answers);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chain = useRef<Promise<unknown>>(Promise.resolve());
  const step: StepKey = STEP_KEYS[stepIdx]!;
  const completed = state.status === "COMPLETED";

  const flush = useCallback((): Promise<unknown> => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const body = latest.current;
    setSaveState("saving");
    chain.current = chain.current
      .then(() => api(`/api/assessment/${initial.id}`, { method: "PUT", body: { answers: body } }))
      .then(() => setSaveState(latest.current === body ? "saved" : "saving"))
      .catch((e) => {
        setSaveState("error");
        toast.error(errorMessage(e));
      });
    return chain.current;
  }, [initial.id]);

  const patch = useCallback(
    (p: Partial<Answers>) => {
      const next = { ...latest.current, ...p };
      latest.current = next;
      setAnswers(next);
      setSaveState("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 700);
    },
    [flush],
  );

  // Never lose the last edit: flush on unmount and when the tab is hidden.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden && timer.current) void flush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      if (timer.current) void flush();
    };
  }, [flush]);

  const setText = useCallback(
    (field: PriceField, text: string) => {
      setTexts((t) => ({ ...t, [field]: text }));
      const n = parseNumber(text);
      if (field === "contracts") patch({ contracts: n !== null && Number.isInteger(n) && n >= 0 && n <= 1000 ? n : null });
      else patch({ [field]: n !== null && n >= FIELD_RANGE.min && n <= FIELD_RANGE.max ? n : null } as Partial<Answers>);
    },
    [patch],
  );

  const plan = useMemo(() => planMetrics(answers), [answers]);
  const lastRel = state.candles.length - 1;
  const overlays = useMemo(() => answersToOverlays(answers, state.windowStart, lastRel), [answers, state.windowStart, lastRel]);
  const extraPrices = useMemo(() => [answers.entry, answers.stop, answers.target].filter((p): p is number => p !== null), [answers.entry, answers.stop, answers.target]);

  const toAbs = useCallback((p: ChartPoint) => ({ index: Math.min(state.candles.length - 1, Math.max(0, p.index)) + state.windowStart, price: round(p.price) }), [state.candles.length, state.windowStart]);

  const onPointClick = useCallback(
    (p: ChartPoint) => {
      const price = round(p.price);
      if (step === "sr") {
        if (latest.current.sr.length >= 8) return void toast.warning("Máximo de 8 níveis.");
        patch({ sr: [...latest.current.sr, { id: newId(), price }] });
      } else if (step === "liquidity") {
        const cur = latest.current.liquidity;
        if (cur.none) return void toast.info("Desmarca «Não identifico liquidez» para marcar níveis.");
        if (cur.levels.length >= 4) return void toast.warning("Máximo de 4 níveis de liquidez.");
        patch({ liquidity: { ...cur, levels: [...cur.levels, { id: newId(), price }] } });
      } else if ((step === "entry" || step === "stop" || step === "target") && picking) {
        setText(step, String(price));
        setPicking(false);
      }
    },
    [step, picking, patch, setText],
  );

  const onDragEnd = useCallback(
    (a: ChartPoint, b: ChartPoint) => {
      const pa = toAbs(a);
      const pb = toAbs(b);
      if (step === "supplyDemand") {
        if (latest.current.zones.length >= 6) return void toast.warning("Máximo de 6 zonas.");
        let top = Math.max(pa.price, pb.price);
        let bottom = Math.min(pa.price, pb.price);
        if (top - bottom < state.atr * 0.3) {
          const mid = (top + bottom) / 2;
          top = mid + state.atr * 0.2;
          bottom = mid - state.atr * 0.2;
        }
        patch({ zones: [...latest.current.zones, { id: newId(), role: zoneRole, top: round(top), bottom: round(bottom), fromIndex: Math.min(pa.index, pb.index) }] });
      } else if (step === "fibonacci") {
        if (Math.abs(pa.index - pb.index) < 2 || pa.price === pb.price) return void toast.info("Arrasta de um extremo ao outro do movimento.");
        patch({ fib: { from: pa, to: pb } });
      }
    },
    [step, toAbs, patch, zoneRole, state.atr],
  );

  const mode = completed ? "none" : step === "sr" || step === "liquidity" || ((step === "entry" || step === "stop" || step === "target") && picking) ? "click" : step === "supplyDemand" || step === "fibonacci" ? "drag" : "none";

  const goto = useCallback(
    (i: number) => {
      setPicking(false);
      setStepIdx(Math.max(0, Math.min(STEP_KEYS.length - 1, i)));
      void flush();
    },
    [flush],
  );

  const confirm = useCallback(() => {
    const done = latest.current.done.includes(step) ? latest.current.done : [...latest.current.done, step];
    patch({ done });
    goto(stepIdx + 1);
  }, [step, stepIdx, patch, goto]);

  const problems = useMemo(() => completenessProblems(answers), [answers]);
  const lastStep = stepIdx === STEP_KEYS.length - 1;

  async function submit() {
    // The last step is confirmed implicitly by submitting.
    if (!latest.current.done.includes("reason")) patch({ done: [...latest.current.done, "reason"] });
    setSubmitting(true);
    try {
      await flush();
      if (completenessProblems(latest.current).length > 0) {
        toast.error("Ainda falta completar alguns passos.");
        return;
      }
      const res = await api<{ assessment: AssessmentStateDTO }>(`/api/assessment/${initial.id}/submit`, { method: "POST" });
      setState(res.assessment);
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function abandon() {
    if (!window.confirm("Abandonar esta tentativa? O progresso é apagado e podes começar com um gráfico novo.")) return;
    try {
      await api(`/api/assessment/${initial.id}`, { method: "DELETE" });
      router.replace("/assessment");
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  if (completed && state.report) return <AssessmentReport state={state} />;

  const meta = STEP_META[step];
  const doneSet = new Set(answers.done);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-2xl font-semibold tracking-tight">Avaliação final</h1>
        <DemoBadge />
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {saveState === "saved" ? "Guardado" : saveState === "saving" ? "A guardar…" : "Erro ao guardar"}
        </span>
        <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground" onClick={abandon}>
          <Trash2 /> Abandonar
        </Button>
      </div>

      <nav aria-label="Passos da avaliação" className="-mx-1 overflow-x-auto px-1 pb-1">
        <ol className="flex min-w-max gap-1.5">
          {STEP_KEYS.map((k, i) => (
            <li key={k}>
              <button
                type="button"
                onClick={() => goto(i)}
                aria-current={i === stepIdx ? "step" : undefined}
                title={STEP_META[k].title}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  i === stepIdx ? "border-primary bg-primary/15 text-primary" : doneSet.has(k) ? "border-success/40 text-success" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {doneSet.has(k) ? <Check className="size-3" aria-hidden /> : <span className="tabular">{STEP_META[k].n}</span>}
                <span className="hidden sm:inline">{STEP_META[k].title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <Card>
          <CardContent className="grid gap-2 p-3 sm:p-4">
            <CandleChart
              candles={state.candles}
              visibleCount={110}
              overlays={overlays}
              extraPrices={extraPrices}
              height={470}
              priceDecimals={0}
              intraday
              mode={mode}
              onPointClick={onPointClick}
              onDragEnd={onDragEnd}
              ariaLabel={`Gráfico MYM ${state.timeframe} (DEMO) desconhecido. Passo ${meta.n}: ${meta.title}.`}
            />
            <p className="text-xs text-muted-foreground">
              Dados sintéticos DEMO — gráfico que não conheces, só até ao ponto de decisão. Nada do que acontece depois é mostrado antes de submeteres. Rato: arrastar para mover, roda para ampliar.
            </p>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Passo {meta.n} de 12 — {meta.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{meta.question}</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <StepPanel step={step} ctx={{ answers, patch, plan, atr: state.atr, texts, setText, picking, setPicking, zoneRole, setZoneRole, disabled: submitting }} />

            {lastStep && problems.filter((p) => !p.startsWith("Passo 12")).length > 0 && (
              <Alert variant="warning">
                <AlertDescription>
                  <p className="mb-1 font-medium">Ainda falta:</p>
                  <ul className="list-disc space-y-0.5 pl-5">
                    {problems
                      .filter((p) => !p.startsWith("Passo 12"))
                      .slice(0, 6)
                      .map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" disabled={stepIdx === 0 || submitting} onClick={() => goto(stepIdx - 1)}>
                <ArrowLeft /> Anterior
              </Button>
              {lastStep ? (
                <Button disabled={submitting || problems.filter((p) => !p.startsWith("Passo 12")).length > 0} onClick={submit}>
                  {submitting ? <Loader2 className="animate-spin" /> : <Send />} Submeter avaliação
                </Button>
              ) : (
                <Button onClick={confirm} disabled={submitting}>
                  Continuar <ArrowRight />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">A avaliação mede o teu processo com a informação visível. Submeter é definitivo para esta tentativa.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
