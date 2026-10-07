import { positionSize } from "@/features/calculators/logic/risk";
import { gradeOf, type CriterionResult, type TradeEvaluation } from "@/features/trading/logic/evaluation";
import { roundMoney, roundTo } from "@/lib/money";
import { ACCOUNT_BALANCE, ASSESSMENT_SYMBOL, FACTOR_KEYS, RISK_PERCENT, STEP_META, type Answers, type FactorKey, type StepKey } from "../schemas";
import type { AssessmentFacts, Trend } from "./analysis";

/**
 * Process evaluation of the Final Assessment — 12 criteria, 100 points:
 *   trend 8 · structure 8 · S/R 8 · supply/demand 7 · Fibonacci 7 · confluence 10 · liquidity 7 · entry 8 · stop 10 · target 8 · size 10 · reason 9.
 * It receives ONLY the student's answers and the facts of the visible chart: the future never enters the score, so two students with
 * the same process get the same grade whatever the market did next (tested). The reading is rule-based and transparent; in ambiguous
 * charts more than one answer is accepted, and text is checked for presence/length, not semantically.
 */

export const CONFLUENCE_THRESHOLD = 6;
export const MIN_RR = 1.5;

export interface AssessmentCriterion extends CriterionResult {
  step: StepKey;
}

export interface PlanMetrics {
  valid: boolean;
  problems: string[];
  stopPoints: number | null;
  targetPoints: number | null;
  rewardRisk: number | null;
  /** largest whole number of MYM contracts that respects the risk budget (null if the plan is invalid) */
  maxContracts: number | null;
  riskPerContract: number | null;
  riskBudget: number;
  studentRiskUsd: number | null;
  studentRiskPercent: number | null;
}

export interface FactorCheck {
  ok: boolean;
  why: string;
}

export interface AssessmentEvaluation extends Pick<TradeEvaluation, "grade"> {
  score: number;
  criteria: AssessmentCriterion[];
  plan: PlanMetrics;
  factors: Record<FactorKey, FactorCheck>;
  supportedCount: number;
  notes: string[];
}

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
const TREND_LABEL: Record<Trend, string> = { UP: "alta", DOWN: "baixa", RANGE: "lateral" };
const STRUCTURE_LABEL = { BULLISH: "HH/HL (alta)", BEARISH: "LH/LL (baixa)", RANGE: "lateral/mista" } as const;

export function planMetrics(a: Answers): PlanMetrics {
  const riskBudget = roundMoney(ACCOUNT_BALANCE * (RISK_PERCENT / 100));
  const empty: PlanMetrics = { valid: false, problems: [], stopPoints: null, targetPoints: null, rewardRisk: null, maxContracts: null, riskPerContract: null, riskBudget, studentRiskUsd: null, studentRiskPercent: null };
  if (a.direction === null || a.entry === null || a.stop === null) return { ...empty, problems: ["Faltam a direção, a entrada ou o stop."] };
  const size = positionSize({ balance: ACCOUNT_BALANCE, riskPercent: RISK_PERCENT, symbol: ASSESSMENT_SYMBOL, direction: a.direction, entry: a.entry, stop: a.stop, target: a.target });
  if (!size.valid) return { ...empty, problems: size.errors };
  const studentRiskUsd = a.contracts === null ? null : roundMoney(a.contracts * size.riskPerContract);
  return {
    valid: true,
    problems: [],
    stopPoints: size.stopPoints,
    targetPoints: a.target === null ? null : roundTo(Math.abs(a.target - a.entry), 2),
    rewardRisk: size.rewardRisk,
    maxContracts: size.contracts,
    riskPerContract: size.riskPerContract,
    riskBudget,
    studentRiskUsd,
    studentRiskPercent: studentRiskUsd === null ? null : roundTo((studentRiskUsd / ACCOUNT_BALANCE) * 100, 2),
  };
}

/* ─────────────────────────── helpers on the student's marks ─────────────────────────── */

