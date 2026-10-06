import type { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarView } from "@/features/economic-calendar/components/calendar-view";
import { listEvents } from "@/features/economic-calendar/server/calendar-service";
import { requireUserPage } from "@/lib/auth/session";
import { NEWS_RISKS } from "@/modules/event-education";
import { Info } from "lucide-react";

export const metadata: Metadata = { title: "Calendário económico" };
export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await requireUserPage("/tools/economic-calendar");
  const events = await listEvents();
  const demo = events.some((e) => e.isDemo);
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Calendário económico</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">Eventos classificados em <strong>LOW</strong>, <strong>MEDIUM</strong>, <strong>HIGH</strong> e <strong>EXTREME</strong> pelo impacto típico no Dow.</p>
      </header>
      {demo && (
        <Alert variant="warning"><Info /><AlertTitle>Eventos de demonstração</AlertTitle><AlertDescription>Os eventos marcados DEMO são ilustrativos, com datas fictícias. Um administrador pode inserir os eventos reais (a partir das fontes oficiais) no painel de administração.</AlertDescription></Alert>
      )}
      <CalendarView events={events} timezone={user.timezone} />
      <Card>
        <CardHeader><CardTitle className="text-base">“Não negociar durante notícias” não é uma regra universal</CardTitle></CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <p>Alguns traders evitam notícias; outros especializam-se nelas. O que importa é perceber os <strong>custos e riscos</strong> e decidir conscientemente — com o stop e o tamanho ajustados:</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {NEWS_RISKS.map((r) => <li key={r.title} className="rounded-lg border bg-muted/30 p-3"><p className="font-medium">{r.title}</p><p className="text-muted-foreground">{r.text}</p></li>)}
          </ul>
          <p className="text-muted-foreground">Se decidires não operar à volta de um evento, regista-o no plano diário. Se decidires operar, aceita que o risco real pode exceder o previsto.</p>
        </CardContent>
      </Card>
    </div>
  );
}
