"use client";

import { AlertTriangle, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUsd } from "@/lib/money";
import { parseNumber } from "@/lib/parse-number";
import { DEMO_MARGIN } from "@/modules/instruments";
import { positionSize } from "../logic/risk";
import { DirectionToggle, NumberField } from "./number-field";

const MIN_PLAUSIBLE_PRICE = 1000;

/** Spec §22 — YM and MYM side by side. Never shows a contract count without the dollar risk behind it. */
export function PositionSizeFutures() {
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [balance, setBalance] = useState("10000");
  const [riskPct, setRiskPct] = useState("1");
  const [entry, setEntry] = useState("39000");
  const [stopMode, setStopMode] = useState<"price" | "points">("points");
  const [stop, setStop] = useState("50");
  const [target, setTarget] = useState("");
  const [commission, setCommission] = useState("0");
  const [slippage, setSlippage] = useState("0");

  const rows = useMemo(() => {
    const b = parseNumber(balance);
    const rp = parseNumber(riskPct);
    const e = parseNumber(entry);
    const sRaw = parseNumber(stop);
    const t = parseNumber(target);
    if (b === null || rp === null || e === null || sRaw === null) return null;
    const stopPrice = stopMode === "points" ? (direction === "LONG" ? e - sRaw : e + sRaw) : sRaw;
    return (["YM", "MYM"] as const).map((symbol) => ({
      symbol,
      r: positionSize({
        balance: b, riskPercent: rp, symbol, direction, entry: e, stop: stopPrice, target: t,
        commissionRoundTurn: parseNumber(commission) ?? 0, slippagePoints: parseNumber(slippage) ?? 0,
      }),
    }));
  }, [balance, riskPct, entry, stop, stopMode, direction, target, commission, slippage]);

  const e = parseNumber(entry);
  const entryErr = e !== null && e < MIN_PLAUSIBLE_PRICE ? "Preço implausível para o Dow (usa ex. 39000)." : undefined;

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Dimensionar posição em YM e MYM</CardTitle>
          <CardDescription>Exemplo do enunciado: conta $10.000, risco 1% ($100), stop de 50 pontos.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField id="ps-balance" label="Saldo da conta" value={balance} onChange={setBalance} prefix="$" />
            <NumberField id="ps-risk" label="Risco por trade" value={riskPct} onChange={setRiskPct} suffix="%" />
            <NumberField id="ps-entry" label="Preço de entrada" value={entry} onChange={setEntry} error={entryErr} />
            <DirectionToggle value={direction} onChange={setDirection} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-1.5">
              <span className="text-sm font-medium leading-none">Stop definido em</span>
              <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1" role="radiogroup" aria-label="Modo do stop">
                {(["points", "price"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={stopMode === m}
                    onClick={() => {
                      setStopMode(m);
                      setStop(m === "points" ? "50" : String(direction === "LONG" ? 38950 : 39050));
                    }}
                    className={`rounded px-3 py-1 text-sm font-medium ${stopMode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                  >
                    {m === "points" ? "Pontos" : "Preço"}
                  </button>
                ))}
              </div>
            </div>
            <NumberField id="ps-stop" label={stopMode === "points" ? "Distância ao stop" : "Preço do stop"} value={stop} onChange={setStop} suffix={stopMode === "points" ? "pts" : undefined} />
            <NumberField id="ps-target" label="Target (opcional, preço)" value={target} onChange={setTarget} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField id="ps-comm" label="Comissão RT" value={commission} onChange={setCommission} prefix="$" />
              <NumberField id="ps-slip" label="Slippage" value={slippage} onChange={setSlippage} suffix="pts" />
            </div>
          </div>
        </CardContent>
      </Card>

      {rows ? (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(({ symbol, r }) => (
            <Card key={symbol} className={r.contracts === 0 && r.valid ? "border-warning/50" : undefined}>
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle>{symbol === "YM" ? "YM — E-mini Dow" : "MYM — Micro E-mini Dow"}</CardTitle>
                <Badge variant="secondary">{symbol === "YM" ? "$5 / ponto" : "$0,50 / ponto"}</Badge>
              </CardHeader>
              <CardContent className="grid gap-3">
                {!r.valid ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <ul className="list-disc pl-4">{r.errors.map((m) => <li key={m}>{m}</li>)}</ul>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Máximo de contratos</p>
                        <p className={`text-4xl font-semibold tabular ${r.contracts === 0 ? "text-warning" : "text-primary"}`}>{r.contracts}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Risco real se o stop for atingido</p>
                        <p className="text-2xl font-semibold tabular text-danger">{formatUsd(r.actualRisk)}</p>
                        <p className="text-xs text-muted-foreground">{r.actualRiskPercent}% da conta</p>
                      </div>
                    </div>
                    <Alert variant="info">
                      <Info />
                      <AlertDescription>{r.explanation}</AlertDescription>
                    </Alert>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <dt className="text-muted-foreground">Stop</dt>
                      <dd className="text-right tabular">{r.stopPoints} pts ({r.stopTicks} ticks)</dd>
                      <dt className="text-muted-foreground">Risco por contrato</dt>
                      <dd className="text-right tabular">{formatUsd(r.riskPerContract)}</dd>
                      <dt className="text-muted-foreground">Orçamento de risco</dt>
                      <dd className="text-right tabular">{formatUsd(r.riskBudget)}</dd>
                      <dt className="text-muted-foreground">Orçamento não usado</dt>
                      <dd className="text-right tabular">{formatUsd(r.unusedBudget)}</dd>
                      <dt className="text-muted-foreground">Nocional</dt>
                      <dd className="text-right tabular">{formatUsd(r.notional)}</dd>
                      <dt className="text-muted-foreground">Margem (ilustrativa)</dt>
                      <dd className="text-right tabular">{formatUsd(r.contracts * (DEMO_MARGIN[symbol] ?? 0))}</dd>
                      {r.rewardRisk !== null && (
                        <>
                          <dt className="text-muted-foreground">R:R</dt>
                          <dd className="text-right tabular">{r.rewardRisk}:1</dd>
                          <dt className="text-muted-foreground">Lucro potencial</dt>
                          <dd className="text-right tabular text-success">{formatUsd(r.potentialProfit ?? 0)}</dd>
                        </>
                      )}
                    </dl>
                    {r.warnings.length > 0 && (
                      <Alert variant="warning">
                        <AlertTriangle />
                        <AlertDescription>
                          <ul className="list-disc space-y-1 pl-4">{r.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">Preenche os campos com números válidos.</CardContent>
        </Card>
      )}
      <p className="text-xs text-muted-foreground">
        Margens mostradas são <strong>ilustrativas</strong> (não são valores do CME). Ferramenta educativa — não é uma recomendação. Verifica margem, comissões e especificações com o teu broker e o CME Group.
      </p>
    </div>
  );
}
