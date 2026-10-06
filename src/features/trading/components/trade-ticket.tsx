"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/input";
import { DirectionToggle, NumberField, SymbolSelectNative } from "@/features/calculators/components/number-field";
import { positionSize } from "@/features/calculators/logic/risk";
import { formatUsd } from "@/lib/money";
import { parseNumber } from "@/lib/parse-number";
import { cn } from "@/lib/utils";
import { DEMO_MARGIN } from "@/modules/instruments";
import { autoChecks, CHECKLIST, evaluateChecklist, type ChecklistAnswers } from "../logic/checklist";
import { ENTRY_REASONS, reasonMeta, type EntryReasonKey } from "../logic/entry-reasons";
import { costsFor, entryFill } from "../logic/engine";
import type { OpenTradeInput } from "../schemas";

export interface TicketProps {
  bids: Record<string, number>;
  equity: number;
  freeMargin: number;
  atr: number;
  disabled?: boolean;
  /** shown above the form (e.g. "o feed terminou") */
  notice?: string;
  onSubmit: (input: OpenTradeInput) => Promise<boolean>;
}

const MANUAL_ITEMS = CHECKLIST.filter((i) => !i.auto);

/**
 * Order ticket shared by the simulator and chart replay. Size comes FROM the risk budget and the stop distance;
 * the dollar risk is always shown next to the number of contracts. The checklist warns, it never blocks.
 */
