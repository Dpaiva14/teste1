import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyPlanForm } from "@/features/daily-plan/components/daily-plan-form";
import { DatePicker } from "@/features/daily-plan/components/date-picker";
import { getPlan, planHistory } from "@/features/daily-plan/server/daily-plan-service";
import { listEvents } from "@/features/economic-calendar/server/calendar-service";
import { dayKey } from "@/features/gamification/logic/streak";
import { requireUserPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Daily Trading Plan" };
export const dynamic = "force-dynamic";

export default async function DailyPlanPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await requireUserPage("/tools/daily-plan");
  const { date: q } = await searchParams;
  const today = dayKey(new Date(), user.timezone);
  const date = q && /^\d{4}-\d{2}-\d{2}$/.test(q) ? q : today;
  const [plan, history, events] = await Promise.all([
    getPlan(user, date),
    planHistory(user),
    listEvents(new Date(`${date}T00:00:00Z`), new Date(`${date}T23:59:59Z`)),
  ]);
  const { reviewed, followed } = history.adherence;

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Daily Trading Plan</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">Decide <strong>antes</strong> da sessão: viés, níveis, eventos, o que tem de acontecer, o que invalida e quanto estás disposto a arriscar.</p>
        </div>
        <DatePicker value={date} today={today} />
      </header>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <DailyPlanForm key={date} date={date} plan={plan} suggestedEvents={events.filter((e) => e.impact !== "LOW").map((e) => e.title.replace(/ — DEMO$/, ""))} />
        <aside className="grid content-start gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Adesão ao plano</CardTitle></CardHeader>
            <CardContent className="text-sm">
              {reviewed === 0 ? <p className="text-muted-foreground">Ainda sem revisões. Preenche a revisão do fim do dia.</p> : <p><strong className="text-2xl tabular">{Math.round((followed / reviewed) * 100)}%</strong> <span className="text-muted-foreground">dos últimos {reviewed} dias revistos em que seguiste o plano.</span></p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Planos recentes</CardTitle></CardHeader>
            <CardContent className="grid gap-1.5 text-sm">
              {history.plans.length === 0 ? <p className="text-muted-foreground">Sem planos guardados.</p> : history.plans.map((p) => (
                <Link key={p.date} href={`/tools/daily-plan?date=${p.date}`} className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-accent">
                  <span className="tabular">{p.date}</span>
                  <span className="flex gap-1.5"><Badge variant="outline">{p.bias}</Badge>{p.followedPlan === true && <Badge variant="success">seguido</Badge>}{p.followedPlan === false && <Badge variant="danger">não seguido</Badge>}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
