"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { formatPrice, formatUsd } from "@/lib/money";
import { parseNumber } from "@/lib/parse-number";
import { pointValueUsd } from "@/modules/instruments";
import { tradePnlUsd } from "../logic/risk";
import { DirectionToggle, NumberField, SymbolSelectNative } from "./number-field";

/** Mini calculator for lessons: points ↔ dollars for YM / MYM / US30 demo. */
export function TickValueCalculator() {
  const [symbol, setSymbol] = useState("YM");
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [contracts, setContracts] = useState("1");
  const [entry, setEntry] = useState("39000");
  const [points, setPoints] = useState("40");

  const r = useMemo(() => {
    const e = parseNumber(entry);
    const p = parseNumber(points);
    const c = parseNumber(contracts);
    if (e === null || p === null || c === null || c <= 0 || !Number.isInteger(c)) return null;
    const exit = direction === "LONG" ? e + p : e - p;
    return { exit, ...tradePnlUsd({ symbol, direction, entry: e, exit, contracts: c }), c, p };
  }, [symbol, direction, contracts, entry, points]);

  const pv = pointValueUsd(symbol);
  return (
    <Card className="@container">
      <CardContent className="grid gap-4 p-5">
        <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-5">
          <SymbolSelectNative id="tv-symbol" value={symbol} onChange={setSymbol} />
          <DirectionToggle value={direction} onChange={setDirection} />
          <NumberField id="tv-contracts" label="Contratos" value={contracts} onChange={setContracts} error={contracts && (parseNumber(contracts) ?? 0) < 1 ? "Mínimo 1 (inteiro)" : undefined} />
          <NumberField id="tv-entry" label="Entrada" value={entry} onChange={setEntry} />
          <NumberField id="tv-points" label="Pontos a favor" value={points} onChange={setPoints} hint="Use negativo para movimento adverso" suffix="pts" />
        </div>
        {r ? (
          <div className="grid gap-3 @md:grid-cols-2 @3xl:grid-cols-4">
            <Stat label="Valor por ponto" value={formatUsd(pv)} hint={symbol === "US30" ? "Demo (varia por broker)" : "Padrão CME"} />
            <Stat label="Saída" value={formatPrice(r.exit, symbol === "US30" ? 1 : 0)} />
            <Stat label="Pontos × valor × contratos" value={`${r.p} × ${formatUsd(pv)} × ${r.c}`} />
            <Stat label="Resultado" value={formatUsd(r.net)} tone={r.net >= 0 ? "success" : "danger"} hint="Antes de comissões" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Preenche os campos com números válidos.</p>
        )}
      </CardContent>
    </Card>
  );
}
