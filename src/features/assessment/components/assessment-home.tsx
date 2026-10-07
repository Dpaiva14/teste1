"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Lock, Play, RotateCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApiAction } from "@/hooks/use-api-action";
import { api } from "@/lib/api-client";
import { ACCOUNT_BALANCE, PASS_SCORE, RISK_PERCENT, STEP_KEYS, STEP_META } from "../schemas";
import type { AssessmentOverviewDTO } from "../types";

const GRADE_VARIANT: Record<string, "success" | "warning" | "danger"> = { excelente: "success", bom: "success", "a melhorar": "warning", fraco: "danger" };

export function AssessmentHome({ overview }: { overview: AssessmentOverviewDTO }) {
  const router = useRouter();
  const start = useApiAction(() => api<{ id: string }>("/api/assessment", { method: "POST" }));
  const { gate } = overview;
  const pct = gate.totalLessons > 0 ? Math.min(100, Math.round((gate.completedLessons / Math.max(1, gate.neededLessons)) * 100)) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section className="grid content-start gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Como funciona</CardTitle>
            <CardDescription>Recebes um gráfico histórico DEMO que nunca viste e percorres 12 passos de decisão, do contexto ao tamanho da posição.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <ol className="grid gap-1.5 sm:grid-cols-2">
              {STEP_KEYS.map((k) => (
                <li key={k} className="flex gap-2">
                  <span className="tabular w-5 shrink-0 text-right text-muted-foreground">{STEP_META[k].n}.</span>
                  <span>
                    <span className="font-medium">{STEP_META[k].title}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="grid gap-2 rounded-lg border bg-card/60 p-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">Avalia-se o processo, não o resultado.</strong> A nota (0–100) mede a coerência e a aplicação das regras com a informação que estava visível no momento da decisão. O que aconteceu a seguir só é mostrado depois de submeteres — como informação — e não altera a nota.
              </p>
              <p>
                Conta virtual de ${ACCOUNT_BALANCE.toLocaleString("en-US")}, risco de {RISK_PERCENT}% por trade, MYM ($0,50 por ponto). Podes concluir que a melhor decisão é <em>esperar</em>: o plano continua a ser avaliado e a decisão tem de ser coerente com o teu próprio processo.
              </p>
              <p>Aprovação educativa: processo ≥ {PASS_SCORE}/100. Não é um sinal nem uma garantia de resultados em mercado real. Os dados são sintéticos (DEMO).</p>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-lg font-semibold">As tuas tentativas</h2>
        {overview.attempts.length === 0 ? (
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground">Ainda não fizeste nenhuma tentativa.</CardContent>
          </Card>
        ) : (
          overview.attempts.map((a) => (
            <Link key={a.id} href={`/assessment/${a.id}`} className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/50">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {a.status === "COMPLETED" ? `Processo ${a.processScore}/100` : "Em curso"}
                  {a.grade && <Badge variant={GRADE_VARIANT[a.grade] ?? "secondary"}>{a.grade}</Badge>}
                  {a.processScore !== null && a.processScore >= PASS_SCORE && <Badge variant="success">aprovado</Badge>}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Iniciada em {new Date(a.createdAt).toLocaleDateString("pt-PT")}</p>
              </div>
              <span className="text-xs text-muted-foreground">{a.status === "COMPLETED" ? "Ver relatório" : "Continuar"}</span>
            </Link>
          ))
        )}
      </section>

      <Card className="self-start">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {overview.unlocked ? <Play className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />} Avaliação final
          </CardTitle>
          <CardDescription>Nível 10 · Professional Development</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {overview.passed && (
            <Alert>
              <CheckCircle2 aria-hidden />
              <AlertDescription>Já concluíste a avaliação com processo ≥ {PASS_SCORE} (melhor: {overview.bestScore}/100). Podes repetir com um gráfico novo para treinar.</AlertDescription>
            </Alert>
          )}
          {!overview.unlocked ? (
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                Desbloqueia-se ao concluir 80% das aulas do nível {gate.level} (e dos anteriores). Progresso do nível {gate.level}: {gate.completedLessons} de {gate.neededLessons} aulas necessárias.
              </p>
              <Progress value={pct} aria-label="Progresso para desbloquear a avaliação final" />
              <Button asChild variant="outline">
                <Link href="/academy">Ir para a Academia</Link>
              </Button>
            </div>
          ) : (
            <>
              {start.error && (
                <Alert variant="destructive">
                  <AlertDescription>{start.error}</AlertDescription>
                </Alert>
              )}
              {overview.inProgressId ? (
                <Button asChild>
                  <Link href={`/assessment/${overview.inProgressId}`}>
                    <Play /> Continuar tentativa
                  </Link>
                </Button>
              ) : (
                <Button
                  disabled={start.pending}
                  onClick={async () => {
                    const res = await start.run(undefined);
                    if (res) {
                      router.push(`/assessment/${res.id}`);
                      router.refresh();
                    }
                  }}
                >
                  {start.pending ? <Loader2 className="animate-spin" /> : overview.attempts.length > 0 ? <RotateCcw /> : <Play />}
                  {overview.attempts.length > 0 ? "Nova tentativa (gráfico novo)" : "Iniciar avaliação"}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">Uma tentativa em curso de cada vez. O progresso fica guardado automaticamente.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
