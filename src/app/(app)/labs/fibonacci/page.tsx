import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { FibonacciLab } from "@/features/labs/components/fibonacci-lab";
import { listLabScenarios } from "@/features/labs/server/lab-service";
import { requireUserPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Fibonacci Lab" };

export default async function Page({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const user = await requireUserPage("/labs/fibonacci");
  const { scenario } = await searchParams;
  const scenarios = await listLabScenarios(user, "fibonacci");
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Fibonacci Lab</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">Escolhe os swings certos, mede o retracement e explora extensões e projeções. Os níveis são zonas a estudar, não garantias.</p>
      </header>
      <FibonacciLab scenarios={scenarios.map((s) => ({ id: s.id, title: s.title, bestScore: s.bestScore }))} initialId={scenario} />
      <Disclaimer />
    </div>
  );
}