const overlap = (a: { top: number; bottom: number }, b: { top: number; bottom: number }) => {
  const lo = Math.max(Math.min(a.top, a.bottom), Math.min(b.top, b.bottom));
  const hi = Math.min(Math.max(a.top, a.bottom), Math.max(b.top, b.bottom));
  const len = Math.max(0, hi - lo);
  const h = Math.min(Math.abs(a.top - a.bottom), Math.abs(b.top - b.bottom)) || 1;
  return len / h;
};

function validZone(z: Answers["zones"][number], f: AssessmentFacts): boolean {
  return f.zones.some((c) => c.role === z.role && overlap(z, c) >= 0.25);
}

function levelMatches(price: number, f: AssessmentFacts): boolean {
  return f.levels.some((l) => near(price, l.price, f.atr * 0.75));
}

function fibGeometry(a: Answers, f: AssessmentFacts): { ok: boolean; direction: "up" | "down"; lo: number; hi: number; sizeAtr: number; endpointsNear: number } | null {
  if (!a.fib) return null;
  const { from, to } = a.fib;
  const up = to.price > from.price;
  const aType = up ? "low" : "high";
  const bType = up ? "high" : "low";
  const nearSwing = (p: { index: number; price: number }, type: "high" | "low") => f.swings.some((s) => s.type === type && near(s.price, p.price, f.atr * 0.8) && Math.abs(s.index - p.index) <= 12);
  const endpointsNear = Number(nearSwing(from, aType)) + Number(nearSwing(to, bType));
  const sizeAtr = Math.abs(to.price - from.price) / f.atr;
  return { ok: endpointsNear === 2 && sizeAtr >= 2.5, direction: up ? "up" : "down", lo: Math.min(from.price, to.price), hi: Math.max(from.price, to.price), sizeAtr, endpointsNear };
}

/** Price band between the 38.2% and 78.6% retracements of the student's Fibonacci leg. */
function fibBand(a: Answers): { bottom: number; top: number } | null {
  if (!a.fib) return null;
  const { from, to } = a.fib;
  const len = to.price - from.price;
  const p382 = to.price - 0.382 * len;
  const p786 = to.price - 0.786 * len;
  return { bottom: Math.min(p382, p786), top: Math.max(p382, p786) };
}

/* ─────────────────────────── the 8 confluence factors, verified against the student's own plan ─────────────────────────── */

