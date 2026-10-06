"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { NumberField } from "@/features/calculators/components/number-field";
import { useApiAction } from "@/hooks/use-api-action";
import { api } from "@/lib/api-client";
import { parseNumber } from "@/lib/parse-number";
import { cn } from "@/lib/utils";
import type { DailyPlanDTO } from "../server/daily-plan-service";

const BIASES = [["BULLISH", "Bullish", "border-success bg-success/20 text-success"], ["NEUTRAL", "Neutral", "border-primary bg-primary/15"], ["BEARISH", "Bearish", "border-danger bg-danger/20 text-danger"]] as const;
const LEVEL_FIELDS = [["pdh", "PDH — máx. do dia anterior"], ["pdl", "PDL — mín. do dia anterior"], ["pwh", "PWH — máx. da semana anterior"], ["pwl", "PWL — mín. da semana anterior"]] as const;
const s = (v: unknown) => (v === null || v === undefined ? "" : String(v));

export function DailyPlanForm({ date, plan, suggestedEvents }: { date: string; plan: DailyPlanDTO | null; suggestedEvents: string[] }) {
  const router = useRouter();
  const [bias, setBias] = useState<"BULLISH" | "BEARISH" | "NEUTRAL">(plan?.bias ?? "NEUTRAL");
  const [levels, setLevels] = useState<Record<string, string>>({ pdh: s(plan?.keyLevels.pdh), pdl: s(plan?.keyLevels.pdl), pwh: s(plan?.keyLevels.pwh), pwl: s(plan?.keyLevels.pwl), majorSR: s(plan?.keyLevels.majorSR), supply: s(plan?.keyLevels.supply), demand: s(plan?.keyLevels.demand) });
  const [events, setEvents] = useState<string[]>(plan?.events ?? []);
  const [newEvent, setNewEvent] = useState("");
  const [mustHappen, setMustHappen] = useState(plan?.mustHappen ?? "");
  const [invalidation, setInvalidation] = useState(plan?.invalidation ?? "");
  const [maxRisk, setMaxRisk] = useState(s(plan?.maxRisk));
  const [unit, setUnit] = useState<"USD" | "PERCENT">(plan?.maxRiskUnit ?? "USD");
  const [maxTrades, setMaxTrades] = useState(s(plan?.maxTrades));
  const [notes, setNotes] = useState(plan?.notes ?? "");
  const [review, setReview] = useState(plan?.review ?? "");
  const [followed, setFollowed] = useState<boolean | null>(plan?.followedPlan ?? null);

  const action = useApiAction((body: unknown) => api<{ xpAwarded: number }>("/api/daily-plans", { method: "PUT", body }));

  async function save() {
    const num = (k: string) => parseNumber(levels[k] ?? "");
    const res = await action.run({
      date, bias,
      keyLevels: { pdh: num("pdh"), pdl: num("pdl"), pwh: num("pwh"), pwl: num("pwl"), majorSR: levels.majorSR || undefined, supply: levels.supply || undefined, demand: levels.demand || undefined },
      events, mustHappen: mustHappen || undefined, invalidation: invalidation || undefined,
      maxRisk: parseNumber(maxRisk), maxRiskUnit: unit, maxTrades: maxTrades ? Math.floor(parseNumber(maxTrades) ?? 0) : null,
      notes: notes || undefined, review: review || undefined, followedPlan: followed,
    });
    if (res) {
      toast.success(`Plano guardado${res.xpAwarded ? ` · +${res.xpAwarded} XP` : ""}.`);
      router.refresh();
    }
  }

  const addEvent = (t: string) => {
    const v = t.trim();
    if (v && !events.includes(v) && events.length < 12) setEvents([...events, v]);
    setNewEvent("");
  };

  return (
    <div className="grid gap-5">
      {action.error && <Alert variant="destructive"><AlertDescription>{action.error}</AlertDescription></Alert>}

      <Card>
        <CardHeader><CardTitle className="text-base">Market bias</CardTitle><CardDescription>A tua leitura do contexto — não uma previsão. Revê-la quando os factos mudarem.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Market bias">
            {BIASES.map(([v, l, cls]) => <button key={v} type="button" role="radio" aria-checked={bias === v} onClick={() => setBias(v)} className={cn("rounded-md border px-3 py-2 text-sm font-semibold", bias === v ? cls : "text-muted-foreground hover:bg-accent")}>{l}</button>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Níveis-chave</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LEVEL_FIELDS.map(([k, l]) => <NumberField key={k} id={`lv-${k}`} label={l} value={levels[k] ?? ""} onChange={(v) => setLevels((x) => ({ ...x, [k]: v }))} />)}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="S/R principais" htmlFor="lv-sr"><Input id="lv-sr" value={levels.majorSR ?? ""} maxLength={120} placeholder="ex.: 38.600 / 38.300" onChange={(e) => setLevels((x) => ({ ...x, majorSR: e.target.value }))} /></Field>
            <Field label="Zona de oferta (supply)" htmlFor="lv-sup"><Input id="lv-sup" value={levels.supply ?? ""} maxLength={120} onChange={(e) => setLevels((x) => ({ ...x, supply: e.target.value }))} /></Field>
            <Field label="Zona de procura (demand)" htmlFor="lv-dem"><Input id="lv-dem" value={levels.demand ?? ""} maxLength={120} onChange={(e) => setLevels((x) => ({ ...x, demand: e.target.value }))} /></Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Eventos importantes</CardTitle><CardDescription>CPI, NFP, FOMC, discursos… ou nenhum.</CardDescription></CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {events.map((e) => <Badge key={e} variant="secondary" className="gap-1.5 py-1">{e}<button type="button" aria-label={`Remover ${e}`} onClick={() => setEvents(events.filter((x) => x !== e))}><X className="size-3" /></button></Badge>)}
            {events.length === 0 && <span className="text-sm text-muted-foreground">Nenhum evento adicionado.</span>}
          </div>
          <div className="flex gap-2">
            <Input value={newEvent} onChange={(e) => setNewEvent(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEvent(newEvent); } }} placeholder="Adicionar evento…" aria-label="Novo evento" maxLength={80} />
            <Button type="button" variant="outline" onClick={() => addEvent(newEvent)}><Plus /> Adicionar</Button>
          </div>
          {suggestedEvents.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">Do calendário:
              {suggestedEvents.map((e) => <button key={e} type="button" onClick={() => addEvent(e)} className="rounded-full border px-2 py-0.5 hover:bg-accent">+ {e}</button>)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Plano de trade</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <Field label="O que tem de acontecer antes de eu entrar?" htmlFor="pl-must"><Textarea id="pl-must" rows={2} value={mustHappen} onChange={(e) => setMustHappen(e.target.value)} placeholder="Ex.: pullback ao S/R + confirmação em M5 + R:R ≥ 1,5" /></Field>
          <Field label="O que invalida a ideia?" htmlFor="pl-inv"><Textarea id="pl-inv" rows={2} value={invalidation} onChange={(e) => setInvalidation(e.target.value)} placeholder="Ex.: fecho abaixo do último HL (38.430)" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField id="pl-risk" label="Risco máximo do dia" value={maxRisk} onChange={setMaxRisk} prefix={unit === "USD" ? "$" : undefined} suffix={unit === "PERCENT" ? "%" : undefined} />
            <Field label="Unidade" htmlFor="pl-unit"><select id="pl-unit" value={unit} onChange={(e) => setUnit(e.target.value as "USD" | "PERCENT")} className="h-9 rounded-md border border-input bg-card px-3 text-sm"><option value="USD">Dólares</option><option value="PERCENT">% da conta</option></select></Field>
            <NumberField id="pl-max" label="Nº máximo de trades" value={maxTrades} onChange={setMaxTrades} />
          </div>
          <Field label="Notas" htmlFor="pl-notes"><Textarea id="pl-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Revisão do fim do dia</CardTitle><CardDescription>Segui o plano? Isto vale mais do que o P&L do dia.</CardDescription></CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex gap-2" role="radiogroup" aria-label="Segui o plano?">
            {([[true, "Segui o plano"], [false, "Não segui"], [null, "Não aplicável"]] as const).map(([v, l]) => <button key={String(v)} type="button" role="radio" aria-checked={followed === v} onClick={() => setFollowed(v)} className={cn("rounded-md border px-3 py-1.5 text-sm", followed === v ? "border-primary bg-primary/15" : "hover:bg-accent")}>{l}</button>)}
          </div>
          <Textarea rows={3} value={review} onChange={(e) => setReview(e.target.value)} aria-label="Revisão do dia" placeholder="O que fiz bem? O que repetiria? O que mudaria amanhã?" />
        </CardContent>
      </Card>

      <Button className="w-fit" onClick={save} disabled={action.pending}>{action.pending ? <Loader2 className="animate-spin" /> : <Save />} Guardar plano</Button>
    </div>
  );
}
