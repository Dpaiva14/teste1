import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonList } from "@/features/admin/components/lesson-list";
import { ModuleForm } from "@/features/admin/components/module-form";
import { QuizEditor } from "@/features/admin/components/quiz-editor";
import { getModule } from "@/features/admin/server/content-service";
import { adminIdParams } from "@/features/admin/schemas";
import { orNotFound } from "@/lib/page-helpers";
import { SCENARIOS } from "@/modules/scenarios";

export const metadata: Metadata = { title: "Módulo" };

export default async function AdminModulePage({ params }: { params: Promise<{ id: string }> }) {
  const parsed = adminIdParams.safeParse(await params);
  if (!parsed.success) notFound();
  const m = await orNotFound(getModule(parsed.data.id));
  return (
    <div className="grid gap-6">
      <Link href="/admin/content" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Conteúdo</Link>
      <h2 className="text-xl font-semibold">Módulo {m.number} — {m.title}</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">Detalhes do módulo</CardTitle></CardHeader>
        <CardContent><ModuleForm module={m} /></CardContent>
      </Card>
      <LessonList moduleId={m.id} lessons={m.lessons} />
      <QuizEditor endpoint={`/api/admin/modules/${m.id}/quiz`} initial={m.quiz} scenarios={SCENARIOS.map((s) => ({ id: s.id, title: s.title }))} defaultTitle={`Quiz do módulo — ${m.title}`} />
    </div>
  );
}
