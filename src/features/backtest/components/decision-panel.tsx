"use client";

import { useState } from "react";
import { AlertTriangle, Hourglass, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/input";
import { NumberField } from "@/features/calculators/components/number-field";
import { ENTRY_REASONS, reasonMeta, type EntryReasonKey } from "@/features/trading/logic/entry-reasons";
import { costsFor } from "@/features/trading/logic/engine";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { StrategyDef } from "@/modules/strategies";
import type { DecisionInput } from "../schemas";
import { WAIT_STEP } from "../logic/resolve";
import type { PreviewPlan } from "../logic/preview";

export type Choice = "BUY" | "SELL" | "WAIT";

export interface Draft {
  choice: Choice;
  stopPts: string;
  targetR: string;
  noTarget: boolean;
}

const CHOICES: { key: Choice; label: string; icon: typeof TrendingUp; active: string }[] = [
  { key: "BUY", label: "BUY", icon: TrendingUp, active: "bg-success text-success-foreground" },
  { key: "SELL", label: "SELL", icon: TrendingDown, active: "bg-danger text-danger-foreground" },
  { key: "WAIT", label: "WAIT", icon: Hourglass, active: "bg-primary text-primary-foreground" },
];

/**
 * The decision ticket. BUY / SELL need a stop (the lab always sizes the trade from the risk budget) and an entry
 * reason; WAIT needs nothing — staying out is a first-class decision and earns the same XP as trading.
 * Incomplete rules and emotional reasons warn but never block.
 */
export function DecisionPanel({
  strategy,
  symbol,
  riskPercent,
  plan,
  atr,
  draft,
  onDraftChange,
  disabled,
  disabledNote,
  onSubmit,
}: {
  strategy: StrategyDef;
  symbol: string;
  riskPercent: number;
  plan: PreviewPlan | null;
  atr: number;
  draft: Draft;
  onDraftChange: (d: Draft) => void;
  disabled: boolean;
  disabledNote?: string;
  onSubmit: (input: DecisionInput) => Promise<boolean>;
}) {
  const [rules, setRules] = useState<boolean[]>(() => strategy.rules.map(() => false));
  const [reason, setReason] = useState<EntryReasonKey>("SETUP_VALID");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);

  const met = rules.filter(Boolean).length;
  const total = strategy.rules.length;
  const trading = draft.choice !== "WAIT";
  const meta = reasonMeta(reason);
  const stopDefault = Math.max(5, Math.round(atr * 1.5));
  const sizing = plan?.sizing;
  const contracts = sizing?.contracts ?? 0;
  const set = (patch: Partial<Draft>) => onDraftChange({ ...draft, ...patch });

  async function submit() {
    setPending(true);
    try {
      let input: DecisionInput;
      if (draft.choice === "WAIT") {
        input = { choice: "WAIT", note: note || undefined };
      } else {
        const stopPoints = Number(draft.stopPts.replace(",", ".")) || stopDefault;
        const r = Number(draft.targetR.replace(",", "."));
        input = {
          choice: draft.choice,
          stopPoints,
          targetR: draft.noTarget || !(r > 0) ? null : r,
          reason,
          note: note || undefined,
          rulesMet: met,
          rulesTotal: total,
        };
      }
      const ok = await onSubmit(input);
      if (ok) {
        setRules(strategy.rules.map(() => false));
        setReason("SETUP_VALID");
        setNote("");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">A tua decisão</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {disabledNote && (
          <Alert variant="info">
            <AlertDescription>{disabledNote}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-1 rounded-md bg-muted p-1" role="radiogroup" aria-label="Decisão">
          {CHOICES.map(({ key, label, icon: Icon, active }) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={draft.choice === key}
              disabled={disabled}
              onClick={() => set({ choice: key })}
              className={cn("flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-sm font-semibold transition-colors", draft.choice === key ? active : "text-muted-foreground hover:text-foreground")}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </button>
          ))}
        </div>

        {trading ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField id="bt-stop" label="Stop (pontos)" value={draft.stopPts} onChange={(v) => set({ stopPts: v })} placeholder={String(stopDefault)} hint="Vazio = 1,5×ATR" />
              <div className="grid gap-1.5">
                <NumberField id="bt-target" label="Alvo (R)" value={draft.noTarget ? "" : draft.targetR} onChange={(v) => set({ targetR: v })} suffix="R" />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <input type="checkbox" className="accent-[var(--primary)]" checked={draft.noTarget} onChange={(e) => set({ noTarget: e.target.checked })} /> sem alvo
                </label>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-sm" aria-live="polite">
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
                <dt className="text-muted-foreground">Entrada (a mercado)</dt>
                <dd className="text-right tabular">{plan ? plan.entry.toLocaleString("en-US") : "—"}</dd>
                <dt className="text-muted-foreground">Stop / Alvo</dt>
                <dd className="text-right tabular">
                  {plan ? plan.stop.toLocaleString("en-US", { maximumFractionDigits: 1 }) : "—"} / {plan?.target == null ? "—" : plan.target.toLocaleString("en-US", { maximumFractionDigits: 1 })}
                </dd>
                <dt className="text-muted-foreground">Contratos {symbol}</dt>
                <dd className="text-right text-lg font-semibold tabular text-primary">{contracts}</dd>
                <dt className="text-muted-foreground">Risco se o stop for atingido</dt>
                <dd className="text-right font-semibold tabular">{sizing ? `${formatUsd(sizing.actualRisk)} (${sizing.actualRiskPercent}%)` : "—"}</dd>
                <dt className="text-muted-foreground">R:R planeado</dt>
                <dd className="text-right tabular">{sizing?.rewardRisk != null ? `${sizing.rewardRisk}:1` : "—"}</dd>
              </dl>
              {sizing && contracts === 0 && <p className="mt-2 text-xs text-warning">{sizing.warnings[0] ?? sizing.explanation}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                Tamanho calculado com {riskPercent}% de risco por trade. Custos ilustrativos: spread {costsFor(symbol).spreadPoints} pt, comissão {formatUsd(costsFor(symbol).commissionPerSide)}/lado.
              </p>
            </div>

            <fieldset className="grid gap-1">
              <legend className="mb-1 text-sm font-medium">
                Regras da estratégia{" "}
                <span className={cn("text-xs font-normal tabular", met === total ? "text-success" : "text-muted-foreground")}>
                  ({met}/{total})
                </span>
              </legend>
              {strategy.rules.map((rule, i) => (
                <label key={rule} className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent/40">
                  <Checkbox className="mt-0.5" checked={rules[i] ?? false} onCheckedChange={(v) => setRules((r) => r.map((x, j) => (j === i ? Boolean(v) : x)))} />
                  <span className={cn(!rules[i] && "text-muted-foreground")}>{rule}</span>
                </label>
              ))}
              {met < total && (
                <Alert variant="warning" className="mt-1">
                  <AlertTriangle />
                  <AlertDescription className="text-xs">
                    Faltam {total - met} regra(s). Podes entrar na mesma — não bloqueamos — mas fica registado, e mais tarde vais comparar o resultado destas entradas com as completas.
                  </AlertDescription>
                </Alert>
              )}
            </fieldset>

            <fieldset className="grid gap-1.5">
              <legend className="mb-1 text-sm font-medium">Porque estás a entrar?</legend>
              <div className="grid grid-cols-2 gap-1.5">
                {ENTRY_REASONS.map((r) => (
                  <label key={r.key} className={cn("flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs", reason === r.key && (r.risky ? "border-danger bg-danger/10" : "border-primary bg-primary/10"))}>
                    <input type="radio" name="bt-reason" className="accent-[var(--primary)]" checked={reason === r.key} onChange={() => setReason(r.key)} />
                    {r.label}
                  </label>
                ))}
              </div>
              {meta?.nudge && (
                <Alert variant="destructive">
                  <AlertDescription className="text-xs">{meta.nudge}</AlertDescription>
                </Alert>
              )}
            </fieldset>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            WAIT avança {WAIT_STEP} barras sem posição. Esperar é uma decisão válida e vale o mesmo XP que operar — um processo seletivo passa mais tempo fora do mercado do que dentro.
          </p>
        )}

        <div className="grid gap-1.5">
          <label htmlFor="bt-note" className="text-sm font-medium">
            Nota <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <Textarea id="bt-note" rows={2} value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder={trading ? "O que vês? O que invalida esta ideia?" : "Porque esperas? O que falta para haver setup?"} />
        </div>

        <Button onClick={submit} disabled={disabled || pending || (trading && contracts < 1)}>
          {pending && <Loader2 className="animate-spin" />}
          {draft.choice === "WAIT" ? `Esperar (${WAIT_STEP} barras)` : `${draft.choice} ${contracts} ${symbol} (simulado)`}
        </Button>
      </CardContent>
    </Card>
  );
}
