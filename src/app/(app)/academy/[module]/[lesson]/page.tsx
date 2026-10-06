import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDot, Circle, Clock, Lock, Sparkles } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { ModuleIcon } from "@/components/module-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExerciseRenderer } from "@/features/academy/components/exercise-renderer";
import { LessonTracker } from "@/features/academy/components/lesson-tracker";
import { LessonVisual } from "@/features/academy/components/lesson-visual";
import { QuizPlayer } from "@/features/academy/components/quiz-player";
import { CompleteLessonButton } from "@/features/academy/components/complete-lesson-button";
import { getLessonDetail, getModuleDetail } from "@/features/academy/server/curriculum-service";
import { requireUserPage } from "@/lib/auth/session";
import { HttpError } from "@/lib/errors";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ module: string; lesson: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lesson } = await params;
  return { title: `Aula · ${lesson.replace(/-/g, " ")}` };
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="mb-3 text-lg font-semibold tracking-tight">{children}</h2>;
}

export default async function LessonPage({ params }: Props) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const user = await requireUserPage(`/academy/${moduleSlug}/${lessonSlug}`);

  let lesson;
  let moduleDetail;
  try {
    [lesson, moduleDetail] = await Promise.all([getLessonDetail(user, moduleSlug, lessonSlug), getModuleDetail(user, moduleSlug)]);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }

  if ("locked" in lesson) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="border-warning/40">
          <CardContent className="flex items-start gap-3 p-6">
            <Lock className="mt-0.5 size-5 text-warning" />
            <div>
              <h1 className="font-semibold">Nível {lesson.level} bloqueado</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                “{lesson.moduleTitle}” faz parte de um nível que ainda não desbloqueaste. Conclui pelo menos 80% das aulas do nível anterior.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3"><Link href="/academy">Ver o mapa do curso</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const m = lesson.module;
  const hasQuiz = Boolean(lesson.quiz);
  const completed = lesson.status === "completed";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <LessonTracker lessonId={lesson.id} />
      <article className="mx-auto w-full min-w-0 max-w-3xl">
        {/* 1 — Header */}
        <header className="grid gap-3 border-b pb-6">
          <nav aria-label="Localização" className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <Link href="/academy" className="hover:text-foreground">Academy</Link><span aria-hidden>›</span>
            <Link href={`/academy/${m.slug}`} className="flex items-center gap-1.5 hover:text-foreground">
              <ModuleIcon name={m.icon} className="size-3.5" /> Módulo {String(m.number).padStart(2, "0")} · {m.title}
            </Link>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Aula {lesson.number} de {m.lessonCount}</p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">{lesson.title}</h1>
          <p className="text-lg text-muted-foreground">{lesson.summary}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{lesson.difficulty}</Badge>
            <Badge variant="outline"><Clock /> {lesson.estimatedMinutes} min</Badge>
            <Badge variant="outline"><Sparkles /> {lesson.xpReward} XP</Badge>
            {completed && <Badge variant="success"><CheckCircle2 /> Concluída</Badge>}
          </div>
        </header>

        <div className="grid gap-10 pt-8">
          {/* 2 — Main content */}
          <section aria-labelledby="s-content">
            <SectionTitle id="s-content">Explicação</SectionTitle>
            <Markdown>{lesson.content}</Markdown>
            {lesson.videoUrl && (
              <div className="mt-6 aspect-video overflow-hidden rounded-lg border">
                <iframe
                  src={lesson.videoUrl}
                  title={`Vídeo: ${lesson.title}`}
                  className="size-full"
                  allow="encrypted-media; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                />
              </div>
            )}
            {lesson.assets.length > 0 && (
              <ul className="mt-6 grid gap-1 text-sm">
                {lesson.assets.map((a) => (
                  <li key={a.id}>
                    <a className="text-primary underline underline-offset-4" href={`/api/files/${a.id}`} target="_blank" rel="noopener noreferrer">
                      {a.kind === "PDF" ? "📄" : "🖼️"} {a.filename}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 3 — Visual */}
          {lesson.visual && (
            <section aria-labelledby="s-visual">
              <SectionTitle id="s-visual">Visual</SectionTitle>
              <LessonVisual spec={lesson.visual} />
            </section>
          )}

          {/* 4 — Example */}
          {lesson.example && (
            <section aria-labelledby="s-example">
              <SectionTitle id="s-example">Exemplo</SectionTitle>
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
                <Markdown>{lesson.example}</Markdown>
              </div>
            </section>
          )}

          {/* 5 — Practice */}
          {lesson.exercise && (
            <section aria-labelledby="s-practice">
              <SectionTitle id="s-practice">Prática</SectionTitle>
              <ExerciseRenderer spec={lesson.exercise} lessonId={lesson.id} />
            </section>
          )}

          {/* 6 — Quiz */}
          {lesson.quiz && (
            <section aria-labelledby="s-quiz">
              <SectionTitle id="s-quiz">Quiz</SectionTitle>
              <QuizPlayer quiz={lesson.quiz} />
            </section>
          )}

          {/* 7 — Key takeaways */}
          <section aria-labelledby="s-take">
            <SectionTitle id="s-take">Key takeaways</SectionTitle>
            <ul className="grid gap-2">
              {lesson.takeaways.map((t) => (
                <li key={t} className="flex gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 8 — Next lesson */}
          <nav aria-label="Navegação entre aulas" className="grid gap-3 border-t pt-6 sm:grid-cols-2">
            {!hasQuiz && !completed && (
              <div className="sm:col-span-2"><CompleteLessonButton lessonId={lesson.id} /></div>
            )}
            {lesson.prev ? (
              <Button asChild variant="outline" className="h-auto justify-start py-3">
                <Link href={`/academy/${lesson.prev.moduleSlug}/${lesson.prev.slug}`}>
                  <ArrowLeft /><span className="text-left"><span className="block text-xs text-muted-foreground">Anterior</span>{lesson.prev.title}</span>
                </Link>
              </Button>
            ) : <span />}
            {lesson.next ? (
              <Button asChild className="h-auto justify-end py-3">
                <Link href={`/academy/${lesson.next.moduleSlug}/${lesson.next.slug}`}>
                  <span className="text-right"><span className="block text-xs opacity-80">Próxima aula</span>{lesson.next.title}</span><ArrowRight />
                </Link>
              </Button>
            ) : lesson.moduleQuizId ? (
              <Button asChild className="h-auto justify-end py-3">
                <Link href={`/academy/${m.slug}/quiz`}><span className="text-right"><span className="block text-xs opacity-80">Fim do módulo</span>Fazer o quiz do módulo</span><ArrowRight /></Link>
              </Button>
            ) : lesson.nextModule ? (
              <Button asChild className="h-auto justify-end py-3">
                <Link href={`/academy/${lesson.nextModule.slug}`}><span className="text-right"><span className="block text-xs opacity-80">Próximo módulo</span>{lesson.nextModule.number}. {lesson.nextModule.title}</span><ArrowRight /></Link>
              </Button>
            ) : <span />}
          </nav>
        </div>
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-20 grid max-h-[calc(100dvh-6rem)] gap-1 overflow-y-auto rounded-xl border bg-card/50 p-3 scrollbar-thin">
          <p className="px-2 pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Neste módulo</p>
          {moduleDetail.lessons.map((l) => (
            <Link
              key={l.id}
              href={`/academy/${m.slug}/${l.slug}`}
              aria-current={l.slug === lesson.slug ? "page" : undefined}
              className={cn("flex items-start gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground", l.slug === lesson.slug && "bg-primary/12 font-medium text-foreground")}
            >
              {l.status === "completed" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : l.status === "in_progress" ? <CircleDot className="mt-0.5 size-4 shrink-0 text-primary" /> : <Circle className="mt-0.5 size-4 shrink-0 opacity-50" />}
              <span className="leading-snug">{l.number}. {l.title}</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
