"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { api, errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { CHART_TYPES, NUMERIC_TYPES, OPTION_TYPES, quizSchema, type QuestionInput, type QuizInput } from "../schemas";

const TYPE_LABEL: Record<QuestionInput["type"], string> = {
  MULTIPLE_CHOICE: "Escolha múltipla",
  TRUE_FALSE: "Verdadeiro / Falso",
  CHART_ANALYSIS: "Análise de gráfico",
  IDENTIFY_STRUCTURE: "Identificar estrutura",
  IDENTIFY_TREND: "Identificar tendência",
  IDENTIFY_SUPPORT_RESISTANCE: "Identificar suporte/resistência",
  VALID_SETUP: "Setup válido?",
  NUMERIC: "Numérica",
  POSITION_SIZE: "Tamanho de posição",
  CALCULATE_RR: "Calcular R:R",
};
const ALL_TYPES = [...OPTION_TYPES, ...NUMERIC_TYPES] as const;
const isNumeric = (t: string) => (NUMERIC_TYPES as readonly string[]).includes(t);
const isChart = (t: string) => (CHART_TYPES as readonly string[]).includes(t);

interface Q extends Omit<QuestionInput, "points"> {
  key: number;
  points: number;
}
let nextKey = 1;
const blank = (): Q => ({ key: nextKey++, type: "MULTIPLE_CHOICE", prompt: "", explanation: "", points: 1, chartRef: null, answer: null, tolerance: null, unit: null, options: [{ text: "", correct: true, why: null }, { text: "", correct: false, why: null }] });

