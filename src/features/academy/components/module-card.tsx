import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { ModuleIcon } from "@/components/module-icon";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ModuleSummaryDTO } from "../types";

export function ModuleCard({ module: m, locked }: { module: ModuleSummaryDTO; locked: boolean }) {
  const pct = m.lessonCount ? Math.round((m.completedLessons / m.lessonCount) * 100) : 0;
  const done = m.lessonCount > 0 && m.completedLessons >= m.lessonCount;
  const body = (
    <div
      className={cn(
        "group flex h-full flex-col gap-3 rounded-xl border bg-card p-4 transition-colors",
        locked ? "opacity-60" : "hover:border-primary/50 hover:bg-accent/30",
        done && "border-success/40",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", done ? "bg-success/15 text-success" : "bg-primary/12 text-primary")}>
          {locked ? <Lock className="size-5" /> : <ModuleIcon name={m.icon} className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Módulo {String(m.number).padStart(2, "0")}</p>
          <h3 className="font-semibold leading-snug">{m.title}</h3>
        </div>
        {done && <CheckCircle2 className="size-5 shrink-0 text-success" aria-label="Módulo concluído" />}
      </div>
      <p className="line-clamp-2 text-sm text-muted-foreground">{m.summary}</p>
      <div className="mt-auto grid gap-2">
        <Progress value={pct} aria-label={`Progresso do módulo ${m.title}`} indicatorClassName={done ? "bg-success" : undefined} />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="tabular">
            {m.completedLessons}/{m.lessonCount} aulas · ~{m.estimatedMinutes} min
          </span>
          {m.quiz && (
            <Badge variant={m.quiz.passed ? "success" : "secondary"}>{m.quiz.passed ? `Quiz ${m.quiz.bestScore}%` : "Quiz do módulo"}</Badge>
          )}
        </div>
      </div>
    </div>
  );
  return locked ? (
    <div aria-disabled="true" title="Nível bloqueado — conclui o nível anterior">
      {body}
    </div>
  ) : (
    <Link href={`/academy/${m.slug}`} className="block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring">
      {body}
    </Link>
  );
}
