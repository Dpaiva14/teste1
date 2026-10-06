"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { api, errorMessage } from "@/lib/api-client";
import { glossarySchema } from "../schemas";
import type { AdminGlossaryRow } from "../types";

const empty = { slug: "", term: "", category: "", definition: "", simpleExplanation: "", technicalExplanation: "", example: "", related: "" };
type Form = typeof empty;

export function GlossaryManager({ terms }: { terms: AdminGlossaryRow[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [f, setF] = useState<Form>(empty);
  const [pending, setPending] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? terms.filter((t) => t.term.toLowerCase().includes(s) || t.slug.includes(s) || t.category.toLowerCase().includes(s)) : terms;
  }, [terms, q]);

  function edit(t: AdminGlossaryRow) {
    setEditing(t.id);
    setProblems([]);
    setF({ slug: t.slug, term: t.term, category: t.category, definition: t.definition, simpleExplanation: t.simpleExplanation, technicalExplanation: t.technicalExplanation, example: t.example, related: t.related.join(", ") });
  }

  async function save() {
    const parsed = glossarySchema.safeParse({ ...f, related: f.related.split(",").map((s) => s.trim()).filter(Boolean) });
    if (!parsed.success) return setProblems(parsed.error.issues.slice(0, 5).map((i) => `${String(i.path[0] ?? "")}: ${i.message}`));
    setProblems([]);
    setPending(true);
    try {
      if (editing === "new") await api("/api/admin/glossary", { method: "POST", body: parsed.data });
      else await api(`/api/admin/glossary/${editing}`, { method: "PUT", body: parsed.data });
      toast.success("Termo guardado.");
      setEditing(null);
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  async function remove(t: AdminGlossaryRow) {
    if (!confirm(`Apagar "${t.term}"? As referências noutros termos também são removidas.`)) return;
    try {
      await api(`/api/admin/glossary/${t.id}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const set = (k: keyof Form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: ev.target.value });

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            setEditing("new");
            setF(empty);
            setProblems([]);
          }}
        >
          <Plus /> Novo termo
        </Button>
        <label htmlFor="g-search" className="sr-only">
          Filtrar termos
        </label>
        <Input id="g-search" value={q} placeholder="Filtrar…" onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <span className="text-xs text-muted-foreground">{shown.length} de {terms.length}</span>
      </div>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editing === "new" ? "Novo termo" : "Editar termo"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
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
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Termo" htmlFor="g-term">
                <Input id="g-term" value={f.term} maxLength={120} onChange={set("term")} />
              </Field>
              <Field label="Slug" htmlFor="g-slug" hint="minúsculas e hífens">
                <Input id="g-slug" value={f.slug} maxLength={80} onChange={set("slug")} />
              </Field>
              <Field label="Categoria" htmlFor="g-cat">
                <Input id="g-cat" value={f.category} maxLength={60} onChange={set("category")} />
              </Field>
            </div>
            <Field label="Definição" htmlFor="g-def">
              <Textarea id="g-def" rows={2} value={f.definition} maxLength={800} onChange={set("definition")} />
            </Field>
            <Field label="Explicação simples" htmlFor="g-simple">
              <Textarea id="g-simple" rows={2} value={f.simpleExplanation} maxLength={800} onChange={set("simpleExplanation")} />
            </Field>
            <Field label="Explicação técnica" htmlFor="g-tech">
              <Textarea id="g-tech" rows={3} value={f.technicalExplanation} maxLength={1200} onChange={set("technicalExplanation")} />
            </Field>
            <Field label="Exemplo" htmlFor="g-ex">
              <Textarea id="g-ex" rows={2} value={f.example} maxLength={1000} onChange={set("example")} />
            </Field>
            <Field label="Termos relacionados (slugs, separados por vírgula)" htmlFor="g-rel" hint="Slugs inexistentes são ignorados.">
              <Input id="g-rel" value={f.related} onChange={set("related")} />
            </Field>
            <div className="flex gap-2">
              <Button onClick={save} disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <Save />} Guardar
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ul className="grid gap-1.5">
        {shown.slice(0, 150).map((t) => (
          <li key={t.id} className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm">
            <span className="min-w-0 flex-1">
              <span className="font-medium">{t.term}</span> <span className="text-xs text-muted-foreground">· {t.category} · {t.slug}</span>
            </span>
            <Button size="icon-sm" variant="ghost" aria-label={`Editar ${t.term}`} onClick={() => edit(t)}>
              <Pencil />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label={`Apagar ${t.term}`} onClick={() => remove(t)}>
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
      {shown.length > 150 && <p className="text-xs text-muted-foreground">A mostrar 150 — usa o filtro para ver os restantes.</p>}
    </div>
  );
}
