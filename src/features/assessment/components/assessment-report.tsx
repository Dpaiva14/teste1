"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Info, Loader2, NotebookPen, RotateCcw, Trophy } from "lucide-react";
import { DemoBadge } from "@/components/brand/demo-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Stat } from "@/components/ui/stat";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CandleChart } from "@/features/chart/components/candle-chart";
import type { ChartOverlay } from "@/features/chart/types";
import { api, errorMessage } from "@/lib/api-client";
import { formatR, formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";
import { answersToOverlays, referenceOverlays } from "../logic/overlays";
import { ACCOUNT_BALANCE, FACTOR_KEYS, PASS_SCORE, RISK_PERCENT, type FactorKey } from "../schemas";
import type { AssessmentStateDTO } from "../types";

const GRADE_VARIANT = { excelente: "success", bom: "success", "a melhorar": "warning", fraco: "danger" } as const;
const FACTOR_LABEL: Record<FactorKey, string> = { trend: "Tendência", structure: "Estrutura", sr: "Suporte/Resistência", supplyDemand: "Oferta/Procura", fibonacci: "Fibonacci", priceAction: "Price action", liquidity: "Liquidez", riskReward: "R:R" };
const OUTCOME_TEXT = { NOT_FILLED: "Entrada não executada", TARGET: "Alvo atingido", STOP: "Stop atingido", OPEN_AT_END: "Sem stop nem alvo no período", INVALID: "Plano incoerente" } as const;

export function AssessmentReport({ state }: { state: AssessmentStateDTO }) {
  const router = useRouter();
  const report = state.report!;
  const { evaluation: ev, outcome, reference } = report;
  const a = state.answers;
  const [showRef, setShowRef] = useState(true);
  const [starting, setStarting] = useState(false);

  const candles = useMemo(() => [...state.candles, ...report.revealCandles], [state.candles, report.revealCandles]);
  const lastRel = state.candles.length - 1;
  const startIndex = Math.max(0, lastRel - 70);
  const priceRange = useMemo(() => {
    const shown = candles.slice(startIndex);
    const lo = Math.min(...shown.map((c) => c.low), ...[a.entry, a.stop, a.target].filter((p): p is number => p !== null));
    const hi = Math.max(...shown.map((c) => c.high), ...[a.entry, a.stop, a.target].filter((p): p is number => p !== null));
    return { min: lo - (hi - lo) * 0.1, max: hi + (hi - lo) * 0.1 };
  }, [candles, startIndex, a.entry, a.stop, a.target]);
  const overlays = useMemo<ChartOverlay[]>(() => {
    const out = answersToOverlays(a, state.windowStart, lastRel);
    out.push({ type: "vline", id: "decision", index: lastRel, label: "Decisão", tone: "primary" });
    if (showRef) out.push(...referenceOverlays(reference, state.windowStart, priceRange));
    return out;
  }, [a, state.windowStart, lastRel, reference, showRef, priceRange]);
  const extra = useMemo(() => [a.entry, a.stop, a.target].filter((p): p is number => p !== null), [a.entry, a.stop, a.target]);

  async function again() {
    setStarting(true);
    try {
      const res = await api<{ id: string }>("/api/assessment", { method: "POST" });
      router.push(`/assessment/${res.id}`);
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
      setStarting(false);
    }
  }

  const plan = ev.plan;
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-2 text-2xl font-semibold tracking-tight">Relatório da avaliação final</h1>
        <DemoBadge />
        <Button asChild size="sm" variant="ghost" className="ml-auto">
          <Link href="/assessment">Todas as tentativas</Link>
        </Button>
      </div>

      <Alert variant={report.passed ? "success" : "info"}>
        {report.passed ? <Trophy aria-hidden /> : <Info aria-hidden />}
        <AlertDescription>
          <p className="font-medium">
            Processo {report.processScore}/100 — {ev.grade}. {report.passed ? `Concluíste a avaliação (processo ≥ ${PASS_SCORE}).` : `Para concluir é preciso processo ≥ ${PASS_SCORE}. Podes tentar de novo com um gráfico novo.`}
          </p>
          <p className="mt-1">A nota avalia o processo com a informação que estava visível no ponto de decisão. O que o preço fez a seguir é mostrado abaixo como informação e não conta para a nota.</p>
          {report.xpAwarded > 0 && <p className="mt-1">+{report.xpAwarded} XP pela conclusão.</p>}
          {report.newAchievements.length > 0 && <p className="mt-1">Conquista desbloqueada: {report.newAchievements.join(", ")}.</p>}
        </AlertDescription>
      </Alert>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Nota de processo" value={`${report.processScore}/100`} tone={report.passed ? "success" : "warning"} hint={<Badge variant={GRADE_VARIANT[ev.grade]}>{ev.grade}</Badge>} />
        <Stat label="Fatores verificados" value={`${ev.supportedCount}/8`} hint="no teu plano" />
        <Stat label="R:R planeado" value={plan.rewardRisk !== null ? `${plan.rewardRisk}:1` : "—"} hint={plan.stopPoints !== null ? `stop ${plan.stopPoints} pts` : undefined} />
        <Stat label="Tamanho" value={a.contracts !== null ? `${a.contracts} MYM` : "—"} hint={plan.maxContracts !== null ? `calculado: ${plan.maxContracts}` : undefined} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">O gráfico, com o que aconteceu a seguir</CardTitle>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={showRef} onCheckedChange={(v) => setShowRef(v === true)} /> Mostrar leitura de referência (calculada)
            </label>
          </div>
          <CardDescription>A linha «Decisão» marca o último candle que viste. As marcações a cor são as tuas; as cinzentas são a leitura de referência calculada pelas regras da plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <CandleChart
            candles={candles}
            visibleCount={150}
            startIndex={startIndex}
            overlays={overlays}
            extraPrices={extra}
            height={460}
            priceDecimals={0}
            intraday
            ariaLabel="Gráfico da avaliação final com as tuas marcações e a continuação do preço (DEMO)."
          />
        </CardContent>
      </Card>

      <section className="grid gap-3">
        <h2 className="text-lg font-semibold">Avaliação passo a passo</h2>
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Passo</TableHead>
                <TableHead className="w-24 text-right">Pontos</TableHead>
                <TableHead>Análise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ev.criteria.map((c, i) => (
                <TableRow key={c.step}>
                  <TableCell className="tabular text-muted-foreground">{i + 1}</TableCell>
                  <TableCell className="font-medium">{c.label}</TableCell>
                  <TableCell className={cn("tabular text-right", c.earned / c.max >= 0.85 ? "text-success" : c.earned / c.max < 0.5 ? "text-danger" : "text-warning")}>
                    {c.earned}/{c.max}
                  </TableCell>
                  <TableCell className="whitespace-normal text-sm text-muted-foreground">{c.comment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {ev.notes.map((n) => (
          <p key={n} className="text-sm text-muted-foreground">
            {n}
          </p>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Confluência: marcaste vs verificado</CardTitle>
            <CardDescription>Cada fator é verificado contra o teu próprio plano (direção, entrada e marcações).</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-1.5 text-sm">
              {FACTOR_KEYS.map((k) => {
                const claimed = a.confluence.includes(k);
                const f = ev.factors[k];
                const consistent = claimed === f.ok;
                return (
                  <li key={k} className="flex items-start gap-2">
                    {consistent ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-label="Coerente" /> : <Info className="mt-0.5 size-4 shrink-0 text-warning" aria-label="Incoerente" />}
                    <span>
                      <span className="font-medium">{FACTOR_LABEL[k]}</span>{" "}
                      <span className="text-xs text-muted-foreground">
                        ({claimed ? "marcaste" : "não marcaste"} · {f.ok ? "verificado" : "não verificado"})
                      </span>
                      <span className="block text-xs text-muted-foreground">{f.why}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">O que aconteceu a seguir (informação)</CardTitle>
            <CardDescription>{outcome.hypothetical ? "A tua decisão foi esperar: isto é o que teria acontecido se tivesses executado o plano." : "Resultado indicativo do plano que decidiste tomar."} Sem custos; não altera a nota.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <p className="flex flex-wrap items-center gap-2">
              <Badge variant={outcome.status === "TARGET" ? "success" : outcome.status === "STOP" ? "danger" : "secondary"}>{OUTCOME_TEXT[outcome.status]}</Badge>
              {outcome.r !== null && <span className="tabular font-medium">{formatR(outcome.r)}</span>}
              {outcome.pnl !== null && (
                <span className="tabular text-muted-foreground">
                  {formatUsd(outcome.pnl)} com {a.contracts ?? 0} MYM
                </span>
              )}
            </p>
            <p className="text-muted-foreground">{outcome.note}</p>
            <p className="rounded-lg border bg-card/60 p-3 text-muted-foreground">
              Um bom processo pode perder e um mau processo pode ganhar. Foi o <strong className="text-foreground">processo</strong> que avaliámos: com este plano e risco de {RISK_PERCENT}% de {formatUsd(ACCOUNT_BALANCE)}, o que podes controlar é a decisão, não o que o preço faz a seguir.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">As três perguntas</CardTitle>
          <CardDescription>«O objetivo não é prever o mercado. O objetivo é construir um processo de decisão repetível.»</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">Antes do trade</p>
            <p className="mt-1 font-medium">Porque estou a considerar este trade?</p>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{a.reason || "—"}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">Durante o trade</p>
            <p className="mt-1 font-medium">O que invalidaria a minha tese?</p>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{a.invalidation || "—"}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">Depois do trade</p>
            <p className="mt-1 font-medium">O meu processo foi correto, independentemente do resultado?</p>
            <p className="mt-1 text-muted-foreground">Processo {report.processScore}/100. Regista-o no journal com a tua própria avaliação de processo (1–5) e uma lição.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={again} disabled={starting}>
          {starting ? <Loader2 className="animate-spin" /> : <RotateCcw />} Nova tentativa (gráfico novo)
        </Button>
        <Button asChild variant="outline">
          <Link href="/journal/new">
            <NotebookPen /> Registar no journal
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/dashboard">Voltar ao painel</Link>
        </Button>
      </div>
    </div>
  );
}
