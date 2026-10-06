import "server-only";
import { prisma } from "@/database/client";
import type { EventImpact } from "@/database/generated/enums";

export interface EconomicEventDTO {
  id: string;
  title: string;
  country: string;
  category: string;
  impact: EventImpact;
  scheduledAt: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  description: string | null;
  source: string | null;
  sourceUrl: string | null;
  isDemo: boolean;
}

/** Default window: 2 days back, 30 days ahead. */
export async function listEvents(from: Date = new Date(Date.now() - 2 * 86_400_000), to: Date = new Date(Date.now() + 30 * 86_400_000)): Promise<EconomicEventDTO[]> {
  const rows = await prisma.economicEvent.findMany({ where: { scheduledAt: { gte: from, lte: to } }, orderBy: { scheduledAt: "asc" }, take: 500 });
  return rows.map((e) => ({
    id: e.id, title: e.title, country: e.country, category: e.category, impact: e.impact, scheduledAt: e.scheduledAt.toISOString(), forecast: e.forecast, previous: e.previous,
    actual: e.actual, description: e.description, source: e.source, sourceUrl: e.sourceUrl, isDemo: e.isDemo,
  }));
}
