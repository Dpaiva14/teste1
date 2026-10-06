"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { parseNumber } from "@/lib/parse-number";
import { expectancyR, rewardRisk } from "../logic/risk";
import { DirectionToggle, NumberField } from "./number-field";

/** Reward:risk with the win rate it requires — plus hypothetical expectancy rows (clearly NOT predictions). */
export function RewardRiskCalculator() {
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG");
  const [entry, setEntry] = useState("39000");
  const [stop, setStop] = useState("38950");
  const [target, setTarget] = useState("39100");

  const r = useMemo(() => {
    const e = parseNumber(entry);
    const s = parseNumber(stop);
    const t = parseNumber(target);
    if (e === null || s === null || t === null) return null;
    return rewardRisk({ direction, entry: e, stop: s, target: t });
  }, [direction, entry, stop, target]);

  return (
    <Card className="@container">
      <CardContent className="grid gap-4 p-5">
        <div className="grid gap-4 @md:grid-cols-2 @3xl:grid-cols-4">
          <DirectionToggle value={direction} onChange={setDirection} />
          <NumberField id="rr-entry" label="Entrada" value={entry} onChange={setEntry} />
          <NumberField id="rr-stop" label="Stop Loss" value={stop} onChange={setStop} />
          <NumberField id="rr-target" label="Take Profit" value={target} onChange={setTarget} />
        </div>
        {r === null ? (
          <p className="text-sm text-muted-foreground">Preenche os campos com números válidos.</p>
        ) : !r.valid ? (
          <p className="text-sm text-danger">Geometria inválida: numa compra o stop fica abaixo e o alvo acima da entrada (e vice-versa numa venda).</p>
        ) : (
          <>
            <div className="grid gap-3 @md:grid-cols-2 @3xl:grid-cols-4">
              <Stat label="Risco" value={`${r.riskPoints} pts`} tone="danger" />
              <Stat label="Retorno" value={`${r.rewardPoints} pts`} tone="success" />
              <Stat label="R:R" value={`${r.ratio}:1`} tone="primary" />
              <Stat label="Acerto mínimo p/ empatar" value={`${r.breakEvenWinRate}%`} hint="ignora custos" />
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <caption className="p-2 text-left text-xs text-muted-foreground">Expectativa (em R) para taxas de acerto HIPOTÉTICAS — ilustra a matemática, não prevê resultados.</caption>
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left">Taxa de acerto</th>
                    {[30, 40, 50, 60].map((w) => (
                      <th key={w} className="p-2 text-right">{w}%</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-2">Expectativa por trade</td>
                    {[30, 40, 50, 60].map((w) => {
                      const ev = expectancyR(w / 100, r.ratio ?? 0, 1);
                      return (
                        <td key={w} className={`p-2 text-right tabular ${ev > 0 ? "text-success" : ev < 0 ? "text-danger" : ""}`}>
                          {ev > 0 ? "+" : ""}
                          {ev.toFixed(2)}R
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