export function verifyFactors(a: Answers, f: AssessmentFacts, plan: PlanMetrics): Record<FactorKey, FactorCheck> {
  const dir = a.direction;
  const entry = a.entry;
  const long = dir === "LONG";
  const noPlan = dir === null || entry === null;
  const no = (why: string): FactorCheck => ({ ok: false, why });
  const yes = (why: string): FactorCheck => ({ ok: true, why });
  const out = {} as Record<FactorKey, FactorCheck>;

  out.trend = noPlan ? no("Sem direção definida.") : f.acceptableTrends.some((t) => (long ? t === "UP" : t === "DOWN")) ? yes("A direção está alinhada com a tendência calculada.") : no(`A direção ${long ? "compradora" : "vendedora"} vai contra a tendência calculada (${f.acceptableTrends.map((t) => TREND_LABEL[t]).join("/")}).`);

  const wantStructure = long ? "BULLISH" : "BEARISH";
  out.structure = noPlan ? no("Sem direção definida.") : f.structure === wantStructure ? yes(`Estrutura ${STRUCTURE_LABEL[f.structure]} a favor da direção.`) : no(`A estrutura calculada (${STRUCTURE_LABEL[f.structure]}) não suporta uma ${long ? "compra" : "venda"}.`);

  out.sr = noPlan ? no("Sem entrada definida.") : a.sr.some((m) => levelMatches(m.price, f) && near(m.price, entry, f.atr)) ? yes("A entrada está a menos de 1 ATR de um nível que marcaste e que coincide com reações reais.") : no("Nenhum nível validado que marcaste fica a menos de 1 ATR da entrada.");

  out.supplyDemand = noPlan
    ? no("Sem entrada definida.")
    : a.zones.some((z) => z.role === (long ? "demand" : "supply") && validZone(z, f) && entry >= Math.min(z.top, z.bottom) - f.atr * 0.5 && entry <= Math.max(z.top, z.bottom) + f.atr * 0.5)
      ? yes("A entrada está dentro (ou junto) de uma zona de oferta/procura validada e coerente com a direção.")
      : no("Não há uma zona de oferta/procura validada, na direção certa, junto da entrada.");

  const geo = fibGeometry(a, f);
  const band = fibBand(a);
  out.fibonacci = noPlan
    ? no("Sem entrada definida.")
    : geo?.ok && band && entry >= band.bottom - f.atr * 0.3 && entry <= band.top + f.atr * 0.3 && geo.direction === (long ? "up" : "down")
      ? yes("A entrada fica entre os retracements de 38,2% e 78,6% de um swing válido, a favor da direção.")
      : no("A entrada não coincide com a zona 38,2–78,6% de um Fibonacci bem aplicado e a favor da direção.");

  const c = f.lastCandle;
  out.priceAction = noPlan
    ? no("Sem direção definida.")
    : long
      ? (c.direction === "bullish" && c.bodyAtr >= 0.3) || c.lowerWickPct >= 40
        ? yes("O último candle mostra força compradora ou rejeição de preços baixos.")
        : no("O último candle não mostra confirmação compradora (corpo de alta ou sombra inferior longa).")
      : (c.direction === "bearish" && c.bodyAtr >= 0.3) || c.upperWickPct >= 40
        ? yes("O último candle mostra força vendedora ou rejeição de preços altos.")
        : no("O último candle não mostra confirmação vendedora (corpo de baixa ou sombra superior longa).");

  out.liquidity = noPlan
    ? no("Sem entrada definida.")
    : a.liquidity.levels.some((l) => f.pools.some((p) => near(l.price, p.price, f.atr * 0.6)) && near(l.price, entry, f.atr * 2))
      ? yes("Marcaste liquidez real (equal highs/lows) a menos de 2 ATR da entrada.")
      : no("Não marcaste liquidez real perto da entrada.");

  out.riskReward = plan.valid && plan.rewardRisk !== null && plan.rewardRisk >= MIN_RR ? yes(`R:R de ${plan.rewardRisk}:1 (≥ ${MIN_RR}).`) : no(plan.rewardRisk === null ? "Sem alvo válido para medir o R:R." : `R:R de ${plan.rewardRisk}:1, abaixo de ${MIN_RR}.`);
  return out;
}

/* ─────────────────────────── the 12 criteria ─────────────────────────── */

type Scored = { earned: number; comment: string };

function evalTrend(a: Answers, f: AssessmentFacts): Scored {
  if (a.trend === null) return { earned: 0, comment: "Sem resposta." };
  const facts = `variação de ${f.driftAtr > 0 ? "+" : ""}${f.driftAtr} ATR nas últimas 100 barras, eficiência ${f.efficiency}; estrutura ${STRUCTURE_LABEL[f.structure]}`;
  if (f.acceptableTrends.includes(a.trend)) return { earned: 8, comment: `Tendência de ${TREND_LABEL[a.trend]}: coerente com a leitura calculada (${facts}).` };
  if (f.trendByDrift === "RANGE" && a.trend !== "RANGE" && (a.trend === "UP" ? f.driftAtr > 0 : f.driftAtr < 0)) return { earned: 5, comment: `Tendência de ${TREND_LABEL[a.trend]} é defensável, mas o movimento líquido é pequeno (${facts}).` };
  if (a.trend === "RANGE") return { earned: 3, comment: `Havia direção mais clara do que "lateral" (${facts}).` };
  return { earned: 0, comment: `A tendência indicada (${TREND_LABEL[a.trend]}) contraria a leitura calculada (${facts}).` };
}

