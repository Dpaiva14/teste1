import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { DemoBadge } from "@/components/brand/demo-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BacktestHome } from "@/features/backtest/components/backtest-home";
import { listBacktests } from "@/features/backtest/server/backtest-service";
import { requireUserPage } from "@/lib/auth/session";
import { BACKTEST_NOTICE } from "@/modules/strategies";

export const metadata: Metadata = { title: "Backtesting Lab" };

export default async function BacktestPage() {
  const user = await requireUserPage("/backtest");
  const items = await listBacktests(user);
  return (
    <div className="grid gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Backtesting Lab</h1>
          <DemoBadge />
        </div>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Treina a decisão barra a barra: BUY, SELL ou WAIT. O tamanho vem do teu risco, os fills usam o mesmo motor do simulador e o relatório compara o teu processo com o resultado.
        </p>
      </header>
      <Alert variant="info">
        <AlertDescription>{BACKTEST_NOTICE}</AlertDescription>
      </Alert>
      <BacktestHome items={items} />
      <Disclaimer withFutures />
    </div>
  );
}
