import type { Metadata } from "next";
import { PositionSizeFutures } from "@/features/calculators/components/position-size-futures";
import { Disclaimer } from "@/components/brand/disclaimer";

export const metadata: Metadata = { title: "Position Size YM / MYM" };

export default function PositionSizePage() {
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Position Size — YM & MYM</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">Calcula o número máximo de contratos que respeita o teu risco. O resultado vem sempre acompanhado do <strong>risco financeiro</strong> que lhe corresponde.</p>
      </header>
      <PositionSizeFutures />
      <Disclaimer withFutures />
    </div>
  );
}