function evalStructure(a: Answers, f: AssessmentFacts): Scored {
  if (a.structure === null) return { earned: 0, comment: "Sem resposta." };
  const detail = `último máximo ${f.lastHighLabel ?? "n.d."}, último mínimo ${f.lastLowLabel ?? "n.d."}`;
  if (a.structure === f.structure) return { earned: 8, comment: `Estrutura ${STRUCTURE_LABEL[a.structure]} correta (${detail}).` };
  if (f.structure === "RANGE" && a.structure !== "RANGE") {
    const partial = a.structure === "BULLISH" ? f.lastHighLabel === "HH" || f.lastLowLabel === "HL" : f.lastHighLabel === "LH" || f.lastLowLabel === "LL";
    if (partial) return { earned: 4, comment: `Os sinais são mistos (${detail}); a tua leitura vê um lado, mas a estrutura não está confirmada.` };
  }
  if (a.structure === "RANGE") return { earned: 2, comment: `A estrutura era ${STRUCTURE_LABEL[f.structure]} (${detail}), não lateral.` };
  return { earned: 0, comment: `A estrutura calculada é ${STRUCTURE_LABEL[f.structure]} (${detail}).` };
}

function evalSr(a: Answers, f: AssessmentFacts): Scored {
  const marks = a.sr;
  if (f.levels.length === 0) {
    return marks.length <= 2 ? { earned: 6, comment: "Não há níveis com 2+ reações neste intervalo; marcar poucos (ou nenhum) é prudente." } : { earned: 3, comment: "Não há níveis com 2+ reações claras; marcaste muitos níveis sem evidência." };
  }
  if (marks.length === 0) return { earned: 0, comment: `Não marcaste nenhum nível, mas há ${f.levels.length} zona(s) com 2+ reações (ex.: ≈ ${fmt(f.levels[0]!.price)}).` };
  const matched = f.levels.filter((l) => marks.some((m) => near(m.price, l.price, f.atr * 0.75))).length;
  const hits = marks.filter((m) => levelMatches(m.price, f)).length;
  const target = Math.min(2, f.levels.length);
  const frac = Math.min(matched, target) / target;
  const precision = hits / marks.length;
  let earned = 8 * (0.7 * frac + 0.3 * precision);
  if (marks.length > 6) earned *= 0.8;
  return { earned, comment: `${hits} de ${marks.length} nível(is) coincidem com reações reais (tolerância ≈ 0,75 ATR); existem ${f.levels.length} zona(s) com 2+ reações.` };
}

function evalSupplyDemand(a: Answers, f: AssessmentFacts): Scored {
  if (a.zones.length === 0) {
    return f.zones.length === 0 ? { earned: 7, comment: "Não há partidas fortes (≥ 2 ATR) a partir de swings: não forçar zonas é correto." } : { earned: 0, comment: `Não marcaste zonas, mas houve ${f.zones.length} partida(s) forte(s) a partir de swings.` };
  }
  const scores = a.zones.map((z) => {
    const h = Math.abs(z.top - z.bottom) / f.atr;
    return validZone(z, f) ? 1 : h >= 0.3 && h <= 3 ? 0.35 : 0.1;
  });
  const top = [...scores].sort((x, y) => y - x).slice(0, 2);
  const avg = top.reduce((s, x) => s + x, 0) / top.length;
  let earned = 7 * avg;
  if (f.zones.length === 0) earned = Math.min(earned, 3);
  const valid = a.zones.filter((z) => validZone(z, f)).length;
  return { earned, comment: `${valid} de ${a.zones.length} zona(s) sobrepõem-se a partidas reais de swings (oferta/procura); ${f.zones.length} candidata(s) calculada(s).` };
}

