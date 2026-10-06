import type { Metadata } from "next";
import Link from "next/link";
import { JournalForm } from "@/features/journal/components/journal-form";
import { getEntry } from "@/features/journal/server/journal-service";
import { requireUserPage } from "@/lib/auth/session";
import { orNotFound } from "@/lib/page-helpers";

export const metadata: Metadata = { title: "Entrada · Journal" };

export default async function JournalEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUserPage(`/journal/${id}`);
  const entry = await orNotFound(getEntry(user, id));
  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <header>
        <p className="text-sm text-muted-foreground"><Link href="/journal" className="hover:text-foreground">Journal</Link> › Entrada</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{entry.instrument} {entry.direction === "LONG" ? "Long" : "Short"} · {entry.setup}</h1>
      </header>
      <JournalForm initial={{ entry }} />
    </div>
  );
}
