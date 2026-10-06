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
import { SymbolSelectNative } from "@/features/calculators/components/number-field";
import { useApiAction } from "@/hooks/use-api-action";
import { api } from "@/lib/api-client";
import { REPLAY_TIMEFRAMES, type CreateReplayInput } from "../schemas";
import type { ReplayListItemDTO } from "../types";

export function ReplayHome({ items }: { items: ReplayListItemDTO[] }) {
  const router = useRouter();
  const [symbol, setSymbol] = useState("MYM");
  const [timeframe, setTimeframe] = useState("M5");
  const action = useApiAction((input: CreateReplayInput) => api<{ id: string }>("/api/replay", { method: "POST", body: input }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section className="grid content-start gap-3">
        <h2 className="text-lg font-semibold">As tuas sessões</h2>
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">Ainda não tens sessões. Cria a primeira: vais ver o mercado barra a barra, marcar o teu plano no gráfico e só depois operar.</CardContent>
          </Card>
        ) : (
          items.map((r) => (
            <Link key={r.id} href={`/labs/replay/${r.id}`} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 font-medium">
                  {r.symbol} <Badge variant="outline">{r.timeframe}</Badge>
                  <Badge variant={r.status === "COMPLETED" ? "secondary" : "default"}>{r.status === "COMPLETED" ? "terminada" : "em curso"}</Badge>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Série sintética iniciada em {new Date(r.startDate).toLocaleDateString("pt-PT")} · {r.trades} trade(s)
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("pt-PT")}</span>
            </Link>
          ))
        )}
      </section>

      <Card className="self-start">
        <CardHeader>
          <CardTitle>Nova sessão de replay</CardTitle>
          <CardDescription>Série DEMO diferente de cada vez. Saldo virtual de $10.000.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {action.error && (
            <Alert variant="destructive">
              <AlertDescription>{action.error}</AlertDescription>
            </Alert>
          )}
          <SymbolSelectNative id="rp-symbol" value={symbol} onChange={setSymbol} />
          <Field label="Timeframe" htmlFor="rp-tf">
            <select id="rp-tf" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
              {REPLAY_TIMEFRAMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Button
            disabled={action.pending}
            onClick={async () => {
              const res = await action.run({ symbol: symbol as CreateReplayInput["symbol"], timeframe: timeframe as CreateReplayInput["timeframe"] });
              if (res) {
                router.push(`/labs/replay/${res.id}`);
                router.refresh();
              }
            }}
          >
            {action.pending ? <Loader2 className="animate-spin" /> : <Plus />} Iniciar replay
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
