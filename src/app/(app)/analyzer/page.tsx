import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { AnalyzerPanel } from "@/features/ai/components/analyzer-panel";
import { aiConfigured } from "@/features/ai/server/ai-client";
import { listAnalyzerScenarios } from "@/features/ai/server/analyzer-service";
import { requireUserPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "AI Chart Analyzer" };

export default async function AnalyzerPage() {
  const user = await requireUserPage("/analyzer");
  const scenarios = await listAnalyzerScenarios();
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">AI Chart Analyzer</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">
          Estrutura, níveis, ATR e cenários condicionais calculados de forma objetiva sobre cenários DEMO — e, com IA ativa, a análise de um screenshot teu. Linguagem probabilística, sem sinais.
        </p>
      </header>
      <AnalyzerPanel scenarios={scenarios} aiConfigured={aiConfigured()} isAdmin={user.role === "ADMIN"} />
      <Disclaimer withFutures />
    </div>
  );
}
