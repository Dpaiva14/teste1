import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot, Circle, Lock } from "lucide-react";
import { ModuleIcon } from "@/components/module-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getModuleDetail } from "@/features/academy/server/curriculum-service";
import { requireUserPage } from "@/lib/auth/session";
import { orNotFound } from "@/lib/page-helpers";

type Props = { params: Promise<{ module: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { module } = await params;
  return { title: `Módulo ${module}` };
}

const STATUS_ICON = {
  completed: <CheckCircle2 className="size-5 text-success" aria-label="Concluída" />,
  in_progress: <CircleDot className="size-5 text-primary" aria-label="Em curso" />,
  not_started: <Circle className="size-5 text-muted-foreground/60" aria-label="Por começar" />,
} as const;

export default async function ModulePage({ params }: Props) {
  const { module: slug } = await params;
  const user = await requireUserPage(`/academy/${slug}`);
  const detail = await orNotFound(getModuleDetail(user, slug));
  const m = detail.module;
  const pct = m.lessonCount ? Math.round((m.completedLessons / m.lessonCount) * 100) : 0;
  const first = detail.lessons.find((l) => l.status !== "completed") ?? detail.lessons[0];

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-[minmax(0,1fr)] gap-6">
      <nav aria-label="Localização" className="text-sm text-muted-foreground">
        <Link href="/academy" className="hover:text-foreground">Academy</Link> <span aria-hidden>›</span> Módulo {String(m.number).padStart(2, "0")}
      </nav>

      <header className="flex flex-wrap items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
          {detail.levelUnlocked ? <ModuleIcon name={m.icon} className="size-7" /> : <Lock className="size-7" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Nível {m.level} · {detail.levelTitle}</Badge>
            <Badge variant="secondary">{m.difficulty}</Badge>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {String(m.number).padStart(2, "0")} — {m.title}
          </h1>
          <p className="mt-1 text-muted-foreground">{m.summary}</p>
        </div>
      </header>

      {!detail.levelUnlocked ? (
        <Card className="border-warning/40">
          <CardContent className="flex items-start gap-3 p-5">
            <Lock className="mt-0.5 size-5 text-warning" />
            <div>
              <p className="font-medium">Este nível ainda está bloqueado</p>
              <p className="text-sm text-muted-foreground">Conclui pelo menos 80% das aulas do nível anterior para desbloqueares o Nível {m.level}.</p>
              <Button asChild variant="outline" size="sm" className="mt-3"><Link href="/academy">Ver o mapa do curso</Link></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="grid gap-2">
                <div className="flex justify-between text-sm"><span>{m.completedLessons} de {m.lessonCount} aulas concluídas</span><span className="tabular">{pct}%</span></div>
                <Progress value={pct} />
              </div>
              {first && (
                <Button asChild>
                  <Link href={`/academy/${m.slug}/${first.slug}`}>{m.completedLessons === 0 ? "Começar módulo" : m.completedLessons >= m.lessonCount ? "Rever módulo" : "Continuar"} <ArrowRight /></Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <section aria-labelledby="lessons-h" className="grid grid-cols-[minmax(0,1fr)] gap-2">
            <h2 id="lessons-h" className="text-lg font-semibold">Aulas</h2>
            <ol className="grid grid-cols-[minmax(0,1fr)] gap-2">
              {detail.lessons.map((l) => (
                <li key={l.id}>
                  <Link href={`/academy/${m.slug}/${l.slug}`} className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:border-primary/50 hover:bg-accent/30">
                    {STATUS_ICON[l.status]}
                    <span className="w-6 text-sm tabular text-muted-foreground">{l.number}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium leading-snug">{l.title}</span>
                      <span className="block truncate text-sm text-muted-foreground">{l.summary}</span>
                    </span>
                    {l.bestQuizScore !== null && <Badge variant={l.status === "completed" ? "success" : "secondary"}>{l.bestQuizScore}%</Badge>}
                    <span className="hidden text-xs text-muted-foreground sm:block">{l.minutes} min</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {m.quiz && (
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-semibold">Quiz do módulo</p>
                  <p className="text-sm text-muted-foreground">
                    Perguntas mistas (cálculo, gráficos, conceitos). Mínimo {m.quiz.passScore}% para passar.
                    {m.quiz.bestScore !== null && ` Melhor resultado: ${m.quiz.bestScore}%.`}
                  </p>
                </div>
                <Button asChild variant={m.quiz.passed ? "outline" : "default"}>
                  <Link href={`/academy/${m.slug}/quiz`}>{m.quiz.passed ? "Repetir quiz" : "Fazer quiz"} <ArrowRight /></Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
