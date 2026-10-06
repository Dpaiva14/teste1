"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Stat } from "@/components/ui/stat";
import { DirectionToggle, NumberField, SymbolSelectNative } from "@/features/calculators/components/number-field";
import { ScreenshotField } from "@/features/media/components/screenshot-field";
import { useApiAction } from "@/hooks/use-api-action";
import { api } from "@/lib/api-client";
import { formatR, formatUsd } from "@/lib/money";
import { parseNumber } from "@/lib/parse-number";
import { cn } from "@/lib/utils";
import type { AchievementDef } from "@/modules/achievements";
import { computeEntryNumbers, MissingResultError } from "../logic/numbers";
import { EMOTION_LABEL, EMOTIONS, MISTAKE_LABEL, MISTAKES, SETUP_SUGGESTIONS, type JournalInput } from "../schemas";
import type { JournalEntryDTO } from "../types";

export interface JournalFormInitial {
  tradeId?: string | null;
  entry?: JournalEntryDTO;
  prefill?: Partial<{ instrument: string; direction: "LONG" | "SHORT"; timeframe: string; entryPrice: number; stopLoss: number; takeProfit: number | null; exitPrice: number | null; contracts: number; result: number | null; riskAmount: number | null; closedAt: string; emotionalState: string }>;
}

function toLocalInput(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const s = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));

