import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { SessionClock } from "@/features/sessions/components/session-clock";
import { requireUserPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sessões de mercado" };

export default async function SessionsPage() {
  const user = await requireUserPage("/tools/sessions");
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Sessões de mercado</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">Londres, Nova Iorque, abertura do cash market e RTH — convertidos automaticamente para o teu fuso horário.</p>
      </header>
      <SessionClock savedTimezone={user.timezone} />
      <Card><CardContent className="grid gap-2 p-5 text-sm">
        <p className="font-semibold">Porque é que as sessões importam no Dow</p>
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          <li><strong className="text-foreground">Ásia:</strong> menor volume nos índices americanos; o preço tende a andar mais devagar.</li>
          <li><strong className="text-foreground">Londres:</strong> sobe a atividade; o máximo e mínimo desta sessão são frequentemente usados como referência.</li>
          <li><strong className="text-foreground">Pré-mercado e dados às 08:30 ET:</strong> muitos dados económicos dos EUA saem antes da abertura.</li>
          <li><strong className="text-foreground">Abertura de NY (09:30 ET):</strong> volume e volatilidade tendem a ser mais altos; spreads e slippage também.</li>
          <li><strong className="text-foreground">Meio do dia:</strong> pode abrandar; <strong className="text-foreground">fecho (16:00 ET):</strong> o volume volta a subir.</li>
        </ul>
        <p className="text-xs text-muted-foreground">São tendências gerais, não regras: cada dia é diferente.</p>
      </CardContent></Card>
    </div>
  );
}
