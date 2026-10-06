"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, errorMessage } from "@/lib/api-client";
import { lessonCreateSchema } from "../schemas";
import type { AdminLessonRow } from "../types";

export function LessonList({ moduleId, lessons }: { moduleId: string; lessons: AdminLessonRow[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ title: "", summary: "", content: "" });
  const [pending, setPending] = useState(false);

  async function move(id: string, direction: "up" | "down") {
    try {
      await api(`/api/admin/lessons/${id}/move`, { method: "POST", body: { direction } });
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  async function create() {
    const parsed = lessonCreateSchema.safeParse(f);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    setPending(true);
    try {
      const res = await api<{ lesson: { id: string } }>(`/api/admin/modules/${moduleId}/lessons`, { method: "POST", body: parsed.data });
      toast.success("Aula criada como rascunho.");
      router.push(`/admin/content/lessons/${res.lesson.id}`);
    } catch (e) {
      toast.error(errorMessage(e));
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Aulas ({lessons.length})</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setAdding((v) => !v)}>
          <Plus /> Nova aula
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {adding && (
          <div className="grid gap-3 rounded-lg border p-4">
            <Field label="Título" htmlFor="nl-title">
              <Input id="nl-title" value={f.title} maxLength={160} onChange={(e) => setF({ ...f, title: e.target.value })} />
            </Field>
            <Field label="Resumo" htmlFor="nl-summary">
              <Input id="nl-summary" value={f.summary} maxLength={400} onChange={(e) => setF({ ...f, summary: e.target.value })} />
            </Field>
            <Field label="Conteúdo (Markdown)" htmlFor="nl-content" hint="Podes refinar tudo na página da aula.">
              <Textarea id="nl-content" rows={4} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} />
            </Field>
            <Button className="w-fit" onClick={create} disabled={pending}>
              {pending && <Loader2 className="animate-spin" />} Criar rascunho
            </Button>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Perguntas</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((l, i) => (
              <TableRow key={l.id}>
                <TableCell className="tabular text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">{l.title}</TableCell>
                <TableCell className="space-x-1">
                  <Badge variant={l.published ? "success" : "warning"}>{l.published ? "publicada" : "rascunho"}</Badge>
                  <Badge variant="outline">{l.managedBySeed ? "código" : "admin"}</Badge>
                </TableCell>
                <TableCell className="text-right tabular">{l.questions}</TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button size="icon-sm" variant="ghost" aria-label={`Subir ${l.title}`} disabled={i === 0} onClick={() => move(l.id, "up")}>
                    <ArrowUp />
                  </Button>
                  <Button size="icon-sm" variant="ghost" aria-label={`Descer ${l.title}`} disabled={i === lessons.length - 1} onClick={() => move(l.id, "down")}>
                    <ArrowDown />
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/content/lessons/${l.id}`}>
                      <Pencil /> Editar
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