function evalFib(a: Answers, f: AssessmentFacts): Scored {
  const g = fibGeometry(a, f);
  if (!g) return f.legs.length === 0 ? { earned: 5, comment: "Não há um impulso claro (≥ 2 ATR) entre swings; não aplicar Fibonacci é aceitável." } : { earned: 0, comment: `Não aplicaste Fibonacci, mas existe ${f.legs.length} impulso(s) claro(s) entre swings.` };
  if (g.ok) return { earned: 7, comment: `Fibonacci bem ancorado: os dois extremos coincidem com swings e o movimento tem ${roundTo(g.sizeAtr, 1)} ATR.` };
  if (g.endpointsNear === 2) return { earned: 4, comment: `Os extremos coincidem com swings, mas o movimento é curto (${roundTo(g.sizeAtr, 1)} ATR < 2,5): o Fibonacci perde significado.` };
  if (g.endpointsNear === 1) return { earned: 3, comment: "Só um dos extremos coincide com um swing: ancora o Fibonacci em máximos e mínimos reais." };
  return { earned: 1.5, comment: "Os extremos não coincidem com swings reais: o Fibonacci ficou arbitrário." };
}

function evalConfluence(a: Answers, factors: Record<FactorKey, FactorCheck>): Scored {
  const claimed = new Set(a.confluence);
  let correct = 0;
  const false_: FactorKey[] = [];
  const missed: FactorKey[] = [];
  for (const k of FACTOR_KEYS) {
    const ok = factors[k].ok;
    if (claimed.has(k) === ok) correct += 1;
    else if (claimed.has(k)) false_.push(k);
    else missed.push(k);
  }
  const parts: string[] = [`${correct} de 8 fatores classificados corretamente.`];
  if (false_.length) parts.push(`Marcados sem suporte no teu plano: ${false_.map((k) => `${LABEL[k]} (${factors[k].why})`).join("; ")}.`);
  if (missed.length) parts.push(`Presentes e não marcados: ${missed.map((k) => LABEL[k]).join(", ")}.`);
  return { earned: 10 * (correct / 8), comment: parts.join(" ") };
}

const LABEL: Record<FactorKey, string> = {
  trend: "tendência",
  structure: "estrutura",
  sr: "S/R",
  supplyDemand: "oferta/procura",
  fibonacci: "Fibonacci",
  priceAction: "price action",
  liquidity: "liquidez",
  riskReward: "R:R",
};

function evalLiquidity(a: Answers, f: AssessmentFacts): Scored {
  const marks = a.liquidity.levels;
  if (a.liquidity.none) return f.pools.length === 0 ? { earned: 7, comment: "Não há equal highs/lows evidentes: reconhecer a ausência de liquidez óbvia é correto." } : { earned: 2, comment: `Indicaste que não há liquidez, mas existem ${f.pools.length} pool(s) (ex.: equal ${f.pools[0]!.side === "high" ? "highs" : "lows"} ≈ ${fmt(f.pools[0]!.price)}).` };
  if (marks.length === 0) return { earned: 0, comment: "Não marcaste liquidez nem indicaste que não existe." };
  if (f.pools.length === 0) return { earned: 2, comment: "Marcaste liquidez, mas não há equal highs/lows evidentes neste intervalo." };
  const matched = f.pools.filter((p) => marks.some((m) => near(m.price, p.price, f.atr * 0.6))).length;
  const hits = marks.filter((m) => f.pools.some((p) => near(m.price, p.price, f.atr * 0.6))).length;
  const frac = Math.min(matched, 2) / Math.min(f.pools.length, 2);
  return { earned: 7 * (0.75 * frac + 0.25 * (hits / marks.length)), comment: `${hits} de ${marks.length} marca(s) coincidem com pools reais (máximos/mínimos iguais); existem ${f.pools.length}.` };
}

