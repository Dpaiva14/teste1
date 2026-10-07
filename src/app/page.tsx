import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Ban, BookOpen, Bot, ChartCandlestick, ClipboardCheck, FlaskConical, Gauge, GraduationCap, History, NotebookPen, Shapes, Trophy } from "lucide-react";
import { PublicShell } from "@/components/layout/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";
import { BRAND } from "@/modules/brand";
import { MODULES } from "@/modules/curriculum";
import { LEVELS } from "@/modules/levels";

export const metadata: Metadata = {
  title: { absolute: `${BRAND.name} — ${BRAND.subtitle}` },
  description: "Plataforma educativa de trading do US30 / Dow Jones e futuros YM/MYM: currículo de 26 módulos, laboratórios, replay, simulador, backtesting e journal. Sem sinais, sem promessas.",
};

const FEATURES = [
  { icon: GraduationCap, title: "Academia em 10 níveis", text: "26 módulos progressivos, do zero ao avançado, com exemplos numéricos e quizzes que explicam cada resposta." },
  { icon: ChartCandlestick, title: "Laboratórios", text: "Market structure, níveis, Fibonacci e confluência: marcas no gráfico e recebes feedback sobre o raciocínio." },
  { icon: History, title: "Chart Replay", text: "O mercado barra a barra, sem ver o futuro. Marcas o plano e a avaliação julga o processo, não o resultado." },
  { icon: Shapes, title: "Simulador de conta", text: "Saldo, equity, margem, P&L aberto e diário, drawdown e custos — sempre com valores ilustrativos e rotulados." },
  { icon: FlaskConical, title: "Backtesting Lab", text: "Compra, vende ou espera com regras escritas. O relatório separa a aderência às regras do resultado." },
  { icon: NotebookPen, title: "Journal e estatísticas", text: "Razão da entrada, erros, emoção e avaliação de processo. Win rate, expectancy e drawdown, com avisos de amostra pequena." },
  { icon: ClipboardCheck, title: "Plano diário e checklist", text: "Plano do dia e checklist de 12 itens antes de cada entrada: avisa, ensina e nunca bloqueia." },
  { icon: Gauge, title: "Calculadoras YM/MYM", text: "Tamanho de posição e risco em dólares, sempre à vista. Valor por ponto do CME: YM $5, MYM $0,50." },
  { icon: Bot, title: "Tutor e análise de gráfico", text: "Explicam e corrigem raciocínio em linguagem probabilística. Não dão sinais nem prometem resultados." },
  { icon: Trophy, title: "Avaliação final", text: "Um gráfico desconhecido e 12 passos de decisão. Nota de processo de 0 a 100 — o resultado do trade não conta." },
] as const;

const NOT = ["Sinais de compra ou venda", "Promessas de rentabilidade ou «win rates» garantidos", "Copy trading", "«Estratégias secretas»"] as const;

export default async function Home() {
  const user = await getCurrentUser();
  const lessons = MODULES.reduce((n, m) => n + m.lessons.length, 0);
  const questions = MODULES.reduce((n, m) => n + m.quiz.questions.length + m.lessons.reduce((k, l) => k + l.quiz.length, 0), 0);

  return (
    <PublicShell>
      <div className="grid gap-14 py-4 sm:py-8">
        <section className="grid gap-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Dow · Futures · Price Action</p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{BRAND.name}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{BRAND.subtitle}</p>
          <blockquote className="max-w-2xl border-l-2 border-primary pl-4 text-base italic text-foreground/90">{BRAND.principle}</blockquote>
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Ir para o painel <ArrowRight />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/register">
                    Criar conta gratuita <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Entrar</Link>
                </Button>
              </>
            )}
          </div>
          <dl className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [String(MODULES.length), "módulos"],
              [String(LEVELS.length), "níveis"],
              [String(lessons), "aulas"],
              [String(questions), "perguntas com explicação"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-lg border bg-card/60 p-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 text-2xl font-semibold tabular">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="pipeline" className="grid gap-3">
          <h2 id="pipeline" className="text-xl font-semibold">Um percurso, não um atalho</h2>
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            {BRAND.pipeline.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-full border bg-card px-3 py-1 font-medium">{step}</span>
                {i < BRAND.pipeline.length - 1 && <ArrowRight className="size-4 text-muted-foreground" aria-hidden />}
              </li>
            ))}
          </ol>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Antes do trade", BRAND.beforeTrade],
              ["Durante o trade", BRAND.duringTrade],
              ["Depois do trade", BRAND.afterTrade],
            ].map(([when, q]) => (
              <Card key={when}>
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{when}</p>
                  <p className="mt-1 font-medium">{q}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="features" className="grid gap-4">
          <h2 id="features" className="text-xl font-semibold">O que encontras lá dentro</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <CardContent className="grid gap-2 p-4">
                  <Icon className="size-5 text-primary" aria-hidden />
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="honest" className="grid gap-4 rounded-xl border bg-card/60 p-5 sm:p-6 lg:grid-cols-2">
          <div className="grid content-start gap-3">
            <h2 id="honest" className="flex items-center gap-2 text-xl font-semibold">
              <Ban className="size-5 text-danger" aria-hidden /> O que esta plataforma não é
            </h2>
            <ul className="grid gap-1.5 text-sm text-muted-foreground">
              {NOT.map((n) => (
                <li key={n} className="flex gap-2">
                  <span aria-hidden className="text-danger">✕</span> {n}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-3 text-sm text-muted-foreground">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <BookOpen className="size-5 text-primary" aria-hidden /> Transparência
            </h2>
            <p>Os gráficos de treino são sintéticos e rotulados <strong className="text-foreground">DEMO</strong>. Margens, spreads e comissões são valores ilustrativos. Os valores por ponto de YM e MYM vêm das especificações do CME.</p>
            <p>
              Consulta as <Link href="/sources" className="underline underline-offset-2">fontes de aprendizagem</Link> e o <Link href="/disclaimer" className="underline underline-offset-2">aviso legal</Link>. O «Confluence Trading Framework» é um método educativo original e não é o curso oficial de nenhuma entidade externa.
            </p>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