export function TradeTicket({ bids, equity, freeMargin, atr, disabled, notice, onSubmit }: TicketProps) {
  const [symbol, setSymbol] = useState("MYM");
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [riskPct, setRiskPct] = useState("1");
  const [stopPts, setStopPts] = useState("");
  const [targetR, setTargetR] = useState("2");
  const [noTarget, setNoTarget] = useState(false);
  const [manualContracts, setManualContracts] = useState("");
  const [answers, setAnswers] = useState<ChecklistAnswers>({});
  const [reason, setReason] = useState<EntryReasonKey>("SETUP_VALID");
  const [reasonNote, setReasonNote] = useState("");
  const [thesis, setThesis] = useState("");
  const [showProcess, setShowProcess] = useState(true);
  const [pending, setPending] = useState(false);

  const bid = bids[symbol] ?? 0;
  const stopDefault = Math.max(5, Math.round(atr * 1.5));
  const stopPoints = parseNumber(stopPts) ?? stopDefault;
  const entry = bid > 0 ? entryFill(symbol, direction, bid) : 0;
  const stopPrice = direction === "LONG" ? entry - stopPoints : entry + stopPoints;
  const rMult = parseNumber(targetR) ?? 2;
  const targetPrice = noTarget ? null : direction === "LONG" ? entry + stopPoints * rMult : entry - stopPoints * rMult;
  const commissionRT = costsFor(symbol).commissionPerSide * 2;

  const sizing = useMemo(
    () =>
      entry > 0 && stopPoints > 0
        ? positionSize({ balance: equity, riskPercent: parseNumber(riskPct) ?? 1, symbol, direction, entry, stop: stopPrice, target: targetPrice, commissionRoundTurn: commissionRT })
        : null,
    [equity, riskPct, symbol, direction, entry, stopPrice, targetPrice, commissionRT, stopPoints],
  );

  const manual = parseNumber(manualContracts);
  const contracts = manual !== null && manual >= 1 ? Math.floor(manual) : (sizing?.contracts ?? 0);
  const riskForContracts = sizing ? contracts * sizing.riskPerContract : 0;
  const riskPercentActual = equity > 0 ? (riskForContracts / equity) * 100 : 0;
  const margin = (DEMO_MARGIN[symbol] ?? 0) * contracts;
  const marginShort = margin > freeMargin;
  const rr = sizing?.rewardRisk ?? null;

  const auto = autoChecks({ stop: stopPrice, contracts, rewardRisk: rr });
  const merged: ChecklistAnswers = { ...answers, ...auto };
  const evaluation = evaluateChecklist(merged);
  const meta = reasonMeta(reason);

  async function submit() {
    setPending(true);
    try {
      const ok = await onSubmit({
        symbol: symbol as OpenTradeInput["symbol"],
        direction,
        contracts,
        stop: Math.round(stopPrice * 10) / 10,
        target: targetPrice === null ? null : Math.round(targetPrice * 10) / 10,
        entryReason: reason,
        entryReasonNote: reasonNote || undefined,
        checklist: answers,
        thesis: thesis || undefined,
      });
      if (ok) {
        setAnswers({});
        setThesis("");
        setReasonNote("");
        setReason("SETUP_VALID");
        setManualContracts("");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Bilhete de ordem (simulado)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {notice && (
          <Alert variant="warning">
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <SymbolSelectNative id="tk-symbol" value={symbol} onChange={setSymbol} label="Instrumento" />
          <DirectionToggle value={direction} onChange={setDirection} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField id="tk-risk" label="Risco" value={riskPct} onChange={setRiskPct} suffix="%" />
          <NumberField id="tk-stop" label="Stop (pts)" value={stopPts} onChange={setStopPts} placeholder={String(stopDefault)} hint="Vazio = 1,5×ATR" />
          <div className="grid gap-1.5">
            <NumberField id="tk-target" label="Alvo (R)" value={noTarget ? "" : targetR} onChange={setTargetR} suffix="R" />
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input type="checkbox" className="accent-[var(--primary)]" checked={noTarget} onChange={(e) => setNoTarget(e.target.checked)} /> sem alvo
            </label>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 text-sm">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
            <dt className="text-muted-foreground">Entrada (a mercado)</dt>
            <dd className="text-right tabular">{entry ? entry.toLocaleString("en-US") : "—"}</dd>
            <dt className="text-muted-foreground">Stop / Alvo</dt>
            <dd className="text-right tabular">
              {stopPrice.toLocaleString("en-US", { maximumFractionDigits: 1 })} / {targetPrice === null ? "—" : targetPrice.toLocaleString("en-US", { maximumFractionDigits: 1 })}
            </dd>
            <dt className="text-muted-foreground">Contratos</dt>
            <dd className="text-right text-lg font-semibold tabular text-primary">{contracts}</dd>
            <dt className="text-muted-foreground">Risco se o stop for atingido</dt>
            <dd className={cn("text-right font-semibold tabular", riskPercentActual > 2 ? "text-danger" : "text-foreground")}>
              {formatUsd(riskForContracts)} ({riskPercentActual.toFixed(2)}%)
            </dd>
            <dt className="text-muted-foreground">R:R planeado</dt>
            <dd className="text-right tabular">{rr !== null ? `${rr}:1` : "—"}</dd>
            <dt className="text-muted-foreground">Margem (ilustrativa)</dt>
            <dd className={cn("text-right tabular", marginShort && "text-danger")}>{formatUsd(margin)}</dd>
          </dl>
          {sizing && sizing.contracts === 0 && manual === null && (
            <p className="mt-2 text-xs text-warning">{sizing.warnings[0] ?? sizing.explanation}</p>
          )}
          <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            Tamanho manual:
            <input
              value={manualContracts}
              onChange={(e) => setManualContracts(e.target.value)}
              inputMode="numeric"
              placeholder="auto"
              className="h-7 w-16 rounded border bg-transparent px-2 text-right tabular text-foreground"
              aria-label="Número de contratos manual"
            />
          </label>
          {manual !== null && sizing && manual > sizing.contracts && (
            <p className="mt-1 text-xs text-danger">Estás acima do tamanho que respeita o teu risco ({sizing.contracts}). O risco real é {formatUsd(riskForContracts)}.</p>
          )}
        </div>

        <button type="button" onClick={() => setShowProcess((v) => !v)} className="flex items-center justify-between text-sm font-medium" aria-expanded={showProcess}>
          Processo: checklist, razão e tese ({evaluation.checked}/{evaluation.total})
          <ChevronDown className={cn("size-4 transition-transform", showProcess && "rotate-180")} />
        </button>

        {showProcess && (
          <div className="grid gap-4">
            <ul className="grid gap-1.5">
              {CHECKLIST.map((item) => {
                const isAuto = Boolean(item.auto);
                const checked = Boolean(merged[item.key]);
                return (
                  <li key={item.key}>
                    <label className={cn("flex items-start gap-2 rounded-md px-2 py-1 text-sm", isAuto ? "cursor-default" : "cursor-pointer hover:bg-accent/40")} title={item.why}>
                      <Checkbox
                        className="mt-0.5"
                        checked={checked}
                        disabled={isAuto}
                        onCheckedChange={(v) => setAnswers((a) => ({ ...a, [item.key]: Boolean(v) }))}
                      />
                      <span className={cn(!checked && "text-muted-foreground")}>
                        {item.label}
                        {isAuto && <span className="ml-1 text-[0.65rem] uppercase text-muted-foreground">(automático)</span>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {evaluation.warning && (
              <Alert variant="warning">
                <AlertTriangle />
                <AlertDescription className="text-xs">{evaluation.warning}</AlertDescription>
              </Alert>
            )}

            <fieldset className="grid gap-1.5">
              <legend className="mb-1 text-sm font-medium">Porque estás a entrar?</legend>
              <div className="grid grid-cols-2 gap-1.5">
                {ENTRY_REASONS.map((r) => (
                  <label key={r.key} className={cn("flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-xs", reason === r.key && (r.risky ? "border-danger bg-danger/10" : "border-primary bg-primary/10"))}>
                    <input type="radio" name="reason" className="accent-[var(--primary)]" checked={reason === r.key} onChange={() => setReason(r.key)} />
                    {r.label}
                  </label>
                ))}
              </div>
              {meta?.nudge && (
                <Alert variant="destructive">
                  <AlertDescription className="text-xs">{meta.nudge}</AlertDescription>
                </Alert>
              )}
              {reason === "OTHER" && <Textarea rows={2} placeholder="Descreve a razão…" value={reasonNote} onChange={(e) => setReasonNote(e.target.value)} />}
            </fieldset>

            <div className="grid gap-1.5">
              <label htmlFor="tk-thesis" className="text-sm font-medium">Tese (opcional)</label>
              <Textarea id="tk-thesis" rows={2} value={thesis} onChange={(e) => setThesis(e.target.value)} placeholder="Porque considero este trade? O que o invalida?" />
            </div>
          </div>
        )}

        <Button onClick={submit} disabled={disabled || pending || contracts < 1 || entry <= 0 || marginShort}>
          {pending && <Loader2 className="animate-spin" />}
          {direction === "LONG" ? "Comprar" : "Vender"} {contracts} {symbol} (simulado)
        </Button>
        {marginShort && <p className="text-xs text-danger">Margem livre insuficiente ({formatUsd(freeMargin)}) para este tamanho.</p>}
        <p className="text-xs text-muted-foreground">Custos ilustrativos: spread {costsFor(symbol).spreadPoints} pt, comissão {formatUsd(costsFor(symbol).commissionPerSide)}/lado. Simulação educativa — sem dinheiro real.</p>
      </CardContent>
    </Card>
  );
}
