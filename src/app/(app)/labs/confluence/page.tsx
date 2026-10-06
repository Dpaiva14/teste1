import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { ConfluenceLab } from "@/features/labs/components/confluence-lab";
import { listLabScenarios } from "@/features/labs/server/lab-service";
import { requireUserPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Confluence Lab" };

export default async function Page({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const user = await requireUserPage("/labs/confluence");
  const { scenario } = await searchParams;
  const scenarios = await listLabScenarios(user, "confluence");
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Confluence Lab</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">Analisa um ponto de decisão: que fatores sustentam a ideia? Avalia o processo — e só depois vê o que aconteceu.</p>
      </header>
      <ConfluenceLab scenarios={scenarios.map((s) => ({ id: s.id, title: s.title, bestScore: s.bestScore }))} initialId={scenario} />
      <Disclaimer />
    </div>
  );
}
