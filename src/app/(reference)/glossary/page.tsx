import type { Metadata } from "next";
import { prisma } from "@/database/client";
import { GlossaryBrowser } from "@/features/glossary/components/glossary-browser";
import { GLOSSARY_CATEGORIES } from "@/modules/glossary";

export const metadata: Metadata = { title: "Glossário" };
export const dynamic = "force-dynamic";

export default async function GlossaryPage() {
  const rows = await prisma.glossaryTerm.findMany({ orderBy: { term: "asc" } });
  const items = rows
    .map((r) => ({ slug: r.slug, term: r.term, category: r.category, definition: r.definition, simpleExplanation: r.simpleExplanation, technicalExplanation: r.technicalExplanation, example: r.example, related: r.related }))
    .sort((a, b) => a.term.localeCompare(b.term, "pt"));
  const present = new Set(items.map((i) => i.category));
  const categories = [...GLOSSARY_CATEGORIES.filter((c) => present.has(c)), ...[...present].filter((c) => !(GLOSSARY_CATEGORIES as readonly string[]).includes(c))];
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Glossário</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">Cada termo tem definição, explicação simples, explicação técnica, exemplo e conceitos relacionados.</p>
      </header>
      <GlossaryBrowser items={items} categories={categories} />
    </div>
  );
}