export function QuizEditor({ endpoint, initial, scenarios, defaultTitle }: { endpoint: string; initial: QuizInput | null; scenarios: { id: string; title: string }[]; defaultTitle: string }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? defaultTitle);
  const [passScore, setPassScore] = useState(String(initial?.passScore ?? 70));
  const [published, setPublished] = useState(initial?.published ?? true);
  const [qs, setQs] = useState<Q[]>(() => (initial?.questions ?? []).map((q) => ({ ...q, key: nextKey++ })));
  const [pending, setPending] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  const patch = (key: number, p: Partial<Q>) => setQs((all) => all.map((q) => (q.key === key ? { ...q, ...p } : q)));
  const move = (i: number, d: -1 | 1) =>
    setQs((all) => {
      const j = i + d;
      if (j < 0 || j >= all.length) return all;
      const next = [...all];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  function changeType(q: Q, type: Q["type"]) {
    if (isNumeric(type)) patch(q.key, { type, options: [], chartRef: null, answer: q.answer ?? 0, tolerance: q.tolerance ?? 0 });
    else if (type === "TRUE_FALSE") patch(q.key, { type, chartRef: null, answer: null, tolerance: null, options: [{ text: "Verdadeiro", correct: true, why: null }, { text: "Falso", correct: false, why: null }] });
    else patch(q.key, { type, chartRef: isChart(type) ? (q.chartRef ?? scenarios[0]?.id ?? null) : null, answer: null, tolerance: null, options: q.options.length >= 2 ? q.options : blank().options });
  }

  async function save() {
    const payload = {
      title,
      passScore: Number(passScore),
      published,
      questions: qs.map(({ key: _key, ...q }) => ({ ...q, options: isNumeric(q.type) ? [] : q.options })),
    };
    const parsed = quizSchema.safeParse(payload);
    if (!parsed.success) {
      setProblems(parsed.error.issues.slice(0, 8).map((i) => {
        const qi = i.path[0] === "questions" && typeof i.path[1] === "number" ? `Pergunta ${i.path[1] + 1}: ` : "";
        return `${qi}${i.message}`;
      }));
      return;
    }
    setProblems([]);
    setPending(true);
    try {
      await api(endpoint, { method: "PUT", body: parsed.data });
      toast.success("Quiz guardado.");
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!confirm("Remover o quiz e todas as suas perguntas?")) return;
    try {
      await api(endpoint, { method: "DELETE" });
      setQs([]);
      toast.success("Quiz removido.");
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quiz ({qs.length} pergunta{qs.length === 1 ? "" : "s"})</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto]">
          <Field label="Título do quiz" htmlFor="qz-title">
            <Input id="qz-title" value={title} maxLength={160} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Nota mínima (%)" htmlFor="qz-pass">
            <Input id="qz-pass" inputMode="numeric" value={passScore} onChange={(e) => setPassScore(e.target.value)} />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" className="accent-[var(--primary)]" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Publicado
          </label>
        </div>

        {qs.map((q, i) => (
          <fieldset key={q.key} className="grid gap-3 rounded-lg border p-4">
            <legend className="px-1 text-sm font-semibold">Pergunta {i + 1}</legend>
            <div className="flex flex-wrap items-end gap-3">
              <Field label="Tipo" htmlFor={`q${q.key}-type`}>
                <select id={`q${q.key}-type`} value={q.type} onChange={(e) => changeType(q, e.target.value as Q["type"])} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
                  {ALL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Pontos" htmlFor={`q${q.key}-pts`} className="w-20">
                <Input id={`q${q.key}-pts`} inputMode="numeric" value={q.points} onChange={(e) => patch(q.key, { points: Number(e.target.value) || 1 })} />
              </Field>
              <div className="ml-auto flex gap-1">
                <Button type="button" size="icon-sm" variant="ghost" aria-label="Subir pergunta" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp />
                </Button>
                <Button type="button" size="icon-sm" variant="ghost" aria-label="Descer pergunta" disabled={i === qs.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown />
                </Button>
                <Button type="button" size="icon-sm" variant="ghost" aria-label="Apagar pergunta" onClick={() => setQs((all) => all.filter((x) => x.key !== q.key))}>
                  <Trash2 />
                </Button>
              </div>
            </div>

            {isChart(q.type) && (
              <Field label="Gráfico (cenário DEMO)" htmlFor={`q${q.key}-chart`}>
                <select id={`q${q.key}-chart`} value={q.chartRef ?? ""} onChange={(e) => patch(q.key, { chartRef: e.target.value || null })} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
                  <option value="">— escolher —</option>
                  {scenarios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label="Enunciado" htmlFor={`q${q.key}-prompt`}>
              <Textarea id={`q${q.key}-prompt`} rows={2} value={q.prompt} maxLength={1000} onChange={(e) => patch(q.key, { prompt: e.target.value })} />
            </Field>

            {isNumeric(q.type) ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Resposta correta" htmlFor={`q${q.key}-ans`}>
                  <Input id={`q${q.key}-ans`} inputMode="decimal" value={q.answer ?? ""} onChange={(e) => patch(q.key, { answer: e.target.value === "" ? null : Number(e.target.value.replace(",", ".")) })} />
                </Field>
                <Field label="Tolerância (±)" htmlFor={`q${q.key}-tol`}>
                  <Input id={`q${q.key}-tol`} inputMode="decimal" value={q.tolerance ?? ""} onChange={(e) => patch(q.key, { tolerance: e.target.value === "" ? null : Number(e.target.value.replace(",", ".")) })} />
                </Field>
                <Field label="Unidade" htmlFor={`q${q.key}-unit`}>
                  <Input id={`q${q.key}-unit`} value={q.unit ?? ""} maxLength={20} onChange={(e) => patch(q.key, { unit: e.target.value || null })} placeholder="ex.: contratos, $, R" />
                </Field>
              </div>
            ) : (
              <div className="grid gap-2">
                <span className="text-sm font-medium">Opções (marca a correta)</span>
                {q.options.map((o, j) => (
                  <div key={j} className="grid gap-1.5 rounded-md border p-2 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-center">
                    <input type="radio" aria-label={`Opção ${j + 1} correta`} name={`correct-${q.key}`} className="accent-[var(--primary)]" checked={o.correct} onChange={() => patch(q.key, { options: q.options.map((x, k) => ({ ...x, correct: k === j })) })} />
                    <Input aria-label={`Texto da opção ${j + 1}`} value={o.text} maxLength={300} placeholder={`Opção ${j + 1}`} onChange={(e) => patch(q.key, { options: q.options.map((x, k) => (k === j ? { ...x, text: e.target.value } : x)) })} />
                    <Input aria-label={`Porquê (opção ${j + 1})`} value={o.why ?? ""} maxLength={500} placeholder="Porquê? (opcional)" onChange={(e) => patch(q.key, { options: q.options.map((x, k) => (k === j ? { ...x, why: e.target.value || null } : x)) })} />
                    <Button type="button" size="icon-sm" variant="ghost" aria-label={`Remover opção ${j + 1}`} disabled={q.options.length <= 2 || q.type === "TRUE_FALSE"} onClick={() => patch(q.key, { options: q.options.filter((_, k) => k !== j) })}>
                      <Trash2 />
                    </Button>
                  </div>
                ))}
                {q.type !== "TRUE_FALSE" && q.options.length < 6 && (
                  <Button type="button" size="sm" variant="outline" className="w-fit" onClick={() => patch(q.key, { options: [...q.options, { text: "", correct: false, why: null }] })}>
                    <Plus /> Opção
                  </Button>
                )}
              </div>
            )}

            <Field label="Explicação (mostrada sempre após responder)" htmlFor={`q${q.key}-exp`}>
              <Textarea id={`q${q.key}-exp`} rows={2} value={q.explanation} maxLength={2000} onChange={(e) => patch(q.key, { explanation: e.target.value })} />
            </Field>
          </fieldset>
        ))}

        {problems.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className={cn("list-disc pl-4")}>
                {problems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setQs((all) => [...all, blank()])}>
            <Plus /> Pergunta
          </Button>
          <Button type="button" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Save />} Guardar quiz
          </Button>
          {initial && (
            <Button type="button" variant="ghost" className="ml-auto" onClick={remove}>
              <Trash2 /> Remover quiz
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
