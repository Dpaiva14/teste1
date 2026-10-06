import { pointValueUsd, requireInstrument } from "@/modules/instruments";
import { roundMoney, roundTo } from "@/lib/money";

/**
 * Pure risk maths shared by the calculators, simulator, replay, backtest and journal.
 * All money in USD. `pointValueUsd(symbol)` = value of one index point for one contract/lot.
 */

export type Direction = "LONG" | "SHORT";

export function stopSideValid(direction: Direction, entry: number, stop: number): boolean {
  return direction === "LONG" ? stop < entry : stop > entry;
}

export function targetSideValid(direction: Direction, entry: number, target: number): boolean {
  return direction === "LONG" ? target > entry : target < entry;
}

export function pointsBetween(a: number, b: number): number {
  return Math.abs(a - b);
}

export function toTicks(points: number, symbol: string): number {
  return points / requireInstrument(symbol).tickSize;
}

/** Signed P&L in points for a trade (positive = profit). */
export function pnlPoints(direction: Direction, entry: number, exit: number): number {
  return direction === "LONG" ? exit - entry : entry - exit;
}

export interface PnlInput {
  symbol: string;
  direction: Direction;
  entry: number;
  exit: number;
  contracts: number;
  /** total commission/fees per contract for a full round turn (entry + exit) */
  commissionRoundTurn?: number;
}

export function tradePnlUsd(i: PnlInput): { gross: number; fees: number; net: number; points: number } {
  const points = pnlPoints(i.direction, i.entry, i.exit);
  const gross = points * pointValueUsd(i.symbol) * i.contracts;
  const fees = (i.commissionRoundTurn ?? 0) * i.contracts;
  return { points: roundTo(points, 4), gross: roundMoney(gross), fees: roundMoney(fees), net: roundMoney(gross - fees) };
}

export interface RiskPerContractInput {
  symbol: string;
  /** USD per index point for one contract/lot. Overrides the instrument default (e.g. a specific broker's CFD). */
  pointValueOverride?: number;
  entry: number;
  stop: number;
  commissionRoundTurn?: number;
  /** extra points assumed lost on a stop fill (slippage) — makes the estimate conservative */
  slippagePoints?: number;
}

export function riskPerContract(i: RiskPerContractInput) {
  const stopPoints = pointsBetween(i.entry, i.stop);
  const effectivePoints = stopPoints + (i.slippagePoints ?? 0);
  const pv = i.pointValueOverride ?? pointValueUsd(i.symbol);
  const market = effectivePoints * pv;
  const total = market + (i.commissionRoundTurn ?? 0);
  return {
    stopPoints: roundTo(stopPoints, 4),
    stopTicks: roundTo(toTicks(stopPoints, i.symbol), 4),
    effectivePoints: roundTo(effectivePoints, 4),
    pointValue: pv,
    marketRisk: roundMoney(market),
    totalRisk: roundMoney(total),
  };
}

export interface PositionSizeInput {
  balance: number;
  riskPercent: number;
  symbol: string;
  /** USD per index point for one contract/lot (derived from a custom tick value). Overrides the instrument default. */
  pointValueOverride?: number;
  direction: Direction;
  entry: number;
  stop: number;
  target?: number | null;
  commissionRoundTurn?: number;
  slippagePoints?: number;
  /** optional hard cap on contracts (e.g. margin or personal limit) */
  maxContracts?: number;
}

export interface PositionSizeResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  riskBudget: number;
  stopPoints: number;
  stopTicks: number;
  riskPerContract: number;
  contractsRaw: number;
  contracts: number;
  /** what the position actually risks if the stop is hit (incl. fees/slippage assumptions) */
  actualRisk: number;
  actualRiskPercent: number;
  /** unused part of the budget because contracts must be whole numbers */
  unusedBudget: number;
  notional: number;
  potentialProfit: number | null;
  potentialLoss: number;
  rewardRisk: number | null;
  /** Human-readable explanation of the financial risk. Always shown next to the contract count. */
  explanation: string;
}

