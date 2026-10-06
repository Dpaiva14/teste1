import "server-only";
import { prisma, type Prisma } from "@/database/client";
import type { SessionUser } from "@/lib/auth/session";
import { notFound } from "@/lib/errors";
import type { EventInput } from "../schemas";
import type { AdminEventRow } from "../types";

type Row = Prisma.EconomicEventGetPayload<object>;
const toRow = (e: Row): AdminEventRow => ({
  id: e.id, title: e.title, country: e.country, category: e.category, impact: e.impact, scheduledAt: e.scheduledAt.toISOString(),
  forecast: e.forecast, previous: e.previous, actual: e.actual, description: e.description, source: e.source, sourceUrl: e.sourceUrl, isDemo: e.isDemo,
});
const data = (i: EventInput) => ({ ...i, scheduledAt: new Date(i.scheduledAt) });

export async function listEvents(): Promise<AdminEventRow[]> {
  return (await prisma.economicEvent.findMany({ orderBy: { scheduledAt: "desc" }, take: 200 })).map(toRow);
}
export async function createEvent(admin: SessionUser, input: EventInput): Promise<AdminEventRow> {
  return toRow(await prisma.economicEvent.create({ data: { ...data(input), createdById: admin.id } }));
}
export async function updateEvent(id: string, input: EventInput): Promise<AdminEventRow> {
  if (!(await prisma.economicEvent.findUnique({ where: { id }, select: { id: true } }))) throw notFound("Evento não encontrado.");
  return toRow(await prisma.economicEvent.update({ where: { id }, data: data(input) }));
}
export async function deleteEvent(id: string) {
  if (!(await prisma.economicEvent.findUnique({ where: { id }, select: { id: true } }))) throw notFound("Evento não encontrado.");
  await prisma.economicEvent.delete({ where: { id } });
}
