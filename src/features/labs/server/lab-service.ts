import "server-only";
import type { Prisma } from "@/database/client";
import { prisma } from "@/database/client";
import { awardXp, evaluateAchievements, recordActivity, XP } from "@/features/gamification/server/gamification-service";
import { buildScenarioCandles, intendedSwings } from "@/features/scenarios/build";
import { badRequest, notFound } from "@/lib/errors";
import { lastAtr } from "@/lib/market-data/indicators";
import type { Candle } from "@/lib/market-data/types";
import type { SessionUser } from "@/lib/auth/session";
import { getInstrument } from "@/modules/instruments";
import { SCENARIOS } from "@/modules/scenarios";
import type { ScenarioDef } from "@/modules/scenarios/types";
import { checkConfluence, simulateOutcome } from "../logic/confluence";
import { checkFibonacci } from "../logic/fibonacci";
import { checkLevels } from "../logic/levels";
import { checkStructure } from "../logic/structure";
import { answerSchemas, type LabKind } from "../schemas";

const FILTERS: Record<LabKind, (s: ScenarioDef) => boolean> = {
  "market-structure": (s) => Boolean(s.structure),
  levels: (s) => Boolean(s.levels),
  fibonacci: (s) => Boolean(s.fib),
  confluence: (s) => Boolean(s.confluence),
};

export interface LabScenarioListItem {
  id: string;
  title: string;
  description: string;
  symbol: string;
  timeframe: string;
  bestScore: number | null;
  attempts: number;
}

export async function listLabScenarios(user: SessionUser, kind: LabKind): Promise<LabScenarioListItem[]> {
  const defs = SCENARIOS.filter(FILTERS[kind]);
  const stats = await prisma.exerciseAttempt.groupBy({
    by: ["scenarioId"],
    where: { userId: user.id, exerciseKey: kind },
    _max: { scorePercent: true },
    _count: true,
  });
  const byId = new Map(stats.map((s) => [s.scenarioId, s]));
  return defs.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    symbol: d.symbol,
    timeframe: d.timeframe,
    bestScore: byId.get(d.id)?._max.scorePercent ?? null,
    attempts: byId.get(d.id)?._count ?? 0,
  }));
}

function findScenario(kind: LabKind, id: string): ScenarioDef {
  const def = SCENARIOS.find((s) => s.id === id && FILTERS[kind](s));
  if (!def) throw notFound("Cenário não encontrado.");
  return def;
}

export interface LabScenarioPayload {
  id: string;
  title: string;
  description: string;
  symbol: string;
  timeframe: string;
  priceDecimals: number;
  candles: Candle[];
  /** things the student is allowed to see up front (never the solution) */
  context: Record<string, unknown>;
}

export function getLabScenario(kind: LabKind, id: string): LabScenarioPayload {
  const def = findScenario(kind, id);
  const all = buildScenarioCandles(def);
  const base = {
    id: def.id,
    title: def.title,
    description: def.description,
    symbol: def.symbol,
    timeframe: def.timeframe,
    priceDecimals: getInstrument(def.symbol)?.priceDecimals ?? 0,
  };
  if (kind === "confluence") {
    const sol = def.confluence!;
    return {
      ...base,
      candles: all.slice(0, sol.decisionIndex + 1),
      context: { direction: sol.direction, entry: sol.entry, stop: sol.stop, target: sol.target, decisionIndex: sol.decisionIndex },
    };
  }
  if (kind === "market-structure") {
    // The first swing of each side has no label (nothing to compare with) — show them as given references.
    const swings = intendedSwings(def);
    const firstHigh = swings.find((s) => s.type === "high");
    const firstLow = swings.find((s) => s.type === "low");
    return { ...base, candles: all, context: { references: [firstHigh, firstLow].filter(Boolean).map((s) => ({ index: s!.index, price: s!.price, type: s!.type })) } };
  }
  return { ...base, candles: all, context: {} };
}

export async function checkLab(user: SessionUser, kind: LabKind, id: string, rawAnswer: unknown) {
  const def = findScenario(kind, id);
  const all = buildScenarioCandles(def);
  const parsed = answerSchemas[kind].safeParse(rawAnswer);
  if (!parsed.success) throw badRequest("Resposta inválida.");

  let scorePercent = 0;
  let feedback: Record<string, unknown> = {};

  switch (kind) {
    case "market-structure": {
      const r = checkStructure(def, parsed.data as Parameters<typeof checkStructure>[1]);
      scorePercent = r.scorePercent;
      feedback = { ...r };
      break;
    }
    case "levels": {
      const r = checkLevels(def, (parsed.data as { zones: Parameters<typeof checkLevels>[1] }).zones, lastAtr(all));
      scorePercent = r.scorePercent;
      feedback = { ...r, atr: lastAtr(all) };
      break;
    }
    case "fibonacci": {
      const r = checkFibonacci(def, parsed.data as Parameters<typeof checkFibonacci>[1]);
      scorePercent = r.scorePercent;
      feedback = { ...r };
      break;
    }
    case "confluence": {
      const sol = def.confluence!;
      const r = checkConfluence(def, parsed.data as Parameters<typeof checkConfluence>[1]);
      scorePercent = r.scorePercent;
      const future = all.slice(sol.decisionIndex + 1);
      feedback = { ...r, annotations: def.annotations ?? [], reveal: { candles: future, outcome: simulateOutcome(future, sol) } };
      break;
    }
  }

  await prisma.exerciseAttempt.create({
    data: {
      userId: user.id,
      exerciseKey: kind,
      scenarioId: id,
      scorePercent,
      answer: parsed.data as Prisma.InputJsonValue,
      // The reveal candles are reproducible from the scenario id; do not duplicate them in the database.
      feedback: stripReveal(feedback) as Prisma.InputJsonValue,
    },
  });

  let xp = 0;
  if (scorePercent >= 70) xp += await awardXp(user.id, "EXERCISE", `${kind}:${id}`, XP.exercisePass);
  await recordActivity(user.id);
  const newAchievements = await evaluateAchievements(user.id);
  return { scorePercent, passed: scorePercent >= 70, xpAwarded: xp, newAchievements, feedback };
}

function stripReveal(f: Record<string, unknown>): Record<string, unknown> {
  const { reveal, annotations, ...rest } = f;
  void reveal;
  void annotations;
  return rest;
}
