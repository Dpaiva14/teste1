"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { formatUsd } from "@/lib/money";
import { parseNumber } from "@/lib/parse-number";
import { pointValueUsd } from "@/modules/instruments";
import { tradingCosts } from "../logic/risk";
import { NumberField, SymbolSelectNative } from "./number-field";

export function CostsCalculator() {
  const [symbol, setSymbol] = useState("YM");
  const [contracts, setContracts] = useState("2");
  const [spread, setSpread] = useState("1");
  const [commission, setCommission] = useState("5");
  const [slippage, setSlippage] = useState("1");
  const [stop, setStop] = useState("30");

  const r = useMemo(() => {
    const c = parseNumber(contracts);
    const s = parseNumber(spread);
    const cm = parseNumber(commission);
    const sl = parseNumber(slippage);
    const st = parseNumber(stop);
    if (c === null || s === null || cm === null || sl === null || c <= 0) return null;
    const costs = tradingCosts({ symbol, contracts: c, spreadPoints: s, commissionRoundTurn: cm, slippagePoints: sl });
    const riskUsd = st ? st * pointValueUsd(symbol) * c : null;
    return { costs, riskUsd, share: riskUsd ? (costs.total / riskUsd) * 100 : null, breakEvenPoints: costs.total / (pointValueUsd(symbol) * c) };
  }, [symbol, contracts, spread, commission, slippage, stop]);

  return (
    <Card className="@container">
      <CardContent className="grid gap-4 p-5">
        <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-6">
          <SymbolSelectNative id="co-symbol" value={symbol} onChange={setSymbol} />
          <NumberField id="co-contracts" label="Contratos" value={contracts} onChange={setContracts} />
          <NumberField id="co-spread" label="Spread" value={spread} onChange={setSpread} suffix="pts" />
          <NumberField id="co-comm" label="Comissão round turn / contrato" value={commission} onChange={setCommission} prefix="$" hint="Ilustrativo" />
          <NumberField id="co-slip" label="Slippage esperado" value={slippage} onChange={setSlippage} suffix="pts" />
          <NumberField id="co-stop" label="Distância ao stop" value={stop} onChange={setStop} suffix="pts" />
        </div>
        {r ? (
          <div className="grid gap-3 @md:grid-cols-2 @3xl:grid-cols-5">
            <Stat label="Spread" value={formatUsd(r.costs.spread)} />
            <Stat label="Comissões" value={formatUsd(r.costs.commission)} />
            <Stat label="Slippage" value={formatUsd(r.costs.slippage)} />
            <Stat label="Custo total" value={formatUsd(r.costs.total)} tone="warning" hint={`≈ ${r.breakEvenPoints.toFixed(1)} pontos para empatar`} />
            <Stat label="% do risco do trade" value={r.share !== null ? `${r.share.toFixed(1)}%` : "—"} tone={r.share !== null && r.share > 15 ? "danger" : "default"} hint={r.riskUsd ? `Risco ${formatUsd(r.riskUsd)}` : undefined} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Preenche os campos com números válidos.</p>
        )}
      </CardContent>
    </Card>
  );
}
