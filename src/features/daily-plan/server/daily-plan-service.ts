import "server-only";
import { prisma, type Prisma } from "@/database/client";
import { awardXp, recordActivity } from "@/features/gamification/server/gamification-service";
import type { SessionUser } from "@/lib/auth/session";
import type { DailyPlanInput } from "../schemas";

export interface DailyPlanDTO extends Omit<DailyPlanInput, "keyLevels"> {
  keyLevels: Record<string, number | string | null | undefined>;
  updatedAt: string;
}

const toDate = (d: string) => new Date(`${d}T00:00:00Z`);

function toDTO(p: Prisma.DailyPlanGetPayload<object>): DailyPlanDTO {
  return {
    date: p.date.toISOString().slice(0, 10),
    bias: p.bias,
    keyLevels: (p.keyLevels ?? {}) as DailyPlanDTO["keyLevels"],
    events: p.events,
    mustHappen: p.mustHappen ?? undefined,
    invalidation: p.invalidation ?? undefined,
    maxRisk: p.maxRisk,
    maxRiskUnit: p.maxRiskUnit === "PERCENT" ? "PERCENT" : "USD",
    maxTrades: p.maxTrades,
    notes: p.notes ?? undefined,
    review: p.review ?? undefined,
    followedPlan: p.followedPlan,
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function getPlan(user: SessionUser, date: string) {
  const p = await prisma.dailyPlan.findUnique({ where: { userId_date: { userId: user.id, date: toDate(date) } } });
  return p ? toDTO(p) : null;
}

export async function savePlan(user: SessionUser, input: DailyPlanInput) {
  const data = {
    bias: input.bias,
    keyLevels: input.keyLevels as Prisma.InputJsonValue,
    events: input.events,
    mustHappen: input.mustHappen ?? null,
    invalidation: input.invalidation ?? null,
    maxRisk: input.maxRisk ?? null,
    maxRiskUnit: input.maxRiskUnit,
    maxTrades: input.maxTrades ?? null,
    notes: input.notes ?? null,
    review: input.review ?? null,
    followedPlan: input.followedPlan ?? null,
  };
  const plan = await prisma.dailyPlan.upsert({
    where: { userId_date: { userId: user.id, date: toDate(input.date) } },
    create: { userId: user.id, date: toDate(input.date), ...data },
    update: data,
  });
  // Planning is a discipline habit: a small, once-per-day reward (never tied to trading activity).
  const xp = input.mustHappen && input.invalidation ? await awardXp(user.id, "DAILY_PLAN", input.date, 5) : 0;
  await recordActivity(user.id);
  return { plan: toDTO(plan), xpAwarded: xp };
}

export async function planHistory(user: SessionUser) {
  const rows = await prisma.dailyPlan.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 30 });
  const reviewed = rows.filter((r) => r.followedPlan !== null);
  return {
    plans: rows.slice(0, 14).map(toDTO),
    adherence: { reviewed: reviewed.length, followed: reviewed.filter((r) => r.followedPlan).length },
  };
}