export function positionSize(i: PositionSizeInput): PositionSizeResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!(i.balance > 0)) errors.push("O saldo da conta tem de ser positivo.");
  if (!(i.riskPercent > 0)) errors.push("O risco por trade tem de ser superior a 0%.");
  if (i.riskPercent > 100) errors.push("O risco por trade não pode exceder 100%.");
  if (!(i.entry > 0) || !(i.stop > 0)) errors.push("Indica preços de entrada e stop válidos.");
  if (i.entry === i.stop) errors.push("O stop não pode ser igual à entrada.");
  else if (i.entry > 0 && i.stop > 0 && !stopSideValid(i.direction, i.entry, i.stop)) {
    errors.push(i.direction === "LONG" ? "Numa compra (LONG) o stop tem de ficar abaixo da entrada." : "Numa venda (SHORT) o stop tem de ficar acima da entrada.");
  }
  if (i.target != null && i.target > 0 && !targetSideValid(i.direction, i.entry, i.target)) {
    errors.push(i.direction === "LONG" ? "Numa compra (LONG) o target tem de ficar acima da entrada." : "Numa venda (SHORT) o target tem de ficar abaixo da entrada.");
  }

  if (i.pointValueOverride !== undefined && !(i.pointValueOverride > 0)) errors.push("O valor por ponto tem de ser positivo.");
  const instrument = requireInstrument(i.symbol);
  const pv = i.pointValueOverride && i.pointValueOverride > 0 ? i.pointValueOverride : pointValueUsd(i.symbol);
  const riskBudget = roundMoney(i.balance * (i.riskPercent / 100));
  const per = riskPerContract({ symbol: i.symbol, pointValueOverride: pv, entry: i.entry, stop: i.stop, commissionRoundTurn: i.commissionRoundTurn, slippagePoints: i.slippagePoints });

  const contractsRaw = per.totalRisk > 0 ? riskBudget / per.totalRisk : 0;
  let contracts = errors.length ? 0 : Math.floor(contractsRaw + 1e-9);
  if (i.maxContracts !== undefined && contracts > i.maxContracts) {
    contracts = Math.max(0, Math.floor(i.maxContracts));
    warnings.push(`Limitado a ${contracts} contrato(s) pelo teu máximo definido.`);
  }
  const actualRisk = roundMoney(contracts * per.totalRisk);
  const targetPoints = i.target != null && i.target > 0 && !errors.length ? pointsBetween(i.entry, i.target) : null;
  const potentialProfit = targetPoints === null ? null : roundMoney(contracts * (targetPoints * pv - (i.commissionRoundTurn ?? 0)));
  const rewardRisk = targetPoints === null || per.stopPoints === 0 ? null : roundTo(targetPoints / per.stopPoints, 2);

  if (!errors.length) {
    if (contracts === 0) {
      warnings.push(
        `Com este stop (${per.stopPoints} pontos), 1 contrato de ${i.symbol} arrisca ${fmt(per.totalRisk)} — acima do teu orçamento de ${fmt(riskBudget)}. Não existe tamanho inteiro que respeite o risco definido: reduz a distância ao stop, aceita menos risco por trade ou compara com um contrato mais pequeno (ex.: MYM). Não aumentes o risco para "caber".`,
      );
    }
    if (actualRisk > riskBudget + 0.005) warnings.push("O risco real (com comissões/slippage) excede o orçamento.");
    if (i.riskPercent > 2) warnings.push("Risco por trade acima de 2% da conta: perdas consecutivas esgotam o capital muito depressa.");
    if (rewardRisk !== null && rewardRisk < 1) warnings.push(`R:R de ${rewardRisk}:1 — precisas de uma taxa de acerto elevada só para ficar em equilíbrio.`);
    if (instrument.kind === "CFD" && i.pointValueOverride === undefined) warnings.push("Valor por ponto do CFD (demo: $1/ponto por lote) depende do broker — confirma a especificação do teu contrato.");
  }

  const notional = roundMoney(contracts * i.entry * pv);
  const explanation = errors.length
    ? "Corrige os campos assinalados para calcular o tamanho de posição."
    : contracts === 0
      ? `Nenhum contrato inteiro respeita o risco definido (orçamento ${fmt(riskBudget)}; 1 contrato arrisca ${fmt(per.totalRisk)}).`
      : `${contracts} contrato(s) ${i.symbol} × stop de ${per.stopPoints} pontos × ${fmt(pv)}/ponto${(i.commissionRoundTurn ?? 0) > 0 ? " + comissões" : ""} = ${fmt(actualRisk)} de risco se o stop for atingido (${roundTo((actualRisk / i.balance) * 100, 2)}% da conta). Valor nocional controlado: ${fmt(notional)}.`;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    riskBudget,
    stopPoints: per.stopPoints,
    stopTicks: per.stopTicks,
    riskPerContract: per.totalRisk,
    contractsRaw: roundTo(contractsRaw, 4),
    contracts,
    actualRisk,
    actualRiskPercent: i.balance > 0 ? roundTo((actualRisk / i.balance) * 100, 3) : 0,
    unusedBudget: roundMoney(Math.max(0, riskBudget - actualRisk)),
    notional,
    potentialProfit,
    potentialLoss: actualRisk,
    rewardRisk,
    explanation,
  };
}

