import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { BacktestWorkspace } from "@/features/backtest/components/backtest-workspace";
import { getBacktestState } from "@/features/backtest/server/backtest-service";
import { requireUserPage } from "@/lib/auth/session";
import { orNotFound } from "@/lib/page-helpers";

export const metadata: Metadata = { title: "Backtest" };

export default async function BacktestRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUserPage(`/backtest/${id}`);
  const state = await orNotFound(getBacktestState(user, id));
  return (
    <div className="grid gap-6">
      <BacktestWorkspace initial={state} />
      <Disclaimer withFutures />
    </div>
  );
}
