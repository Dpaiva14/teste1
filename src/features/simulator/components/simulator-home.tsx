"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NumberField } from "@/features/calculators/components/number-field";
import { useApiAction } from "@/hooks/use-api-action";
import { api } from "@/lib/api-client";
import { formatUsd } from "@/lib/money";
import { parseNumber } from "@/lib/parse-number";
import type { AccountSummaryDTO } from "../types";

export function SimulatorHome({ accounts }: { accounts: AccountSummaryDTO[] }) {
  const router = useRouter();
  const [name, setName] = useState("Conta demo");
  const [balance, setBalance] = useState("10000");
  const [tf, setTf] = useState("M5");
  const action = useApiAction((input: { name: string; initialBalance: number; timeframe: string }) => api<{ id: string }>("/api/simulator/accounts", { method: "POST", body: input }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section className="grid content-start gap-3">
        <h2 className="text-lg font-semibold">As tuas contas</h2>
        {accounts.length === 0 ? (
          <Card><CardContent className="p-5 text-sm text-muted-foreground">Ainda não tens contas de simulação. Cria a primeira ao lado — começa com $10.000 virtuais.</CardContent></Card>
        ) : (
          accounts.map((a) => (
            <Link key={a.id} href={`/simulator/${a.id}`} className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:border-primary/50">
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">Criada a {new Date(a.createdAt).toLocaleDateString("pt-PT")} · {a.openTrades} posição(ões) aberta(s)</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold tabular">{formatUsd(a.balance)}</p>
                <p className={`text-xs tabular ${a.balance >= a.initialBalance ? "text-success" : "text-danger"}`}>{a.balance >= a.initialBalance ? "+" : ""}{formatUsd(a.balance - a.initialBalance)}</p>
              </div>
            </Link>
          ))
        )}
      </section>
      <Card className="self-start">
        <CardHeader>
          <CardTitle>Nova conta de simulação</CardTitle>
          <CardDescription>YM, MYM e US30 (CFD demo) numa conta virtual. Sem dinheiro real.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {action.error && <Alert variant="destructive"><AlertDescription>{action.error}</AlertDescription></Alert>}
          <Field label="Nome" htmlFor="sim-name" error={action.fieldErrors.name?.[0]}>
            <Input id="sim-name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
          </Field>
          <NumberField id="sim-balance" label="Saldo inicial" value={balance} onChange={setBalance} prefix="$" hint="Entre $1.000 e $1.000.000" />
          <Field label="Timeframe do feed" htmlFor="sim-tf">
            <select id="sim-tf" value={tf} onChange={(e) => setTf(e.target.value)} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
              {["M1", "M5", "M15", "H1", "H4"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Button
            disabled={action.pending}
            onClick={async () => {
              const b = parseNumber(balance);
              if (b === null) return;
              const res = await action.run({ name: name.trim() || "Conta demo", initialBalance: b, timeframe: tf });
              if (res) {
                router.push(`/simulator/${res.id}`);
                router.refresh();
              }
            }}
          >
            {action.pending ? <Loader2 className="animate-spin" /> : <Plus />} Criar conta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