function referencePrices(a: Answers, f: AssessmentFacts): number[] {
  const refs: number[] = [...a.sr.map((s) => s.price), ...f.levels.map((l) => l.price)];
  for (const z of a.zones) refs.push(z.top, z.bottom, (z.top + z.bottom) / 2);
  for (const z of f.zones) refs.push((z.top + z.bottom) / 2);
  const band = fibBand(a);
  if (band) refs.push(band.bottom, band.top, (band.bottom + band.top) / 2);
  return refs;
}

function evalEntry(a: Answers, f: AssessmentFacts): Scored {
  if (a.direction === null || a.entry === null) return { earned: 0, comment: "Sem direção ou preço de entrada." };
  const long = a.direction === "LONG";
  const aligned = f.acceptableTrends.some((t) => (long ? t === "UP" : t === "DOWN"));
  const onlyRange = f.acceptableTrends.every((t) => t === "RANGE");
  const dirPts = aligned ? 3 : onlyRange ? 2 : 1;
  const nearestRef = Math.min(...referencePrices(a, f).map((p) => Math.abs(p - a.entry!)), Infinity);
  const locPts = nearestRef <= f.atr * 0.75 ? 3 : nearestRef <= f.atr * 1.5 ? 1.5 : 0;
  const dist = Math.abs(a.entry - f.lastClose) / f.atr;
  const reachPts = dist <= 4 ? 2 : dist <= 6 ? 1 : 0;
  const parts = [
    aligned ? "direção a favor da tendência" : onlyRange ? "contexto lateral: direção aceitável se houver localização" : "direção contra a tendência calculada (exige justificação forte)",
    locPts === 3 ? "entrada junto de uma referência" : locPts > 0 ? "entrada algo afastada de qualquer referência" : "entrada sem referência próxima (nível, zona ou Fibonacci)",
    reachPts === 2 ? "preço alcançável" : `entrada a ${roundTo(dist, 1)} ATR do último fecho`,
  ];
  return { earned: dirPts + locPts + reachPts, comment: parts.join("; ") + "." };
}

function evalStop(a: Answers, f: AssessmentFacts, plan: PlanMetrics): Scored {
  if (a.direction === null || a.entry === null || a.stop === null) return { earned: 0, comment: "Sem stop." };
  if (!plan.valid) return { earned: 0, comment: plan.problems[0] ?? "Stop inválido." };
  const long = a.direction === "LONG";
  const d = Math.abs(a.entry - a.stop) / f.atr;
  const distPts = d >= 0.5 && d <= 5 ? 3 : (d >= 0.3 && d < 0.5) || (d > 5 && d <= 8) ? 1.5 : 0;
  const candidates = f.swings.filter((s) => (long ? s.type === "low" && s.price < a.entry! : s.type === "high" && s.price > a.entry!));
  const ref = candidates.length ? candidates.reduce((best, s) => (Math.abs(s.price - a.entry!) < Math.abs(best.price - a.entry!) ? s : best)) : null;
  let structPts = 1.5;
  let structNote = "sem swing de referência do lado do stop";
  if (ref) {
    const beyond = long ? a.stop <= ref.price + f.atr * 0.15 : a.stop >= ref.price - f.atr * 0.15;
    const tooFar = Math.abs(a.stop - ref.price) > f.atr * 3;
    structPts = beyond ? (tooFar ? 1.5 : 3) : 1;
    structNote = beyond ? (tooFar ? `stop além do swing (${fmt(ref.price)}) mas demasiado afastado dele` : `stop para lá do swing de invalidação (${fmt(ref.price)})`) : `stop dentro da estrutura: o swing em ${fmt(ref.price)} ainda o pode tirar num reteste`;
  }
  return { earned: 4 + distPts + structPts, comment: `Stop a ${roundTo(d, 1)} ATR (${fmt(plan.stopPoints ?? 0)} pontos); ${structNote}.` };
}

