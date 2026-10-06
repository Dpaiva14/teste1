import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { LevelsLab } from "@/features/labs/components/levels-lab";
import { listLabScenarios } from "@/features/labs/server/lab-service";
import { requireUserPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Draw Your Levels" };

export default async function Page({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const user = await requireUserPage("/labs/levels");
  const { scenario } = await searchParams;
  const scenarios = await listLabScenarios(user, "levels");
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Draw Your Levels</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">Desenha zonas de suporte e resistência e compara com uma solução educativa. Zonas, não linhas exatas.</p>
      </header>
      <LevelsLab scenarios={scenarios.map((s) => ({ id: s.id, title: s.title, bestScore: s.bestScore }))} initialId={scenario} />
      <Disclaimer />
    </div>
  );
}
