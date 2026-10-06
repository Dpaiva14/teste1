import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { DemoBadge } from "@/components/brand/demo-badge";
import { SimulatorHome } from "@/features/simulator/components/simulator-home";
import { listAccounts } from "@/features/simulator/server/simulator-service";
import { requireUserPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Simulador" };

export default async function SimulatorPage() {
  const user = await requireUserPage("/simulator");
  const accounts = await listAccounts(user);
  return (
    <div className="grid gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Trading Simulator</h1>
          <DemoBadge />
        </div>
        <p className="mt-1 max-w-3xl text-muted-foreground">Conta virtual com saldo, equity, margem, P&L e drawdown. Os preços são sintéticos (DEMO), a margem e os custos são ilustrativos. Aqui treinas processo — não há dinheiro real em jogo.</p>
      </header>
      <SimulatorHome accounts={accounts} />
      <Disclaimer withFutures />
    </div>
  );
}
