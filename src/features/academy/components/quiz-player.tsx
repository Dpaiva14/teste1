"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, Loader2, RotateCcw, Sparkles, Trophy, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StaticChart } from "@/features/chart/components/static-chart";
import { api, errorMessage } from "@/lib/api-client";
import { parseNumber } from "@/lib/parse-number";
import { cn } from "@/lib/utils";
import type { QuestionFeedbackDTO, QuizDTO, QuizResultDTO } from "../types";

type Response = { optionId?: string; value?: number };

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: "Escolha múltipla",
  TRUE_FALSE: "Verdadeiro / Falso",
  NUMERIC: "Cálculo",
  CHART_ANALYSIS: "Análise de gráfico",
  IDENTIFY_STRUCTURE: "Identificar estrutura",
  IDENTIFY_TREND: "Identificar tendência",
  IDENTIFY_SUPPORT_RESISTANCE: "Identificar suporte/resistência",
  POSITION_SIZE: "Tamanho de posição",
  CALCULATE_RR: "Calcular R:R",
  VALID_SETUP: "Setup válido ou inválido?",
};

export function QuizPlayer({ quiz, onPassed }: { quiz: QuizDTO; onPassed?: () => void }) {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, Response>>({});
  const [numericText, setNumericText] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResultDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = quiz.questions.filter((q) => {
    const r = responses[q.id];
    return q.numeric ? r?.value !== undefined : r?.optionId !== undefined;
  }).length;
  const feedbackById = new Map<string, QuestionFeedbackDTO>((result?.feedback ?? []).map((f) => [f.questionId, f]));

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api<QuizResultDTO>(`/api/quizzes/${quiz.id}/attempts`, { method: "POST", body: { responses } });
      setResult(res);
      for (const a of res.newAchievements) toast.success(`Conquista desbloqueada: ${a.title}`, { description: a.description });
      if (res.passed) onPassed?.();
      router.refresh();
      requestAnimationFrame(() => document.getElementById(`quiz-${quiz.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setResult(null);
    setResponses({});
    setNumericText({});
    requestAnimationFrame(() => document.getElementById(`quiz-${quiz.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div id={`quiz-${quiz.id}`} className="grid gap-4 scroll-mt-20">
      {result && (
        <Card className={result.passed ? "border-success/50" : "border-warning/50"}>
          <CardContent className="grid gap-3 p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className={cn("flex size-16 items-center justify-center rounded-full border-4 text-xl font-bold tabular", result.passed ? "border-success text-success" : "border-warning text-warning")}>
                {result.scorePercent}%
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-lg font-semibold">
                  {result.passed ? <Trophy className="size-5 text-success" /> : <RotateCcw className="size-5 text-warning" />}
                  {result.passed ? "Aprovado" : "Ainda não passaste"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.correctCount} de {result.totalCount} corretas · mínimo para passar: {result.passScore}%
                  {result.xpAwarded > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 font-medium text-primary">
                      <Sparkles className="size-3.5" />+{result.xpAwarded} XP
                    </span>
                  )}
                </p>
                {result.lessonCompleted && <p className="mt-1 text-sm text-success">Aula concluída ✔</p>}
              </div>
              {!result.passed && (
                <Button onClick={retry}>
                  <RotateCcw /> Tentar novamente
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Lê a explicação de cada pergunta — o objetivo é perceber o raciocínio, não apenas acertar.</p>
          </CardContent>
        </Card>
      )}

      {quiz.questions.map((q, idx) => {
        const fb = feedbackById.get(q.id);
        const chart = q.chartRef ? quiz.charts[q.chartRef] : undefined;
        const current = responses[q.id];
        return (
          <Card key={q.id} className={cn(fb && (fb.correct ? "border-success/40" : "border-danger/40"))}>
            <CardHeader className="gap-2 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Pergunta {idx + 1}</Badge>
                <Badge variant="outline">{TYPE_LABEL[q.type] ?? q.type}</Badge>
                {fb && (fb.correct ? <Badge variant="success"><CheckCircle2 />Correta</Badge> : <Badge variant="danger"><XCircle />{fb.skipped ? "Sem resposta" : "Incorreta"}</Badge>)}
              </div>
              <CardTitle className="text-base font-medium leading-snug">{q.prompt}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {chart && <StaticChart candles={chart.candles} height={300} priceDecimals={chart.priceDecimals} ariaLabel={`Gráfico ${chart.symbol} ${chart.timeframe} (DEMO)`} />}

              {q.numeric ? (
                <div className="grid gap-1.5">
                  <label htmlFor={`n-${q.id}`} className="text-sm font-medium">
                    A tua resposta{q.numeric.unit ? ` (${q.numeric.unit})` : ""}
                  </label>
                  <Input
                    id={`n-${q.id}`}
                    inputMode="decimal"
                    disabled={Boolean(result)}
                    value={numericText[q.id] ?? ""}
                    className="max-w-48 tabular"
                    onChange={(e) => {
                      const text = e.target.value;
                      setNumericText((s) => ({ ...s, [q.id]: text }));
                      const n = parseNumber(text);
                      setResponses((s) => {
                        const next = { ...s };
                        if (n === null) delete next[q.id];
                        else next[q.id] = { value: n };
                        return next;
                      });
                    }}
                  />
                  {fb && (
                    <p className="text-sm">
                      Resposta esperada: <strong className="tabular">{fb.expectedNumeric}{fb.numericUnit ? ` ${fb.numericUnit}` : ""}</strong>
                      {fb.numericTolerance ? <span className="text-muted-foreground"> (tolerância ±{fb.numericTolerance})</span> : null}
                    </p>
                  )}
                </div>
              ) : (
                <fieldset className="grid gap-2" disabled={Boolean(result)}>
                  <legend className="sr-only">Opções da pergunta {idx + 1}</legend>
                  {q.options.map((o) => {
                    const selected = current?.optionId === o.id;
                    const isCorrect = fb?.correctOptionIds.includes(o.id);
                    const isWrongPick = fb && selected && !isCorrect;
                    return (
                      <label
                        key={o.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-accent/50",
                          selected && !fb && "border-primary bg-primary/10",
                          fb && isCorrect && "border-success bg-success/10",
                          isWrongPick && "border-danger bg-danger/10",
                          fb && "cursor-default hover:bg-transparent",
                        )}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          className="mt-0.5 size-4 accent-[var(--primary)]"
                          checked={selected}
                          onChange={() => setResponses((s) => ({ ...s, [q.id]: { optionId: o.id } }))}
                        />
                        <span className="flex-1">
                          {o.text}
                          {fb && isCorrect && <span className="ml-2 text-xs font-medium text-success">← correta</span>}
                          {isWrongPick && fb.optionFeedback[o.id] && <span className="mt-1 block text-xs text-danger">{fb.optionFeedback[o.id]}</span>}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              )}

              {fb && (
                <Alert variant={fb.correct ? "success" : "info"}>
                  <AlertDescription>
                    <p className="font-medium">{fb.correct ? "Porquê está certo" : "Explicação"}</p>
                    <p className="mt-1">{fb.explanation}</p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        );
      })}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!result && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {answered} de {quiz.questions.length} respondidas · mínimo para passar: {quiz.passScore}%
            {quiz.bestScore !== null && <> · melhor resultado: {quiz.bestScore}%</>}
          </p>
          <Button onClick={submit} disabled={submitting || answered === 0}>
            {submitting && <Loader2 className="animate-spin" />}
            Verificar respostas
          </Button>
        </div>
      )}
    </div>
  );
}
