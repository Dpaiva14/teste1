import "server-only";
import type { Trade } from "@/database/client";
import type { TradeDTO } from "@/features/simulator/types";
import { readChecklist } from "./execution";

export function toTradeDTO(t: Trade & { journalEntry?: { id: string } | null }): TradeDTO {
  const cl = readChecklist(t.checklist);
  return {
    id: t.id,
    symbol: t.symbol,
    direction: t.direction,
    contracts: t.contracts,
    entryPrice: t.entryPrice,
    stopLoss: t.stopLoss,
    takeProfit: t.takeProfit,
    exitPrice: t.exitPrice,
    status: t.status,
    exitReason: t.exitReason,
    openedAt: t.openedAt.toISOString(),
    closedAt: t.closedAt?.toISOString() ?? null,
    pnl: t.pnl,
    fees: t.fees,
    rMultiple: t.rMultiple,
    riskAmount: t.riskAmount,
    entryReason: t.entryReason,
    checklistPercent: cl.percent ?? null,
    rewardRisk: cl.rewardRisk ?? null,
    thesis: t.thesis,
    journaled: Boolean(t.journalEntry),
    openBarIndex: t.openBarIndex,
  };
}
