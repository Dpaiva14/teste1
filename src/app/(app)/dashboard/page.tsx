import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, Calculator, CalendarDays, ChartCandlestick, Check, Flame, GraduationCap, History, Layers, NotebookPen, Percent, Shapes, BookOpen, Sparkles } from "lucide-react";
import { Disclaimer } from "@/components/brand/disclaimer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Stat } from "@/components/ui/stat";
import { getDashboard } from "@/features/dashboard/server/dashboard-service";
import { requireUserPage } from "@/lib/auth/session";
import { BRAND } from "@/modules/brand";
import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/money";

export const metadata: Metadata = { title: "Dashboard" };

const IMPACT_VARIANT = { LOW: "secondary", MEDIUM: "default", HIGH: "warning", EXTREME: "danger" } as const;

export default async function DashboardPage() {
  const user = await requireUserPage("/dashboard");
  const d = await getDashboard(user);
  const t = d.curriculum.totals;
  const pct = t.lessons ? Math.round((t.completedLessons / t.lessons) * 100) : 0;
  const next = d.curriculum.nextLesson;

  const shortcuts = [
    { href: next ? `/academy/${next.moduleSlug}/${next.lessonSlug}` : "/academy", label: "Continuar curso", icon: GraduationCap, primary: true },
    { href: "/labs/market-structure", label: "Market Structure Lab", icon: ChartCandlestick },
    { href: "/labs/fibonacci", label: "Fibonacci Lab", icon: Percent },
    { href: "/labs/confluence", label: "Confluence Lab", icon: Layers },
    { href: "/labs/replay", label: "Chart Replay", icon: History },
    { href: "/journal", label: "Trading Journal", icon: NotebookPen },
    { href: "/tools/risk-calculator", label: "Risk Calculator", icon: Calculator },
    { href: "/tools/economic-calendar", label: "Economic Calendar", icon: CalendarDays },
    { href: "/glossary", label: "Glossário", icon: BookOpen },
    { href: "/simulator", label: "Simulador", icon: Shapes },
  ];

  return (
    <div className="grid gap-6">
      <header className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Bem-vindo de volta</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Olá, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">“{BRAND.principle}”</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <div>
              <p className="text-sm font-semibold leading-none">{d.rank.current.title}</p>
              <p className="mt-1 text-xs text-muted-foreground tabular">{d.xp.toLocaleString("pt-PT")} XP{d.rank.xpForNext !== null && ` · faltam ${d.rank.xpForNext} para ${d.rank.next?.title}`}</p>
            </div>
          </div>
          <div className="w-32"><Progress value={d.rank.percent} aria-label="Progresso para o próximo rank" /></div>
          <div className="flex items-center gap-1 border-l pl-3 text-sm font-semibold tabular" title={`Melhor sequência: ${d.longestStreak} dias`}>
            <Flame className={cn("size-4", d.streak > 0 ? "text-warning" : "text-muted-foreground")} /> {d.streak}
          </div>
        </div>
      </header>

      <section aria-labelledby="progress-h" className="grid gap-4">
        <h2 id="progress-h" className="sr-only">Progresso</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <Stat className="xl:col-span-2" label="Curso concluído" value={`${pct}%`} tone="primary" hint={`${t.completedLessons} de ${t.lessons} aulas`} />
          <Stat label="Módulos" value={`${t.completedModules}/${t.modules}`} />
          <Stat label="Aulas" value={t.completedLessons} />
          <Stat label="Quizzes" value={`${t.quizzesPassed}/${t.quizzesTotal}`} hint="de módulo" />
          <Stat label="Score médio" value={t.averageScore !== null ? `${t.averageScore}%` : "—"} />
          <Stat label="Nível atual" value={`${d.currentLevel.level}/10`} hint={d.currentLevel.title} />
        </div>
        <Progress value={pct} aria-label="Progresso total do curso" />
      </section>

      {next && (
        <Card className="border-primary/40 bg-gradient-to-r from-primary/10 to-transparent">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Continuar onde ficaste</p>
              <p className="mt-1 text-lg font-semibold">{next.lessonTitle}</p>
              <p className="text-sm text-muted-foreground">Módulo {String(next.moduleNumber).padStart(2, "0")} · {next.moduleTitle}</p>
            </div>
            <Button asChild size="lg"><Link href={`/academy/${next.moduleSlug}/${next.lessonSlug}`}>Continuar <ArrowRight /></Link></Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Your Trading Development</CardTitle></CardHeader>
        <CardContent>
          <ol className="grid gap-2 sm:grid-cols-5" aria-label="Etapas de desenvolvimento">
            {d.stages.map((s, i) => (
              <li key={s.name} className="relative flex items-center gap-2 sm:flex-col sm:items-start" aria-current={s.state === "current" ? "step" : undefined}>
                <div className="flex w-full items-center gap-2">
                  <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold", s.state === "done" && "border-success bg-success/20 text-success", s.state === "current" && "border-primary bg-primary text-primary-foreground", s.state === "upcoming" && "text-muted-foreground")}>
                    {s.state === "done" ? <Check className="size-4" /> : i + 1}
                  </span>
                  {i < d.stages.length - 1 && <span className={cn("hidden h-px flex-1 sm:block", s.state === "done" ? "bg-success/60" : "bg-border")} />}
                </div>
                <span className={cn("text-sm", s.state === "current" ? "font-semibold" : "text-muted-foreground")}>{s.name}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">Nível {d.currentLevel.level} — {d.currentLevel.title}: {d.currentLevel.tagline}</p>
        </CardContent>
      </Card>

      <section aria-labelledby="shortcuts-h" className="grid gap-3">
        <h2 id="shortcuts-h" className="text-lg font-semibold">Atalhos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {shortcuts.map((s) => (
            <Link key={s.label} href={s.href} className={cn("group flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/30", s.primary && "border-primary/40 bg-primary/10")}>
              <s.icon className="size-5 shrink-0 text-primary" />
              <span className="text-sm font-medium leading-tight">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4" /> Próximos eventos de alto impacto</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {d.events.length === 0 ? <p className="text-sm text-muted-foreground">Sem eventos de alto impacto registados.</p> : d.events.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 truncate">{e.title}</span>
                <Badge variant={IMPACT_VARIANT[e.impact]}>{e.impact}</Badge>
              </div>
            ))}
            {d.events.some((e) => e.isDemo) && <p className="text-xs text-warning">Eventos ILUSTRATIVOS (DEMO) — não são datas reais.</p>}
            <Button asChild variant="ghost" size="sm" className="w-fit"><Link href="/tools/economic-calendar">Ver calendário <ArrowRight /></Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Award className="size-4" /> Conquistas ({d.achievements.length}/{d.achievementsTotal})</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {d.achievements.length === 0 ? <p className="text-sm text-muted-foreground">Ainda sem conquistas. A primeira aula desbloqueia a primeira.</p> : d.achievements.map((a) => (
              <div key={a.def!.key} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-success" /><span><strong>{a.def!.title}</strong><span className="block text-xs text-muted-foreground">{a.def!.description}</span></span></div>
            ))}
            <Button asChild variant="ghost" size="sm" className="w-fit"><Link href="/profile">Ver todas <ArrowRight /></Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Shapes className="size-4" /> Prática</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p className="flex justify-between"><span className="text-muted-foreground">Exercícios nos labs</span><span className="tabular">{d.exerciseAttempts}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Entradas no journal</span><span className="tabular">{d.journalCount}</span></p>
            <p className="flex justify-between"><span className="text-muted-foreground">Conta de simulação</span><span className="tabular">{d.account ? formatUsd(d.account.balance) : "—"}</span></p>
            <p className="text-xs text-muted-foreground">Não somamos XP por número de trades: só por estudar, rever e esperar.</p>
          </CardContent>
        </Card>
      </div>

      <Disclaimer />
    </div>
  );
}
