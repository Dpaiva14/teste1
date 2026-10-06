import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Stat } from "@/components/ui/stat";
import { ModuleCard } from "@/features/academy/components/module-card";
import { getCurriculum } from "@/features/academy/server/curriculum-service";
import { requireUserPage } from "@/lib/auth/session";
import { UNLOCK_THRESHOLD } from "@/modules/levels";

export const metadata: Metadata = { title: "Academy" };

export default async function AcademyPage() {
  const user = await requireUserPage("/academy");
  const c = await getCurriculum(user);
  const overall = c.totals.lessons ? Math.round((c.totals.completedLessons / c.totals.lessons) * 100) : 0;

  return (
    <div className="grid gap-8">
      <header className="grid gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Academy</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            26 módulos, 10 níveis. Começas pelas bases e só avanças para execução e backtesting depois de dominares o contexto. Cada nível desbloqueia quando concluíres {Math.round(UNLOCK_THRESHOLD * 100)}% das aulas do anterior.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Progresso total" value={`${overall}%`} hint={`${c.totals.completedLessons}/${c.totals.lessons} aulas`} tone="primary" />
          <Stat label="Módulos concluídos" value={`${c.totals.completedModules}/${c.totals.modules}`} />
          <Stat label="Quizzes de módulo" value={`${c.totals.quizzesPassed}/${c.totals.quizzesTotal}`} />
          <Stat label="Score médio" value={c.totals.averageScore !== null ? `${c.totals.averageScore}%` : "—"} />
        </div>
      </header>

      <div className="grid gap-10">
        {c.levels.map((level) => (
          <section key={level.level} aria-labelledby={`level-${level.level}`} className="grid gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className={`flex size-9 items-center justify-center rounded-full border text-sm font-semibold ${level.unlocked ? "border-primary/50 bg-primary/12 text-primary" : "text-muted-foreground"}`}>
                {level.unlocked ? level.level : <Lock className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <h2 id={`level-${level.level}`} className="text-lg font-semibold leading-tight">
                  Nível {level.level} — {level.title}
                </h2>
                <p className="text-sm text-muted-foreground">{level.tagline}</p>
              </div>
              <Badge variant={level.level === c.currentLevel ? "default" : "outline"}>{level.level === c.currentLevel ? "Nível atual" : level.stage}</Badge>
              <div className="w-32">
                <Progress value={level.completion * 100} aria-label={`Progresso do nível ${level.level}`} />
              </div>
            </div>
            {level.modules.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {level.modules.map((m) => (
                  <ModuleCard key={m.id} module={m} locked={!level.unlocked} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem módulos publicados neste nível.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
