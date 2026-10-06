"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface GlossaryItem {
  slug: string;
  term: string;
  category: string;
  definition: string;
  simpleExplanation: string;
  technicalExplanation: string;
  example: string;
  related: string[];
}

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function GlossaryBrowser({ items, categories }: { items: GlossaryItem[]; categories: string[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const bySlug = useMemo(() => new Map(items.map((i) => [i.slug, i])), [items]);
  const filtered = useMemo(() => {
    const needle = fold(q.trim());
    return items.filter((i) => (!cat || i.category === cat) && (!needle || fold(`${i.term} ${i.definition} ${i.simpleExplanation} ${i.technicalExplanation} ${i.example}`).includes(needle)));
  }, [items, q, cat]);

  const letters = useMemo(() => [...new Set(filtered.map((i) => fold(i.term)[0]?.toUpperCase() ?? "#"))].sort(), [filtered]);

  function jump(slug: string) {
    setQ("");
    setCat(null);
    setOpen(slug);
    requestAnimationFrame(() => document.getElementById(`term-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar termos (ex.: slippage, Fibonacci, margem…)" className="h-11 pl-9 pr-9" aria-label="Pesquisar no glossário" />
          {q && <button type="button" onClick={() => setQ("")} aria-label="Limpar pesquisa" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Categorias">
          <Button size="sm" variant={cat === null ? "default" : "outline"} onClick={() => setCat(null)}>Todos</Button>
          {categories.map((c) => <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(cat === c ? null : c)}>{c}</Button>)}
        </div>
        <p className="text-xs text-muted-foreground" aria-live="polite">{filtered.length} termo(s)</p>
      </div>

      {letters.length > 1 && (
        <nav aria-label="Índice alfabético" className="flex flex-wrap gap-1 text-xs">
          {letters.map((l) => <a key={l} href={`#letter-${l}`} className="rounded border px-2 py-0.5 hover:bg-accent">{l}</a>)}
        </nav>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-lg border p-6 text-center text-sm text-muted-foreground">Nenhum termo encontrado para “{q}”.</p>
      ) : (
        <dl className="grid gap-2">
          {filtered.map((i, idx) => {
            const letter = fold(i.term)[0]?.toUpperCase() ?? "#";
            const first = idx === 0 || (fold(filtered[idx - 1]!.term)[0]?.toUpperCase() ?? "#") !== letter;
            const expanded = open === i.slug;
            return (
              <div key={i.slug} id={`term-${i.slug}`} className="scroll-mt-24">
                {first && <div id={`letter-${letter}`} className="mb-1 mt-4 scroll-mt-24 text-sm font-semibold text-primary">{letter}</div>}
                <div className={cn("rounded-lg border bg-card transition-colors", expanded && "border-primary/50")}>
                  <button type="button" onClick={() => setOpen(expanded ? null : i.slug)} aria-expanded={expanded} className="flex w-full items-start justify-between gap-3 p-4 text-left">
                    <span>
                      <dt className="font-semibold">{i.term}</dt>
                      <dd className="mt-0.5 text-sm text-muted-foreground">{i.definition}</dd>
                    </span>
                    <Badge variant="outline" className="shrink-0">{i.category}</Badge>
                  </button>
                  {expanded && (
                    <div className="grid gap-3 border-t px-4 py-4 text-sm">
                      <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Explicação simples</p><p className="mt-1">{i.simpleExplanation}</p></div>
                      <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Explicação técnica</p><p className="mt-1">{i.technicalExplanation}</p></div>
                      <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Exemplo</p><p className="mt-1 rounded-md bg-muted p-3">{i.example}</p></div>
                      {i.related.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Conceitos relacionados</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {i.related.map((r) => bySlug.has(r) && <button key={r} type="button" onClick={() => jump(r)} className="rounded-full border px-2.5 py-0.5 text-xs hover:bg-accent">{bySlug.get(r)!.term}</button>)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}
