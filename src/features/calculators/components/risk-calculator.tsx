"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { formatR, formatUsd } from "@/lib/money";
import { parseNumber } from "@/lib/parse-number";
import { getInstrument, pointValueUsd } from "@/modules/instruments";
import { positionSize, rewardRisk } from "../logic/risk";
import { DirectionToggle, NumberField, SymbolSelectNative } from "./number-field";

const MIN_PLAUSIBLE_PRICE = 1000;

function priceError(text: string, label: string): string | undefined {
  const n = parseNumber(text);
  if (n === null) return text.trim() === "" ? undefined : "Número inválido";
  if (n < MIN_PLAUSIBLE_PRICE) return `${label} ${n} é implausível para o Dow. Usa por ex. 39000 (ponto = separador decimal).`;
  return undefined;
}

/** Full risk calculator (spec §21): balance, risk %, entry, stop, target, tick value, contract, commission. */
export function RiskCalculator({ initial }: { initial?: Partial<{ symbol: string; balance: string; risk: string; entry: string; stop: string; target: string }> }) {
  const [symbol, setSymbol] = useState(initial?.symbol ?? "MYM");
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [balance, setBalance] = useState(initial?.balance ?? "10000");
  const [riskPct, setRiskPct] = useState(initial?.risk ?? "1");
  const [entry, setEntry] = useState(initial?.entry ?? "39000");
  const [stop, setStop] = useState(initial?.stop ?? "38950");
  const [target, setTarget] = useState(initial?.target ?? "39100");
  const [commission, setCommission] = useState("0");
  const [slippage, setSlippage] = useState("0");
  const [tickValueText, setTickValueText] = useState<string | null>(null); // null = use the instrument default
  const [customTickSize, setCustomTickSize] = useState("1");

  const isCustom = symbol === "CUSTOM";
  const baseSymbol = isCustom ? "US30" : symbol;
  const instrument = getInstrument(baseSymbol)!;
  const defaultTickSize = isCustom ? (parseNumber(customTickSize) ?? 1) : instrument.tickSize;
  const defaultTickValue = isCustom ? 0 : (instrument.pointValue ?? pointValueUsd(baseSymbol)) * instrument.tickSize;
  const tickValue = tickValueText === null ? defaultTickValue : parseNumber(tickValueText);
  const pointValueOverride = tickValue && defaultTickSize > 0 ? tickValue / defaultTickSize : undefined;
  const customised = !isCustom && tickValueText !== null && tickValue !== defaultTickValue;

  const calc = useMemo(() => {
    const b = parseNumber(balance);
    const rp = parseNumber(riskPct);
    const e = parseNumber(entry);
    const s = parseNumber(stop);
    const t = parseNumber(target);
    const c = parseNumber(commission) ?? 0;
    const sl = parseNumber(slippage) ?? 0;
    if (b === null || rp === null || e === null || s === null) return null;
    const ps = positionSize({
      balance: b, riskPercent: rp, symbol: baseSymbol, direction, entry: e, stop: s, target: t,
      commissionRoundTurn: c, slippagePoints: sl, pointValueOverride,
    });
    const rr = t !== null ? rewardRisk({ direction, entry: e, stop: s, target: t }) : null;
    return { ps, rr, balance: b };
  }, [balance, riskPct, entry, stop, target, commission, slippage, baseSymbol, direction, pointValueOverride]);

  const lossR = -1;
  const winR = calc?.rr?.ratio ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros</CardTitle>
          <CardDescription>Todos os cálculos são feitos no teu browser. Nada é enviado nem guardado.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SymbolSelectNative
              id="rc-symbol"
              label="Contrato"
              value={symbol}
              includeCustom
              onChange={(v) => {
                setSymbol(v);
                setTickValueText(v === "CUSTOM" ? "" : null);
              }}
            />
            <DirectionToggle value={direction} onChange={setDirection} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField id="rc-balance" label="Saldo da conta" value={balance} onChange={setBalance} prefix="$" />
            <NumberField id="rc-risk" label="Risco por trade" value={riskPct} onChange={setRiskPct} suffix="%" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField id="rc-entry" label="Entrada" value={entry} onChange={setEntry} error={priceError(entry, "Entrada")} />
            <NumberField id="rc-stop" label="Stop Loss" value={stop} onChange={setStop} error={priceError(stop, "Stop")} />
            <NumberField id="rc-target" label="Target (opcional)" value={target} onChange={setTarget} error={priceError(target, "Target")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {isCustom && <NumberField id="rc-ticksize" label="Tick size" value={customTickSize} onChange={setCustomTickSize} suffix="pts" />}
            <NumberField
              id="rc-tickvalue"
              label="Tick value"
              value={tickValueText ?? String(defaultTickValue)}
              onChange={setTickValueText}
              prefix="$"
              hint={customised ? "Valor editado — confirma com o teu contrato." : isCustom ? "Valor de 1 tick por contrato/lote." : "Valor padrão do instrumento."}
            />
            <NumberField id="rc-commission" label="Comissão (round turn / contrato)" value={commission} onChange={setCommission} prefix="$" />
            <NumberField id="rc-slip" label="Slippage assumido no stop" value={slippage} onChange={setSlippage} suffix="pts" hint="Torna o cálculo mais conservador" />
          </div>
        </CardContent>
      </Card>

      <div className="grid content-start gap-4">
        {calc ? (
          <>
            {calc.ps.errors.length > 0 && (
              <Alert variant="destructive">
                <ShieldAlert />
                <AlertDescription>
                  <ul className="list-disc pl-4">{calc.ps.errors.map((e) => <li key={e}>{e}</li>)}</ul>
                </AlertDescription>
              </Alert>
            )}

            <Alert variant="info">
              <Info />
              <AlertDescription>
                <p className="font-medium">Risco financeiro desta posição</p>
                <p className="mt-1">{calc.ps.explanation}</p>
              </AlertDescription>
            </Alert>

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Risco (orçamento)" value={formatUsd(calc.ps.riskBudget)} hint={`${riskPct || 0}% de ${formatUsd(calc.balance)}`} />
              <Stat label="Contratos" value={calc.ps.contracts} tone={calc.ps.contracts === 0 ? "warning" : "primary"} hint={calc.ps.contractsRaw > 0 ? `Cálculo bruto ${calc.ps.contractsRaw.toFixed(2)} → arredondado para baixo` : undefined} />
              <Stat label="Perda potencial" value={formatUsd(calc.ps.potentialLoss)} tone="danger" hint={`${calc.ps.actualRiskPercent}% da conta`} />
              <Stat label="Lucro potencial" value={calc.ps.potentialProfit !== null ? formatUsd(calc.ps.potentialProfit) : "—"} tone="success" />
              <Stat label="R:R" value={calc.ps.rewardRisk !== null ? `${calc.ps.rewardRisk}:1` : "—"} hint={calc.rr?.breakEvenWinRate ? `Equilíbrio com ${calc.rr.breakEvenWinRate}% de acerto*` : undefined} />
              <Stat label="R-Multiple" value={winR !== null ? `${formatR(winR)} / ${formatR(lossR)}` : "—"} hint="no alvo / no stop" />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Distância ao stop" value={`${calc.ps.stopPoints} pts`} hint={`${calc.ps.stopTicks} ticks`} />
              <Stat label="Risco por contrato" value={formatUsd(calc.ps.riskPerContract)} />
              <Stat label="Valor nocional" value={formatUsd(calc.ps.notional)} hint="Exposição real da posição" />
            </div>

            {calc.ps.warnings.length > 0 && (
              <Alert variant="warning">
                <AlertTriangle />
                <AlertDescription>
                  <ul className="list-disc space-y-1 pl-4">{calc.ps.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
                </AlertDescription>
              </Alert>
            )}
            <p className="text-xs text-muted-foreground">
              * Taxa de acerto necessária para equilibrar, ignorando custos. Ferramenta educativa: não é uma recomendação de tamanho de posição nem de operação. Os resultados reais podem diferir por slippage, gaps e custos.
            </p>
          </>
        ) : (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">Preenche saldo, risco, entrada e stop com números válidos.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