function fmt(v: number): string {
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface RewardRiskInput {
  direction: Direction;
  entry: number;
  stop: number;
  target: number;
}

export function rewardRisk(i: RewardRiskInput) {
  const risk = pointsBetween(i.entry, i.stop);
  const reward = pointsBetween(i.entry, i.target);
  const ok = risk > 0 && stopSideValid(i.direction, i.entry, i.stop) && targetSideValid(i.direction, i.entry, i.target);
  return {
    valid: ok,
    riskPoints: roundTo(risk, 4),
    rewardPoints: roundTo(reward, 4),
    ratio: ok ? roundTo(reward / risk, 2) : null,
    /** win rate needed to break even (ignoring costs): 1 / (1 + R:R) */
    breakEvenWinRate: ok ? roundTo((1 / (1 + reward / risk)) * 100, 1) : null,
  };
}

/** R multiple of a closed trade: result measured in units of initial risk. */
export function rMultiple(i: { direction: Direction; entry: number; stop: number; exit: number }): number | null {
  const risk = pointsBetween(i.entry, i.stop);
  if (risk === 0) return null;
  return roundTo(pnlPoints(i.direction, i.entry, i.exit) / risk, 2);
}

export function expectancyR(winRate: number, avgWinR: number, avgLossR: number): number {
  const w = Math.min(1, Math.max(0, winRate));
  return roundTo(w * avgWinR - (1 - w) * Math.abs(avgLossR), 3);
}

/** Round-turn friction of a trade, in USD for the whole position. */
export function tradingCosts(i: { symbol: string; contracts: number; spreadPoints: number; commissionRoundTurn: number; slippagePoints: number }) {
  const pv = pointValueUsd(i.symbol);
  const spread = i.spreadPoints * pv * i.contracts;
  const slippage = i.slippagePoints * pv * i.contracts;
  const commission = i.commissionRoundTurn * i.contracts;
  return { spread: roundMoney(spread), slippage: roundMoney(slippage), commission: roundMoney(commission), total: roundMoney(spread + slippage + commission) };
}

export function leverageInfo(notional: number, margin: number) {
  if (!(margin > 0) || !(notional > 0)) return { leverage: null, marginPctOfNotional: null };
  return { leverage: roundTo(notional / margin, 2), marginPctOfNotional: roundTo((margin / notional) * 100, 2) };
}

/** How much the account balance changes for a 1% move in the index (leverage made concrete). */
export function onePercentMoveImpact(symbol: string, price: number, contracts: number) {
  const pv = pointValueUsd(symbol);
  const points = price * 0.01;
  return { points: roundTo(points, 2), usd: roundMoney(points * pv * contracts) };
}

/** Losing streak maths: after n consecutive losses of `riskPercent`, what is left of the account? */
export function drawdownAfterLosses(riskPercent: number, losses: number): { remainingPercent: number; drawdownPercent: number; recoveryNeededPercent: number } {
  const remaining = Math.pow(1 - riskPercent / 100, losses);
  const dd = 1 - remaining;
  return {
    remainingPercent: roundTo(remaining * 100, 2),
    drawdownPercent: roundTo(dd * 100, 2),
    recoveryNeededPercent: remaining > 0 ? roundTo((1 / remaining - 1) * 100, 2) : Infinity,
  };
}