export function JournalForm({ initial }: { initial: JournalFormInitial }) {
  const router = useRouter();
  const e = initial.entry;
  const p = initial.prefill;

  const [tradeDate, setTradeDate] = useState(toLocalInput(e?.tradeDate ?? p?.closedAt));
  const [instrument, setInstrument] = useState(e?.instrument ?? p?.instrument ?? "YM");
  const [direction, setDirection] = useState<"LONG" | "SHORT">(e?.direction ?? p?.direction ?? "LONG");
  const [timeframe, setTimeframe] = useState(e?.timeframe ?? p?.timeframe ?? "M15");
  const [setup, setSetup] = useState(e?.setup ?? "");
  const [contracts, setContracts] = useState(s(e?.contracts ?? p?.contracts ?? 1));
  const [entry, setEntry] = useState(s(e?.entryPrice ?? p?.entryPrice));
  const [stop, setStop] = useState(s(e?.stopLoss ?? p?.stopLoss));
  const [target, setTarget] = useState(s(e?.takeProfit ?? p?.takeProfit));
  const [exit, setExit] = useState(s(e?.exitPrice ?? p?.exitPrice));
  const [resultOverride, setResultOverride] = useState(e || !p?.result ? "" : s(p.result));
  const [emotion, setEmotion] = useState(e?.emotionalState ?? p?.emotionalState ?? "CALM");
  const [mistakes, setMistakes] = useState<string[]>(e?.mistakes ?? []);
  const [mistakeNote, setMistakeNote] = useState(e?.mistakeNote ?? "");
  const [lesson, setLesson] = useState(e?.lesson ?? "");
  const [notes, setNotes] = useState(e?.notes ?? "");
  const [followedPlan, setFollowedPlan] = useState<boolean | null>(e?.followedPlan ?? null);
  const [rating, setRating] = useState<number | null>(e?.processRating ?? null);
  const [before, setBefore] = useState<string | null>(e?.screenshotBeforeId ?? null);
  const [after, setAfter] = useState<string | null>(e?.screenshotAfterId ?? null);

  const preview = useMemo(() => {
    const en = parseNumber(entry), st = parseNumber(stop), ex = parseNumber(exit), c = parseNumber(contracts), ro = parseNumber(resultOverride);
    if (en === null || st === null || c === null || c < 1) return null;
    try {
      return computeEntryNumbers({ instrument: instrument as "YM", direction, entryPrice: en, stopLoss: st, exitPrice: ex, contracts: Math.floor(c), result: ro });
    } catch (err) {
      return err instanceof MissingResultError ? "missing" : null;
    }
  }, [entry, stop, exit, contracts, resultOverride, instrument, direction]);

  const action = useApiAction((input: unknown) => (e ? api<{ xpAwarded: number; newAchievements: AchievementDef[] }>(`/api/journal/${e.id}`, { method: "PUT", body: input }) : api<{ xpAwarded: number; newAchievements: AchievementDef[] }>("/api/journal", { method: "POST", body: input })));

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const body: Record<string, unknown> = {
      tradeId: initial.tradeId ?? e?.tradeId ?? null,
      tradeDate: new Date(tradeDate).toISOString(),
      instrument, direction, timeframe, setup: setup.trim(),
      entryPrice: parseNumber(entry), stopLoss: parseNumber(stop), takeProfit: parseNumber(target), exitPrice: parseNumber(exit),
      contracts: Math.floor(parseNumber(contracts) ?? 0),
      result: parseNumber(resultOverride),
      emotionalState: emotion, mistakes, mistakeNote: mistakeNote || undefined, lesson: lesson || undefined, notes: notes || undefined,
      followedPlan, processRating: rating, screenshotBeforeId: before, screenshotAfterId: after,
    };
    const res = await action.run(body as unknown as JournalInput);
    if (res) {
      toast.success(e ? "Entrada atualizada." : `Entrada registada${res.xpAwarded ? ` · +${res.xpAwarded} XP` : ""}.`);
      for (const a of res.newAchievements) toast.success(`Conquista: ${a.title}`, { description: a.description });
      router.push("/journal");
      router.refresh();
    }
  }

  const fe = action.fieldErrors;
  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      {action.error && <Alert variant="destructive"><AlertDescription>{action.error}</AlertDescription></Alert>}

      <Card>
        <CardHeader><CardTitle>1. O trade</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Data e hora" htmlFor="j-date" error={fe.tradeDate?.[0]}><Input id="j-date" type="datetime-local" value={tradeDate} onChange={(ev) => setTradeDate(ev.target.value)} /></Field>
            <SymbolSelectNative id="j-symbol" value={instrument} onChange={setInstrument} />
            <DirectionToggle value={direction} onChange={setDirection} />
            <Field label="Timeframe" htmlFor="j-tf">
              <select id="j-tf" value={timeframe} onChange={(ev) => setTimeframe(ev.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
                {["M1", "M5", "M15", "H1", "H4", "D1"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Setup" htmlFor="j-setup" error={fe.setup?.[0]}>
              <Input id="j-setup" list="setups" value={setup} maxLength={60} onChange={(ev) => setSetup(ev.target.value)} placeholder="Ex.: Trend Pullback" />
              <datalist id="setups">{SETUP_SUGGESTIONS.map((x) => <option key={x} value={x} />)}</datalist>
            </Field>
            <NumberField id="j-contracts" label="Contratos" value={contracts} onChange={setContracts} error={fe.contracts?.[0]} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField id="j-entry" label="Entrada" value={entry} onChange={setEntry} error={fe.entryPrice?.[0]} />
            <NumberField id="j-stop" label="Stop" value={stop} onChange={setStop} error={fe.stopLoss?.[0]} />
            <NumberField id="j-target" label="Target" value={target} onChange={setTarget} />
            <NumberField id="j-exit" label="Saída" value={exit} onChange={setExit} />
          </div>
          <NumberField id="j-result" label="Resultado real em $ (opcional)" value={resultOverride} onChange={setResultOverride} prefix="$" hint="Preenche só se o teu P&L (com comissões) diferir do calculado." className="max-w-xs" />
          {preview && preview !== "missing" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Risco ($)" value={formatUsd(preview.riskAmount)} />
              <Stat label="Resultado" value={formatUsd(preview.result)} tone={preview.result >= 0 ? "success" : "danger"} />
              <Stat label="R-multiple" value={formatR(preview.rMultiple)} tone={preview.rMultiple >= 0 ? "success" : "danger"} />
            </div>
          ) : preview === "missing" ? (
            <p className="text-sm text-warning">Indica o preço de saída ou o resultado para calcular o R.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>2. Estado emocional e erros</CardTitle><CardDescription>Honestidade primeiro: o journal só serve se registares o que realmente se passou.</CardDescription></CardHeader>
        <CardContent className="grid gap-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Como te sentias ao entrar?</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Estado emocional">
              {EMOTIONS.map((k) => (
                <button key={k} type="button" role="radio" aria-checked={emotion === k} onClick={() => setEmotion(k)} className={cn("rounded-full border px-3 py-1 text-sm", emotion === k ? "border-primary bg-primary/15" : "hover:bg-accent")}>{EMOTION_LABEL[k]}</button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Erros cometidos (se houver)</legend>
            <div className="flex flex-wrap gap-2">
              {MISTAKES.map((k) => {
                const on = mistakes.includes(k);
                return <button key={k} type="button" aria-pressed={on} onClick={() => setMistakes((m) => (on ? m.filter((x) => x !== k) : [...m, k]))} className={cn("rounded-full border px-3 py-1 text-sm", on ? "border-danger bg-danger/15" : "hover:bg-accent")}>{MISTAKE_LABEL[k]}</button>;
              })}
            </div>
          </fieldset>
          {mistakes.length > 0 && <Field label="O que aconteceu?" htmlFor="j-mnote"><Textarea id="j-mnote" rows={2} value={mistakeNote} onChange={(ev) => setMistakeNote(ev.target.value)} /></Field>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>3. Revisão do processo</CardTitle><CardDescription>“O meu processo foi correto, independentemente do resultado?”</CardDescription></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Segui o plano?</legend>
              <div className="flex gap-2" role="radiogroup">
                {([[true, "Sim"], [false, "Não"], [null, "Sem plano"]] as const).map(([v, l]) => (
                  <button key={String(v)} type="button" role="radio" aria-checked={followedPlan === v} onClick={() => setFollowedPlan(v)} className={cn("rounded-md border px-3 py-1 text-sm", followedPlan === v ? "border-primary bg-primary/15" : "hover:bg-accent")}>{l}</button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Qualidade do processo (1–5)</legend>
              <div className="flex gap-1.5" role="radiogroup" aria-label="Qualidade do processo">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={rating === n} onClick={() => setRating(rating === n ? null : n)} className={cn("size-9 rounded-md border text-sm font-semibold", rating !== null && n <= rating ? "border-primary bg-primary/20 text-primary" : "hover:bg-accent")}>{n}</button>
                ))}
              </div>
            </fieldset>
          </div>
          <Field label="Lição" htmlFor="j-lesson" hint="O que levo deste trade para o próximo? (Escrever lição + avaliar processo dá XP.)"><Textarea id="j-lesson" rows={2} value={lesson} onChange={(ev) => setLesson(ev.target.value)} /></Field>
          <Field label="Notas" htmlFor="j-notes"><Textarea id="j-notes" rows={3} value={notes} onChange={(ev) => setNotes(ev.target.value)} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>4. Screenshots</CardTitle><CardDescription>Privados: só tu os vês. PNG, JPEG ou WEBP até 5 MB.</CardDescription></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <ScreenshotField label="Antes da entrada" value={before} onChange={setBefore} />
          <ScreenshotField label="Depois do trade" value={after} onChange={setAfter} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="submit" disabled={action.pending}>{action.pending ? <Loader2 className="animate-spin" /> : <Save />} {e ? "Guardar alterações" : "Guardar no journal"}</Button>
        {e && (
          <Button
            type="button"
            variant="ghost"
            className="text-danger"
            onClick={async () => {
              if (!confirm("Apagar esta entrada do journal?")) return;
              await api(`/api/journal/${e.id}`, { method: "DELETE" });
              router.push("/journal");
              router.refresh();
            }}
          >
            <Trash2 /> Apagar
          </Button>
        )}
      </div>
    </form>
  );
}
