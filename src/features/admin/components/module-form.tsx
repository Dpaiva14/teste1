"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { api, errorMessage } from "@/lib/api-client";
import { moduleUpdateSchema } from "../schemas";
import type { AdminModuleDetail } from "../types";

const DIFFICULTIES = ["BEGINNER", "FOUNDATION", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"] as const;

export function ModuleForm({ module: m }: { module: AdminModuleDetail }) {
  const router = useRouter();
  const [f, setF] = useState({ title: m.title, summary: m.summary, difficulty: m.difficulty, level: String(m.level), estimatedMinutes: String(m.estimatedMinutes), published: m.published });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const parsed = moduleUpdateSchema.safeParse({ ...f, level: Number(f.level), estimatedMinutes: Number(f.estimatedMinutes) });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Dados inválidos.");
    setError(null);
    setPending(true);
    try {
      await api(`/api/admin/modules/${m.id}`, { method: "PATCH", body: parsed.data });
      toast.success("Módulo guardado.");
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4">
      {m.managedBySeed && (
        <Alert variant="info">
          <AlertDescription>Este módulo é gerido pelo código (seed). Ao guardar, passa a ser gerido aqui e um novo seed deixa de o sobrescrever.</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Field label="Título" htmlFor="m-title">
        <Input id="m-title" value={f.title} maxLength={120} onChange={(e) => setF({ ...f, title: e.target.value })} />
      </Field>
      <Field label="Resumo" htmlFor="m-summary">
        <Textarea id="m-summary" rows={3} value={f.summary} maxLength={600} onChange={(e) => setF({ ...f, summary: e.target.value })} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Dificuldade" htmlFor="m-diff">
          <select id="m-diff" value={f.difficulty} onChange={(e) => setF({ ...f, difficulty: e.target.value })} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
            {DIFFICULTIES.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Nível (1–10)" htmlFor="m-level" hint="Define a que nível de progressão o módulo pertence.">
          <Input id="m-level" inputMode="numeric" value={f.level} onChange={(e) => setF({ ...f, level: e.target.value })} />
        </Field>
        <Field label="Minutos estimados" htmlFor="m-min">
          <Input id="m-min" inputMode="numeric" value={f.estimatedMinutes} onChange={(e) => setF({ ...f, estimatedMinutes: e.target.value })} />
        </Field>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" className="accent-[var(--primary)]" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} /> Publicado
        </label>
      </div>
      <Button className="w-fit" onClick={save} disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Save />} Guardar módulo
      </Button>
    </div>
  );
}
