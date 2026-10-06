import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";
import { getAdminStats } from "@/features/admin/server/stats-service";

export const metadata: Metadata = { title: "Visão geral" };

const pct = (v: number | null) => (v === null ? "—" : `${v.toLocaleString("pt-PT", { maximumFractionDigits: 1 })}%`);

export default async function AdminHome() {
  const s = await getAdminStats();
  return (
    <div className="grid gap-6">
      <section aria-labelledby="a-users" className="grid gap-3">
        <h2 id="a-users" className="text-lg font-semibold">Utilizadores</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Total" value={s.users.total} />
          <Stat label="Alunos" value={s.users.students} />
          <Stat label="Admins" value={s.users.admins} />
          <Stat label="Desativados" value={s.users.disabled} tone={s.users.disabled > 0 ? "warning" : "default"} />
          <Stat label="Novos (7 dias)" value={s.users.new7d} />
          <Stat label="Ativos (7 dias)" value={s.users.active7d} />
        </div>
      </section>

      <section aria-labelledby="a-learn" className="grid gap-3">
        <h2 id="a-learn" className="text-lg font-semibold">Aprendizagem e conteúdo</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Módulos" value={s.content.modules} />
          <Stat label="Aulas" value={s.content.lessons} hint={`${s.content.publishedLessons} publicadas`} />
          <Stat label="Perguntas" value={s.content.questions} />
          <Stat label="Aulas concluídas" value={s.learning.lessonsCompleted} />
          <Stat label="Tentativas de quiz" value={s.learning.quizAttempts} />
          <Stat label="Nota média / aprovação" value={s.learning.avgScore === null ? "—" : `${s.learning.avgScore}%`} hint={`aprovação ${pct(s.learning.passRate)}`} />
        </div>
      </section>

      <section aria-labelledby="a-prac" className="grid gap-3">
        <h2 id="a-prac" className="text-lg font-semibold">Prática</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Trades (simulador)" value={s.practice.simulatorTrades} />
          <Stat label="Trades (replay)" value={s.practice.replayTrades} />
          <Stat label="Decisões (backtest)" value={s.practice.backtestDecisions} />
          <Stat label="Entradas de journal" value={s.practice.journalEntries} />
          <Stat label="Planos diários" value={s.practice.dailyPlans} />
          <Stat label="Conversas com tutor" value={s.practice.tutorConversations} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Aulas mais concluídas</CardTitle></CardHeader>
          <CardContent>
            {s.topLessons.length === 0 ? <p className="text-sm text-muted-foreground">Sem dados ainda.</p> : (
              <ol className="grid gap-1.5 text-sm">
                {s.topLessons.map((l) => (
                  <li key={l.title} className="flex justify-between gap-2"><span className="truncate">{l.title}</span><span className="tabular text-muted-foreground">{l.completions}</span></li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Quizzes mais difíceis</CardTitle></CardHeader>
          <CardContent>
            {s.hardestQuizzes.length === 0 ? <p className="text-sm text-muted-foreground">Precisa de pelo menos 5 tentativas por quiz.</p> : (
              <ol className="grid gap-1.5 text-sm">
                {s.hardestQuizzes.map((q) => (
                  <li key={q.title} className="flex justify-between gap-2"><span className="truncate">{q.title}</span><span className="tabular text-muted-foreground">{q.avgScore}% · {q.attempts}×</span></li>
                ))}
              </ol>
            )}
            <p className="mt-3 text-xs text-muted-foreground">Notas médias baixas sugerem pergunta ambígua ou lição pouco clara — rever o conteúdo.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Registos recentes</CardTitle></CardHeader>
          <CardContent>
            <ul className="grid gap-1.5 text-sm">
              {s.recentUsers.map((u) => (
                <li key={u.email} className="flex justify-between gap-2"><span className="truncate">{u.name}</span><span className="tabular text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString("pt-PT")}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
