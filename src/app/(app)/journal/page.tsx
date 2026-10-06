import type { Metadata } from "next";
import Link from "next/link";
import { NotebookPen, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JournalStats } from "@/features/journal/components/journal-stats";
import { EMOTION_LABEL } from "@/features/journal/schemas";
import { getStats, listEntries } from "@/features/journal/server/journal-service";
import { SESSION_LABEL, type SessionKey } from "@/features/sessions/logic/sessions";
import { requireUserPage } from "@/lib/auth/session";
import { formatR, formatUsd } from "@/lib/money";

export const metadata: Metadata = { title: "Trading Journal" };

export default async function JournalPage({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  const user = await requireUserPage("/journal");
  const { cursor } = await searchParams;
  const [stats, page] = await Promise.all([getStats(user), listEntries(user, { limit: 20, cursor: cursor && /^[A-Za-z0-9_-]{8,64}$/.test(cursor) ? cursor : undefined })]);

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Trading Journal</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">Regista, revê e aprende. O journal mede o teu processo — e mostra o que as emoções fazem aos teus resultados.</p>
        </div>
        <Button asChild><Link href="/journal/new"><Plus /> Nova entrada</Link></Button>
      </header>

      {stats.stats.trades === 0 && !cursor ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <NotebookPen className="size-8 text-muted-foreground" />
          <p className="font-medium">O teu journal está vazio</p>
          <p className="max-w-md text-sm text-muted-foreground">Fecha um trade no simulador e clica em “Journal” no histórico, ou cria uma entrada manualmente. As estatísticas aparecem depois da primeira entrada.</p>
          <Button asChild><Link href="/journal/new">Criar primeira entrada</Link></Button>
        </CardContent></Card>
      ) : (
        <>
          <JournalStats data={stats} />
          <section className="grid gap-2" aria-labelledby="entries-h">
            <h2 id="entries-h" className="text-lg font-semibold">Entradas</h2>
            <ul className="grid gap-2">
              {page.entries.map((e) => (
                <li key={e.id}>
                  <Link href={`/journal/${e.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-card px-4 py-3 transition-colors hover:border-primary/50">
                    <span className="w-28 text-sm tabular text-muted-foreground">{new Date(e.tradeDate).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "2-digit" })}</span>
                    <span className="font-medium">{e.instrument}</span>
                    <Badge variant={e.direction === "LONG" ? "success" : "danger"}>{e.direction}</Badge>
                    <span className="text-sm">{e.setup}</span>
                    <span className="hidden text-xs text-muted-foreground sm:inline">{EMOTION_LABEL[e.emotionalState as keyof typeof EMOTION_LABEL] ?? e.emotionalState}{e.session ? ` · ${SESSION_LABEL[e.session as SessionKey] ?? e.session}` : ""}</span>
                    <span className="ml-auto flex items-center gap-3">
                      {e.processRating !== null && <Badge variant="secondary">processo {e.processRating}/5</Badge>}
                      <span className={`tabular text-sm ${e.rMultiple >= 0 ? "text-success" : "text-danger"}`}>{formatR(e.rMultiple)}</span>
                      <span className={`w-24 text-right tabular font-medium ${e.result >= 0 ? "text-success" : "text-danger"}`}>{formatUsd(e.result)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {page.nextCursor && <Button asChild variant="outline" className="w-fit"><Link href={`/journal?cursor=${page.nextCursor}`}>Ver mais</Link></Button>}
          </section>
        </>
      )}
    </div>
  );
}
