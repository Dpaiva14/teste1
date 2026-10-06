import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Attachments, LessonForm } from "@/features/admin/components/lesson-form";
import { QuizEditor } from "@/features/admin/components/quiz-editor";
import { adminIdParams } from "@/features/admin/schemas";
import { getLesson } from "@/features/admin/server/content-service";
import { orNotFound } from "@/lib/page-helpers";
import { SCENARIOS } from "@/modules/scenarios";

export const metadata: Metadata = { title: "Aula" };

export default async function AdminLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const parsed = adminIdParams.safeParse(await params);
  if (!parsed.success) notFound();
  const l = await orNotFound(getLesson(parsed.data.id));
  return (
    <div className="grid gap-6">
      <Link href={`/admin/content/${l.moduleId}`} className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {l.moduleTitle}
      </Link>
      <h2 className="text-xl font-semibold">Aula {l.number} — {l.title}</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">Conteúdo da aula</CardTitle></CardHeader>
        <CardContent><LessonForm lesson={l} /></CardContent>
      </Card>
      <Attachments lesson={l} />
      <QuizEditor endpoint={`/api/admin/lessons/${l.id}/quiz`} initial={l.quiz} scenarios={SCENARIOS.map((s) => ({ id: s.id, title: s.title }))} defaultTitle={`Quiz — ${l.title}`} />
    </div>
  );
}
