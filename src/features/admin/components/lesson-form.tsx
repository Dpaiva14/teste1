"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FileText, ImageIcon, Loader2, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/markdown";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { api, errorMessage, uploadFile } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { lessonUpdateSchema } from "../schemas";
import type { AdminLessonDetail } from "../types";

const DIFFICULTIES = ["BEGINNER", "FOUNDATION", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"] as const;

export function LessonForm({ lesson: l }: { lesson: AdminLessonDetail }) {
  const router = useRouter();
  const [f, setF] = useState({
    title: l.title,
    summary: l.summary,
    difficulty: l.difficulty,
    content: l.content,
    example: l.example ?? "",
    takeaways: l.takeaways.join("\n"),
    videoUrl: l.videoUrl ?? "",
    estimatedMinutes: String(l.estimatedMinutes),
    xpReward: String(l.xpReward),
    published: l.published,
  });
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  async function save() {
    const parsed = lessonUpdateSchema.safeParse({
      ...f,
      example: f.example.trim() || null,
      takeaways: f.takeaways.split("\n").map((t) => t.trim()).filter(Boolean),
      videoUrl: f.videoUrl.trim() || null,
      estimatedMinutes: Number(f.estimatedMinutes),
      xpReward: Number(f.xpReward),
    });
    if (!parsed.success) return setProblems(parsed.error.issues.slice(0, 6).map((i) => `${String(i.path[0] ?? "")}: ${i.message}`));
    setProblems([]);
    setPending(true);
    try {
      // Send the ORIGINAL strings: the server normalises the video URL itself (single source of truth).
      await api(`/api/admin/lessons/${l.id}`, { method: "PATCH", body: { ...parsed.data, videoUrl: f.videoUrl.trim() || null } });
      toast.success("Aula guardada.");
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!confirm("Apagar esta aula, o seu quiz e os anexos? Não é possível desfazer.")) return;
    try {
      await api(`/api/admin/lessons/${l.id}`, { method: "DELETE" });
      toast.success("Aula apagada.");
      router.replace(`/admin/content/${l.moduleId}`);
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <div className="grid gap-4">
      {l.managedBySeed && (
        <Alert variant="info">
          <AlertDescription>Esta aula é gerida pelo código (seed). Ao guardar, passa a ser gerida aqui e um novo seed deixa de a sobrescrever.</AlertDescription>
        </Alert>
      )}
      {(l.hasVisual || l.hasExercise) && (
        <p className="text-xs text-muted-foreground">
          O {l.hasVisual && "visual"}
          {l.hasVisual && l.hasExercise && " e o "}
          {l.hasExercise && "exercício interativo"} desta aula são definidos em código (<code>src/modules</code>) e mantêm-se ao guardar.
        </p>
      )}
      {problems.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-disc pl-4">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Field label="Título" htmlFor="l-title">
        <Input id="l-title" value={f.title} maxLength={160} onChange={(e) => setF({ ...f, title: e.target.value })} />
      </Field>
      <Field label="Resumo" htmlFor="l-summary">
        <Input id="l-summary" value={f.summary} maxLength={400} onChange={(e) => setF({ ...f, summary: e.target.value })} />
      </Field>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="l-content" className="text-sm font-medium">
            Conteúdo (Markdown)
          </label>
          <Button type="button" size="sm" variant="ghost" onClick={() => setPreview((v) => !v)}>
            {preview ? "Editar" : "Pré-visualizar"}
          </Button>
        </div>
        {preview ? (
          <div className="min-h-40 rounded-md border p-4">
            <Markdown>{f.content}</Markdown>
          </div>
        ) : (
          <Textarea id="l-content" rows={14} value={f.content} maxLength={30000} onChange={(e) => setF({ ...f, content: e.target.value })} className="font-mono text-xs" />
        )}
        <p className="text-xs text-muted-foreground">HTML não é permitido (é ignorado). Links apenas http(s), mailto ou relativos.</p>
      </div>

      <Field label="Exemplo prático (Markdown, opcional)" htmlFor="l-example">
        <Textarea id="l-example" rows={5} value={f.example} maxLength={10000} onChange={(e) => setF({ ...f, example: e.target.value })} className="font-mono text-xs" />
      </Field>
      <Field label="Pontos-chave (um por linha, 1–8)" htmlFor="l-take">
        <Textarea id="l-take" rows={4} value={f.takeaways} onChange={(e) => setF({ ...f, takeaways: e.target.value })} />
      </Field>
      <Field label="Vídeo (YouTube ou Vimeo, opcional)" htmlFor="l-video" hint="Cola o link normal; é convertido para o embed seguro. Outros domínios são recusados.">
        <Input id="l-video" value={f.videoUrl} maxLength={300} placeholder="https://www.youtube.com/watch?v=…" onChange={(e) => setF({ ...f, videoUrl: e.target.value })} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Dificuldade" htmlFor="l-diff">
          <select id="l-diff" value={f.difficulty} onChange={(e) => setF({ ...f, difficulty: e.target.value })} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Minutos" htmlFor="l-min">
          <Input id="l-min" inputMode="numeric" value={f.estimatedMinutes} onChange={(e) => setF({ ...f, estimatedMinutes: e.target.value })} />
        </Field>
        <Field label="XP ao concluir" htmlFor="l-xp">
          <Input id="l-xp" inputMode="numeric" value={f.xpReward} onChange={(e) => setF({ ...f, xpReward: e.target.value })} />
        </Field>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" className="accent-[var(--primary)]" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} /> Publicada
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} Guardar aula
        </Button>
        <Button variant="ghost" className="ml-auto" onClick={remove}>
          <Trash2 /> Apagar aula
        </Button>
      </div>
    </div>
  );
}

export function Attachments({ lesson }: { lesson: Pick<AdminLessonDetail, "id" | "assets"> }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      await uploadFile("/api/uploads", file, { lessonId: lesson.id });
      toast.success("Ficheiro anexado.");
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove(id: string) {
    if (!confirm("Remover este anexo?")) return;
    try {
      await api(`/api/admin/assets/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Anexos (PDF e imagens)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {lesson.assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem anexos. PDFs até 15 MB e imagens (PNG, JPEG, WEBP) até 5 MB; o tipo é verificado pelo conteúdo do ficheiro, não pela extensão.</p>
        ) : (
          <ul className="grid gap-1.5 text-sm">
            {lesson.assets.map((a) => (
              <li key={a.id} className={cn("flex items-center gap-2 rounded-md border px-3 py-1.5")}>
                {a.kind === "PDF" ? <FileText className="size-4 text-muted-foreground" aria-hidden /> : <ImageIcon className="size-4 text-muted-foreground" aria-hidden />}
                <a className="min-w-0 flex-1 truncate text-primary underline underline-offset-4" href={`/api/files/${a.id}`} target="_blank" rel="noopener noreferrer">
                  {a.filename}
                </a>
                <span className="tabular text-xs text-muted-foreground">{a.sizeBytes < 1024 ? `${a.sizeBytes} B` : `${Math.round(a.sizeBytes / 1024)} KB`}</span>
                <Button type="button" size="icon-sm" variant="ghost" aria-label={`Remover ${a.filename}`} onClick={() => remove(a.id)}>
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button type="button" variant="outline" className="w-fit" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 className="animate-spin" /> : <Upload />} Anexar ficheiro
        </Button>
        <input ref={input} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="sr-only" aria-label="Anexar ficheiro" onChange={(e) => upload(e.target.files?.[0])} />
      </CardContent>
    </Card>
  );
}
