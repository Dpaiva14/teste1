import "server-only";
import { prisma, Prisma } from "@/database/client";
import { conflict, notFound } from "@/lib/errors";
import type { GlossaryInput } from "../schemas";
import type { AdminGlossaryRow } from "../types";

type Row = Prisma.GlossaryTermGetPayload<object>;
const toRow = (g: Row): AdminGlossaryRow => ({ id: g.id, slug: g.slug, term: g.term, category: g.category, definition: g.definition, simpleExplanation: g.simpleExplanation, technicalExplanation: g.technicalExplanation, example: g.example, related: g.related });

/** Related slugs that do not exist are dropped, so the glossary never links to a missing term. */
async function cleanRelated(slug: string, related: string[]): Promise<string[]> {
  const wanted = [...new Set(related)].filter((r) => r !== slug);
  if (wanted.length === 0) return [];
  const found = await prisma.glossaryTerm.findMany({ where: { slug: { in: wanted } }, select: { slug: true } });
  const ok = new Set(found.map((f) => f.slug));
  return wanted.filter((r) => ok.has(r));
}

export async function listGlossary(): Promise<AdminGlossaryRow[]> {
  return (await prisma.glossaryTerm.findMany({ orderBy: { term: "asc" } })).map(toRow);
}

export async function createTerm(input: GlossaryInput): Promise<AdminGlossaryRow> {
  try {
    return toRow(await prisma.glossaryTerm.create({ data: { ...input, related: await cleanRelated(input.slug, input.related) } }));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw conflict("Já existe um termo com este slug.");
    throw e;
  }
}

export async function updateTerm(id: string, input: GlossaryInput): Promise<AdminGlossaryRow> {
  if (!(await prisma.glossaryTerm.findUnique({ where: { id }, select: { id: true } }))) throw notFound("Termo não encontrado.");
  try {
    return toRow(await prisma.glossaryTerm.update({ where: { id }, data: { ...input, related: await cleanRelated(input.slug, input.related) } }));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw conflict("Já existe um termo com este slug.");
    throw e;
  }
}

export async function deleteTerm(id: string) {
  const t = await prisma.glossaryTerm.findUnique({ where: { id }, select: { slug: true } });
  if (!t) throw notFound("Termo não encontrado.");
  await prisma.$transaction(async (tx) => {
    await tx.glossaryTerm.delete({ where: { id } });
    // Remove dangling references from other terms.
    const referencing = await tx.glossaryTerm.findMany({ where: { related: { has: t.slug } }, select: { id: true, related: true } });
    for (const r of referencing) await tx.glossaryTerm.update({ where: { id: r.id }, data: { related: r.related.filter((x) => x !== t.slug) } });
  });
}
