import type { Metadata } from "next";
import { RiskCalculator } from "@/features/calculators/components/risk-calculator";
import { RewardRiskCalculator } from "@/features/calculators/components/rr-calculator";
import { Disclaimer } from "@/components/brand/disclaimer";

export const metadata: Metadata = { title: "Risk Calculator" };

export default function RiskCalculatorPage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Risk Calculator</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">Define o risco em dólares <strong>antes</strong> de pensares em contratos. O tamanho da posição resulta da distância ao stop — nunca o contrário.</p>
      </header>
      <RiskCalculator />
      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Reward : Risk</h2>
        <RewardRiskCalculator />
      </section>
      <Disclaimer withFutures />
    </div>
  );
}
