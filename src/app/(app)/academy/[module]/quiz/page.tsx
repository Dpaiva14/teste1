import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { QuizPlayer } from "@/features/academy/components/quiz-player";
import { getModuleDetail } from "@/features/academy/server/curriculum-service";
import { requireUserPage } from "@/lib/auth/session";
import { HttpError } from "@/lib/errors";

export const metadata: Metadata = { title: "Quiz do módulo" };

export default async function ModuleQuizPage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  const user = await requireUserPage(`/academy/${slug}/quiz`);
  let detail;
  try {
    detail = await getModuleDetail(user, slug);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
  if (!detail.levelUnlocked) redirect(`/academy/${slug}`);
  if (!detail.moduleQuiz) notFound();
  const m = detail.module;
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <nav aria-label="Localização" className="text-sm text-muted-foreground">
        <Link href="/academy" className="hover:text-foreground">Academy</Link> <span aria-hidden>›</span>{" "}
        <Link href={`/academy/${m.slug}`} className="hover:text-foreground">Módulo {String(m.number).padStart(2, "0")}</Link>
      </nav>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{detail.moduleQuiz.title}</h1>
        <p className="mt-1 text-muted-foreground">{detail.moduleQuiz.questions.length} perguntas · mínimo {detail.moduleQuiz.passScore}% · podes repetir quantas vezes quiseres.</p>
      </header>
      <QuizPlayer quiz={detail.moduleQuiz} />
    </div>
  );
}
