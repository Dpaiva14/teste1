"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, errorMessage } from "@/lib/api-client";
import { EVENT_CATEGORIES, eventSchema } from "../schemas";
import type { AdminEventRow } from "../types";

const IMPACT_VARIANT = { LOW: "secondary", MEDIUM: "default", HIGH: "warning", EXTREME: "danger" } as const;

/** <input type=datetime-local> works in local time; the API stores UTC. */
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const empty = { title: "", country: "US", category: "CPI", impact: "HIGH", scheduledAt: "", forecast: "", previous: "", actual: "", description: "", source: "", sourceUrl: "", isDemo: false };
type Form = typeof empty;

export function EventsManager({ events }: { events: AdminEventRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [f, setF] = useState<Form>(empty);
  const [pending, setPending] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  function edit(e: AdminEventRow) {
    setEditing(e.id);
    setProblems([]);
    setF({ title: e.title, country: e.country, category: e.category, impact: e.impact, scheduledAt: toLocalInput(e.scheduledAt), forecast: e.forecast ?? "", previous: e.previous ?? "", actual: e.actual ?? "", description: e.description ?? "", source: e.source ?? "", sourceUrl: e.sourceUrl ?? "", isDemo: e.isDemo });
  }

  async function save() {
    const when = f.scheduledAt ? new Date(f.scheduledAt) : null;
    const parsed = eventSchema.safeParse({ ...f, scheduledAt: when && !Number.isNaN(when.getTime()) ? when.toISOString() : "" });
    if (!parsed.success) return setProblems(parsed.error.issues.slice(0, 5).map((i) => i.message));
    setProblems([]);
    setPending(true);
    try {
      if (editing === "new") await api("/api/admin/events", { method: "POST", body: parsed.data });
      else await api(`/api/admin/events/${editing}`, { method: "PUT", body: parsed.data });
      toast.success("Evento guardado.");
      setEditing(null);
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  async function remove(e: AdminEventRow) {
    if (!confirm(`Apagar "${e.title}"?`)) return;
    try {
      await api(`/api/admin/events/${e.id}`, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const set = (k: keyof Form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: ev.target.value });

  return (
    <div className="grid gap-5">
      <Alert variant="info">
        <AlertDescription>Eventos reais precisam de uma fonte oficial (ex.: BLS, BEA, Federal Reserve) e a data/hora tem de ser confirmada na fonte. Eventos ilustrativos têm de ser marcados como DEMO — aparecem identificados para os alunos.</AlertDescription>
      </Alert>
      <div>
        <Button
          onClick={() => {
            setEditing("new");
            setF(empty);
            setProblems([]);
          }}
        >
          <Plus /> Novo evento
        </Button>
      </div>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editing === "new" ? "Novo evento" : "Editar evento"}</CardTitle>
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
            <Field label="Título" htmlFor="e-title">
              <Input id="e-title" value={f.title} maxLength={160} onChange={set("title")} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label="Categoria" htmlFor="e-cat">
                <select id="e-cat" value={f.category} onChange={set("category")} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Impacto" htmlFor="e-impact">
                <select id="e-impact" value={f.impact} onChange={set("impact")} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
                  {["LOW", "MEDIUM", "HIGH", "EXTREME"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="País" htmlFor="e-country">
                <Input id="e-country" value={f.country} maxLength={3} onChange={set("country")} />
              </Field>
              <Field label="Data/hora (a tua hora local)" htmlFor="e-when">
                <Input id="e-when" type="datetime-local" value={f.scheduledAt} onChange={set("scheduledAt")} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Previsão" htmlFor="e-fc">
                <Input id="e-fc" value={f.forecast} maxLength={60} onChange={set("forecast")} />
              </Field>
              <Field label="Anterior" htmlFor="e-prev">
                <Input id="e-prev" value={f.previous} maxLength={60} onChange={set("previous")} />
              </Field>
              <Field label="Resultado" htmlFor="e-act">
                <Input id="e-act" value={f.actual} maxLength={60} onChange={set("actual")} />
              </Field>
            </div>
            <Field label="Descrição" htmlFor="e-desc">
              <Textarea id="e-desc" rows={2} value={f.description} maxLength={600} onChange={set("description")} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Fonte" htmlFor="e-src" hint="Obrigatória em eventos reais.">
                <Input id="e-src" value={f.source} maxLength={300} onChange={set("source")} />
              </Field>
              <Field label="Link da fonte (https)" htmlFor="e-url">
                <Input id="e-url" value={f.sourceUrl} maxLength={500} placeholder="https://" onChange={set("sourceUrl")} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-[var(--primary)]" checked={f.isDemo} onChange={(e) => setF({ ...f, isDemo: e.target.checked })} /> Evento ilustrativo (DEMO) — não é um calendário real
            </label>
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Quando (local)</TableHead>
            <TableHead>Evento</TableHead>
            <TableHead>Impacto</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="tabular whitespace-nowrap text-xs">{new Date(e.scheduledAt).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}</TableCell>
              <TableCell className="font-medium">
                {e.title} <span className="text-xs text-muted-foreground">{e.category}</span>
              </TableCell>
              <TableCell>
                <Badge variant={IMPACT_VARIANT[e.impact]}>{e.impact}</Badge>
              </TableCell>
              <TableCell className="text-xs">{e.isDemo ? <Badge variant="demo">DEMO</Badge> : (e.source ?? "—")}</TableCell>
              <TableCell className="whitespace-nowrap text-right">
                <Button size="icon-sm" variant="ghost" aria-label={`Editar ${e.title}`} onClick={() => edit(e)}>
                  <Pencil />
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label={`Apagar ${e.title}`} onClick={() => remove(e)}>
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Sem eventos.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
