import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JournalForm } from "@/features/journal/components/journal-form";
import { prefillFromTrade } from "@/features/journal/server/journal-service";
import { requireUserPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Nova entrada · Journal" };

export default async function NewJournalPage({ searchParams }: { searchParams: Promise<{ trade?: string }> }) {
  const user = await requireUserPage("/journal/new");
  const { trade } = await searchParams;
  let prefill;
  if (trade && /^[A-Za-z0-9_-]{8,64}$/.test(trade)) {
    const p = await prefillFromTrade(user, trade);
    if (p && "existingEntryId" in p) redirect(`/journal/${p.existingEntryId}`);
    prefill = p ?? undefined;
  }
  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <header>
        <p className="text-sm text-muted-foreground"><Link href="/journal" className="hover:text-foreground">Journal</Link> › Nova entrada</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Nova entrada</h1>
        {prefill && <p className="mt-1 text-sm text-muted-foreground">Preenchida a partir do teu trade simulado — completa a parte do processo.</p>}
      </header>
      <JournalForm initial={{ tradeId: prefill && "tradeId" in prefill ? (prefill.tradeId as string) : null, prefill: prefill as never }} />
    </div>
  );
}
