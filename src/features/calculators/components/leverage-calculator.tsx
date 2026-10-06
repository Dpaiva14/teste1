"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { formatUsd } from "@/lib/money";
import { parseNumber } from "@/lib/parse-number";
import { DEMO_MARGIN, pointValueUsd } from "@/modules/instruments";
import { leverageInfo, onePercentMoveImpact } from "../logic/risk";
import { NumberField, SymbolSelectNative } from "./number-field";

export function LeverageCalculator() {
  const [symbol, setSymbol] = useState("YM");
  const [price, setPrice] = useState("39000");
  const [contracts, setContracts] = useState("1");
  const [margin, setMargin] = useState(String(DEMO_MARGIN.YM));
  const [balance, setBalance] = useState("10000");

  const r = useMemo(() => {
    const p = parseNumber(price);
    const c = parseNumber(contracts);
    const m = parseNumber(margin);
    const b = parseNumber(balance);
    if (!p || !c || !m || !b || c <= 0) return null;
    const notional = p * pointValueUsd(symbol) * c;
    const effective = notional / b;
    const lev = leverageInfo(notional, m * c);
    const move = onePercentMoveImpact(symbol, p, c);
    return { notional, effective, lev, move, pctOfAccount: (move.usd / b) * 100, marginTotal: m * c };
  }, [symbol, price, contracts, margin, balance]);

  return (
    <Card className="@container">
      <CardContent className="grid gap-4 p-5">
        <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-5">
          <SymbolSelectNative
            id="lv-symbol"
            value={symbol}
            onChange={(v) => {
              setSymbol(v);
              setMargin(String(DEMO_MARGIN[v] ?? 0));
            }}
          />
          <NumberField id="lv-price" label="Preço do índice" value={price} onChange={setPrice} />
          <NumberField id="lv-contracts" label="Contratos" value={contracts} onChange={setContracts} />
          <NumberField id="lv-margin" label="Margem por contrato" value={margin} onChange={setMargin} prefix="$" hint="ILUSTRATIVA — consulta CME/broker" />
          <NumberField id="lv-balance" label="Saldo da conta" value={balance} onChange={setBalance} prefix="$" />
        </div>
        {r ? (
          <>
            <div className="grid gap-3 @md:grid-cols-2 @3xl:grid-cols-4">
              <Stat label="Valor nocional" value={formatUsd(r.notional)} />
              <Stat label="Margem total (ilustrativa)" value={formatUsd(r.marginTotal)} />
              <Stat label="Alavancagem nocional ÷ margem" value={r.lev.leverage ? `${r.lev.leverage}×` : "—"} tone="warning" />
              <Stat label="Alavancagem efetiva (nocional ÷ saldo)" value={`${r.effective.toFixed(2)}×`} tone={r.effective > 10 ? "danger" : r.effective > 3 ? "warning" : "default"} />
            </div>
            <p className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
              Um movimento de <strong>1%</strong> ({r.move.points} pontos) contra a posição custa <strong>{formatUsd(r.move.usd)}</strong>, ou seja{" "}
              <strong>{r.pctOfAccount.toFixed(1)}%</strong> do saldo.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Preenche os campos com números válidos.</p>
        )}
      </CardContent>
    </Card>
  );
}