function evalTarget(a: Answers, f: AssessmentFacts, plan: PlanMetrics): Scored {
  if (a.target === null || a.direction === null || a.entry === null) return { earned: 0, comment: "Sem alvo." };
  if (!plan.valid || plan.rewardRisk === null) return { earned: 0, comment: plan.problems[0] ?? "Alvo inválido para a direção escolhida." };
  const rr = plan.rewardRisk;
  const rrPts = rr >= MIN_RR ? 5 : rr >= 1 ? 2.5 : 0;
  const long = a.direction === "LONG";
  const dist = Math.abs(a.target - a.entry) / f.atr;
  const between = referencePrices({ ...a, zones: [], fib: null }, f).filter((p) => (long ? p > a.entry! && p < a.target! - f.atr * 0.5 : p < a.entry! && p > a.target! + f.atr * 0.5));
  const obstacle = between.length > 0;
  const realism = dist > 8 ? 1 : obstacle ? 1.5 : 3;
  const note = dist > 8 ? `alvo muito distante (${roundTo(dist, 1)} ATR)` : obstacle ? `há um nível a meio do caminho (≈ ${fmt(between[0]!)}): considera o alvo antes dele ou uma saída parcial` : "sem obstáculos marcados entre a entrada e o alvo";
  return { earned: rrPts + realism, comment: `R:R de ${rr}:1 ${rr >= MIN_RR ? "(≥ 1,5)" : "(abaixo de 1,5)"}; ${note}.` };
}

function evalSize(a: Answers, plan: PlanMetrics): Scored {
  if (a.contracts === null) return { earned: 0, comment: "Sem tamanho." };
  if (!plan.valid || plan.maxContracts === null) return { earned: 0, comment: "O plano (entrada/stop) é inválido: não é possível dimensionar a posição." };
  const max = plan.maxContracts;
  const risk = plan.studentRiskUsd ?? 0;
  const pct = plan.studentRiskPercent ?? 0;
  const info = `Orçamento de risco $${fmt(plan.riskBudget)} (${RISK_PERCENT}% de $${fmt(ACCOUNT_BALANCE)}); máximo ${max} contrato(s) MYM com este stop.`;
  if (max === 0) return a.contracts === 0 ? { earned: 10, comment: `${info} Não existe tamanho inteiro que respeite o risco e escolheste 0: correto — não se aumenta o risco para caber.` } : { earned: 0, comment: `${info} Escolheste ${a.contracts} e arriscas $${fmt(risk)} (${pct}%): acima do orçamento.` };
  if (a.contracts > max) return { earned: 0, comment: `${info} Escolheste ${a.contracts} e arriscas $${fmt(risk)} (${pct}% da conta): acima do risco definido.` };
  if (a.contracts === max) return { earned: 10, comment: `${info} Escolheste ${max}: risco de $${fmt(risk)} (${pct}%).` };
  if (a.contracts === 0) return { earned: 2, comment: `${info} Escolheste 0, apesar de o plano ser dimensionável.` };
  return { earned: a.contracts / max >= 0.5 ? 7 : 4, comment: `${info} Escolheste ${a.contracts}: seguro, mas não é o tamanho calculado (risco $${fmt(risk)}).` };
}

