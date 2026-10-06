import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { StructureLab } from "@/features/labs/components/structure-lab";
import { listLabScenarios } from "@/features/labs/server/lab-service";
import { requireUserPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Market Structure Lab" };

export default async function Page({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const user = await requireUserPage("/labs/market-structure");
  const { scenario } = await searchParams;
  const scenarios = await listLabScenarios(user, "market-structure");
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Market Structure Lab</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">Identifica swings (HH, HL, LH, LL) e a estrutura do mercado. O sistema valida a tua resposta e explica o raciocínio.</p>
      </header>
      <StructureLab scenarios={scenarios.map((s) => ({ id: s.id, title: s.title, bestScore: s.bestScore }))} initialId={scenario} />
      <Disclaimer />
    </div>
  );
}
