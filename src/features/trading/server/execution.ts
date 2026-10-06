import "server-only";
import type { Prisma } from "@/database/client";
import { rewardRisk } from "@/features/calculators/logic/risk";
import { badRequest } from "@/lib/errors";
import { roundTo } from "@/lib/money";
import { autoChecks, evaluateChecklist, type ChecklistAnswers } from "../logic/checklist";
import { entryFill, marginRequired, riskAtEntry } from "../logic/engine";
import type { OpenTradeInput } from "../schemas";

export interface BuiltTrade {
  data: Omit<Prisma.TradeUncheckedCreateInput, "userId" | "source" | "simulationAccountId" | "replaySessionId">;
  warnings: string[];
  margin: number;
}

/**
 * Validates an order ticket and builds the Trade row. The entry fill, risk, R:R and the auto-verifiable checklist
 * items are computed HERE from the real numbers — never trusted from the client.
 * Missing stop/target/checklist items produce warnings (educational), not rejections.
 */
export function buildOpenTrade(input: OpenTradeInput, ctx: { bid: number; balance: number; barIndex: number; context?: Record<string, unknown> }): BuiltTrade {
  const entry = entryFill(input.symbol, input.direction, ctx.bid);
  const long = input.direction === "LONG";
  if (input.stop !== null && (long ? input.stop >= entry : input.stop <= entry)) {
    throw badRequest(long ? `Numa compra o stop (${input.stop}) tem de ficar abaixo da entrada (${entry}).` : `Numa venda o stop (${input.stop}) tem de ficar acima da entrada (${entry}).`);
  }
  if (input.target !== null && (long ? input.target <= entry : input.target >= entry)) {
    throw badRequest(long ? `Numa compra o alvo (${input.target}) tem de ficar acima da entrada (${entry}).` : `Numa venda o alvo (${input.target}) tem de ficar abaixo da entrada (${entry}).`);
  }

  const riskAmount = input.stop !== null ? riskAtEntry(input.symbol, input.contracts, entry, input.stop) : null;
  const rr = input.stop !== null && input.target !== null ? rewardRisk({ direction: input.direction, entry, stop: input.stop, target: input.target }).ratio : null;
  const riskPercent = riskAmount !== null && ctx.balance > 0 ? roundTo((riskAmount / ctx.balance) * 100, 2) : null;

  const auto = autoChecks({ stop: input.stop, contracts: input.contracts, rewardRisk: rr });
  const answers: ChecklistAnswers = { ...input.checklist, ...auto };
  const evaluation = evaluateChecklist(answers);

  const warnings: string[] = [];
  if (input.stop === null) warnings.push("Sem stop loss: o risco desta posição não está limitado.");
  if (input.target === null) warnings.push("Sem alvo definido: não existe R:R planeado.");
  if (rr !== null && rr < 1.5) warnings.push(`R:R planeado de ${rr}:1, abaixo de 1,5.`);
  if (riskPercent !== null && riskPercent > 2) warnings.push(`Risco de ${riskPercent}% da conta, acima de 2%.`);
  if (evaluation.warning) warnings.push(evaluation.warning);

  return {
    margin: marginRequired(input.symbol, input.contracts),
    warnings,
    data: {
      symbol: input.symbol,
      direction: input.direction,
      contracts: input.contracts,
      entryPrice: entry,
      stopLoss: input.stop,
      takeProfit: input.target,
      status: "OPEN",
      openBarIndex: ctx.barIndex,
      riskAmount,
      marginUsed: marginRequired(input.symbol, input.contracts),
      entryReason: input.entryReason,
      entryReasonNote: input.entryReasonNote ?? null,
      confluenceScore: input.confluenceScore ?? null,
      thesis: input.thesis ?? null,
      checklist: {
        answers,
        percent: evaluation.percent,
        rewardRisk: rr,
        riskPercent,
        ...(ctx.context ?? {}),
      } as Prisma.InputJsonValue,
    },
  };
}

export interface StoredChecklist {
  answers?: ChecklistAnswers;
  percent?: number;
  rewardRisk?: number | null;
  riskPercent?: number | null;
  prepared?: boolean;
  drawings?: number;
}

export function readChecklist(json: unknown): StoredChecklist {
  return json && typeof json === "object" ? (json as StoredChecklist) : {};
}