function evalReason(a: Answers, plan: PlanMetrics, supportedCount: number): Scored {
  const thesis = a.reason.trim().length;
  const inval = a.invalidation.trim().length;
  const thesisPts = thesis >= 60 ? 3 : thesis >= 30 ? 2 : thesis >= 10 ? 1 : 0;
  const invalPts = inval >= 20 ? 3 : inval >= 10 ? 2 : inval >= 5 ? 1 : 0;
  const reasonPts = a.entryReason === "SETUP_VALID" ? 2 : a.entryReason === "OTHER" ? 1 : 0;
  const meets = plan.valid && (plan.rewardRisk ?? 0) >= MIN_RR && supportedCount >= CONFLUENCE_THRESHOLD;
  const cohPts = a.decision === null ? 0 : meets ? (a.decision === "TAKE" ? 1 : 0.5) : a.decision === "WAIT" ? 1 : 0;
  const coh = a.decision === null ? "sem decisão" : meets ? (a.decision === "TAKE" ? `tomar o trade é coerente (${supportedCount}/8 fatores verificados e R:R aceitável)` : `esperar é legítimo, embora o plano cumprisse o limiar (${supportedCount}/8)`) : a.decision === "WAIT" ? `esperar é coerente (${supportedCount}/8 fatores verificados, abaixo do limiar de ${CONFLUENCE_THRESHOLD}/8 usado como exemplo no framework)` : `tomar o trade com ${supportedCount}/8 fatores verificados (limiar de exemplo: ${CONFLUENCE_THRESHOLD}/8) ou R:R inferior a ${MIN_RR} contraria o próprio plano`;
  return {
    earned: thesisPts + invalPts + reasonPts + cohPts,
    comment: `Razão ${thesis >= 60 ? "desenvolvida" : "curta"} (${thesis} caracteres); invalidação ${inval >= 20 ? "explícita" : "curta ou em falta"} (${inval}); razão de entrada: ${a.entryReason ?? "n.d."}; decisão: ${coh}. (O texto é verificado por presença e extensão, não semanticamente.)`,
  };
}

/* ─────────────────────────── entry point ─────────────────────────── */

const CRITERIA: { step: StepKey; max: number }[] = [
  { step: "trend", max: 8 },
  { step: "structure", max: 8 },
  { step: "sr", max: 8 },
  { step: "supplyDemand", max: 7 },
  { step: "fibonacci", max: 7 },
  { step: "confluence", max: 10 },
  { step: "liquidity", max: 7 },
  { step: "entry", max: 8 },
  { step: "stop", max: 10 },
  { step: "target", max: 8 },
  { step: "size", max: 10 },
  { step: "reason", max: 9 },
];

export const MAX_SCORE = CRITERIA.reduce((s, c) => s + c.max, 0);

export function evaluateAssessment(a: Answers, f: AssessmentFacts): AssessmentEvaluation {
  const plan = planMetrics(a);
  const factors = verifyFactors(a, f, plan);
  const supportedCount = FACTOR_KEYS.filter((k) => factors[k].ok).length;
  const scored: Record<StepKey, Scored> = {
    trend: evalTrend(a, f),
    structure: evalStructure(a, f),
    sr: evalSr(a, f),
    supplyDemand: evalSupplyDemand(a, f),
    fibonacci: evalFib(a, f),
    confluence: evalConfluence(a, factors),
    liquidity: evalLiquidity(a, f),
    entry: evalEntry(a, f),
    stop: evalStop(a, f, plan),
    target: evalTarget(a, f, plan),
    size: evalSize(a, plan),
    reason: evalReason(a, plan, supportedCount),
  };
  const criteria: AssessmentCriterion[] = CRITERIA.map(({ step, max }) => {
    const s = scored[step];
    return { step, key: step, label: STEP_META[step].title, earned: roundTo(Math.max(0, Math.min(max, s.earned)), 1), max, comment: s.comment };
  });
  const score = Math.round(criteria.reduce((sum, c) => sum + c.earned, 0));
  const notes: string[] = [];
  const weakest = [...criteria].sort((x, y) => x.earned / x.max - y.earned / y.max).slice(0, 2).filter((c) => c.earned / c.max < 0.7);
  if (weakest.length) notes.push(`Onde mais ganhas em melhorar o processo: ${weakest.map((c) => `${c.label} (${c.earned}/${c.max})`).join(" e ")}.`);
  if (!plan.valid) notes.push("O plano (entrada, stop e alvo) tem um erro de coerência que impede o cálculo do risco: " + (plan.problems[0] ?? "verifica os lados do stop e do alvo."));
  notes.push("A nota mede a qualidade do processo com base no que era visível no ponto de decisão. O que aconteceu depois é mostrado à parte, como informação, e não altera a nota.");
  return { score, grade: gradeOf(score), criteria, plan, factors, supportedCount, notes };
}
