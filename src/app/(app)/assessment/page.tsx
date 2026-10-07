import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { DemoBadge } from "@/components/brand/demo-badge";
import { AssessmentHome } from "@/features/assessment/components/assessment-home";
import { getOverview } from "@/features/assessment/server/assessment-service";
import { requireUserPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Avaliação final" };

export default async function AssessmentPage() {
  const user = await requireUserPage("/assessment");
  const overview = await getOverview(user);
  return (
    <div className="grid gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Avaliação final</h1>
          <DemoBadge />
        </div>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Um gráfico histórico que nunca viste e 12 passos de decisão. No fim, o sistema avalia a qualidade do teu processo — não se o trade ganhou ou perdeu.
        </p>
        <p className="mt-2 max-w-3xl text-sm italic text-muted-foreground">«O objetivo não é prever o mercado. O objetivo é construir um processo de decisão repetível.»</p>
      </header>
      <AssessmentHome overview={overview} />
      <Disclaimer withFutures />
    </div>
  );
}
