"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumberField, SymbolSelectNative } from "@/features/calculators/components/number-field";
import { useApiAction } from "@/hooks/use-api-action";
import { api } from "@/lib/api-client";
import { formatUsd } from "@/lib/money";
import { parseNumber } from "@/lib/parse-number";
import { STRATEGIES } from "@/modules/strategies";
import { BACKTEST_TIMEFRAMES, type CreateBacktestInput } from "../schemas";
import type { BacktestListItemDTO } from "../types";

export function BacktestHome({ items }: { items: BacktestListItemDTO[] }) {
  const router = useRouter();
  const [name, setName] = useState("Backtest");
  const [symbol, setSymbol] = useState("MYM");
  const [timeframe, setTimeframe] = useState("M15");
  const [strategyKey, setStrategyKey] = useState(STRATEGIES[0]!.key);
  const [risk, setRisk] = useState("1");
  const [balance, setBalance] = useState("10000");
  const strategy = STRATEGIES.find((s) => s.key === strategyKey)!;
  const action = useApiAction((input: Partial<CreateBacktestInput>) => api<{ id: string }>("/api/backtests", { method: "POST", body: input }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <section className="grid content-start gap-3">
        <h2 className="text-lg font-semibold">Os teus backtests</h2>
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">Ainda não tens backtests. Escolhe uma estratégia ao lado e decide barra a barra: BUY, SELL ou WAIT.</CardContent>
          </Card>
        ) : (
          items.map((b) => (
            <Link key={b.id} href={`/backtest/${b.id}`} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50">
              <div className="min-w-0">
                <p className="truncate font-medium">{b.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <Badge variant="outline">{b.symbol}</Badge>
                  <Badge variant="outline">{b.timeframe}</Badge>
                  <span>{b.strategyName}</span>
                  <span>· {b.decisions} decisões</span>
                  <Badge variant={b.status === "COMPLETED" ? "secondary" : "default"}>{b.status === "COMPLETED" ? "terminado" : "em curso"}</Badge>
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold tabular">{formatUsd(b.balance)}</p>
                <p className={`text-xs tabular ${b.balance >= b.initialBalance ? "text-success" : "text-danger"}`}>
                  {b.balance >= b.initialBalance ? "+" : ""}
                  {formatUsd(b.balance - b.initialBalance)}
                </p>
              </div>
            </Link>
          ))
        )}
      </section>

      <Card className="self-start">
        <CardHeader>
          <CardTitle>Novo backtest</CardTitle>
          <CardDescription>Dados sintéticos DEMO, decididos barra a barra, sem ver o futuro.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {action.error && (
            <Alert variant="destructive">
              <AlertDescription>{action.error}</AlertDescription>
            </Alert>
          )}
          <Field label="Nome" htmlFor="bt-name" error={action.fieldErrors.name?.[0]}>
            <Input id="bt-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Estratégia" htmlFor="bt-strategy">
            <select id="bt-strategy" value={strategyKey} onChange={(e) => setStrategyKey(e.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
              {STRATEGIES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            <p className="text-foreground">{strategy.summary}</p>
            <p className="mt-2 font-medium text-foreground">Evita quando:</p>
            <ul className="list-disc pl-4">
              {strategy.avoidWhen.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SymbolSelectNative id="bt-symbol" value={symbol} onChange={setSymbol} />
            <Field label="Timeframe" htmlFor="bt-tf">
              <select id="bt-tf" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
                {BACKTEST_TIMEFRAMES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField id="bt-risk" label="Risco por trade" value={risk} onChange={setRisk} suffix="%" hint="0,1% a 5%" error={action.fieldErrors.riskPercent?.[0]} />
            <NumberField id="bt-balance" label="Saldo inicial" value={balance} onChange={setBalance} prefix="$" error={action.fieldErrors.initialBalance?.[0]} />
          </div>
          <Button
            disabled={action.pending}
            onClick={async () => {
              const riskPercent = parseNumber(risk);
              const initialBalance = parseNumber(balance);
              if (riskPercent === null || initialBalance === null) return;
              const res = await action.run({ name: name.trim() || "Backtest", symbol: symbol as CreateBacktestInput["symbol"], timeframe: timeframe as CreateBacktestInput["timeframe"], strategyKey, riskPercent, initialBalance });
              if (res) {
                router.push(`/backtest/${res.id}`);
                router.refresh();
              }
            }}
          >
            {action.pending ? <Loader2 className="animate-spin" /> : <Plus />} Criar backtest
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
