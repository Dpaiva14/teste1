import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { DemoBadge } from "@/components/brand/demo-badge";
import { ReplayHome } from "@/features/replay/components/replay-home";
import { listReplays } from "@/features/replay/server/replay-service";
import { requireUserPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Chart Replay" };

export default async function ReplayPage() {
  const user = await requireUserPage("/labs/replay");
  const items = await listReplays(user);
  return (
    <div className="grid gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Chart Replay</h1>
          <DemoBadge />
        </div>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Reproduz o mercado barra a barra, marca níveis, zonas, tendência e Fibonacci, e opera com o mesmo motor do simulador. No fim, a avaliação julga o teu processo — não o resultado.
        </p>
      </header>
      <ReplayHome items={items} />
      <Disclaimer withFutures />
    </div>
  );
}
