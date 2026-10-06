"use client";

import { Loader2, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LabCheckResponse } from "./use-lab";

export interface ScenarioOption {
  id: string;
  title: string;
  bestScore: number | null;
}

export function ScenarioPicker({ scenarios, value, onChange }: { scenarios: ScenarioOption[]; value: string; onChange: (id: string) => void }) {
  if (scenarios.length <= 1) return null;
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cenário</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger aria-label="Escolher cenário">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {scenarios.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.title}
              {s.bestScore !== null ? ` · melhor ${s.bestScore}%` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function LabLoading() {
  return (
    <div className="flex h-72 items-center justify-center rounded-lg border text-muted-foreground">
      <Loader2 className="mr-2 size-4 animate-spin" /> A carregar gráfico…
    </div>
  );
}

export function ScoreBanner({ result, extra }: { result: Pick<LabCheckResponse, "scorePercent" | "passed" | "xpAwarded">; extra?: React.ReactNode }) {
  return (
    <div className={cn("flex items-center gap-4 rounded-lg border p-4", result.passed ? "border-success/50 bg-success/10" : "border-warning/50 bg-warning/10")}>
      <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-full border-4 text-lg font-bold tabular", result.passed ? "border-success text-success" : "border-warning text-warning")}>
        {result.scorePercent}%
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-semibold">
          {result.passed ? <Trophy className="size-4 text-success" /> : null}
          {result.passed ? "Muito bem!" : "Quase — vê o que ficou por identificar"}
        </p>
        <p className="text-sm text-muted-foreground">
          Mínimo 70% para pontuar.
          {result.xpAwarded > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 font-medium text-primary">
              <Sparkles className="size-3.5" />+{result.xpAwarded} XP
            </span>
          )}
        </p>
        {extra}
      </div>
    </div>
  );
}

/** Fires achievement toasts once per result. */
export function useAchievementToasts(result: Pick<LabCheckResponse, "newAchievements"> | null) {
  useEffect(() => {
    if (!result) return;
    for (const a of result.newAchievements) toast.success(`Conquista desbloqueada: ${a.title}`, { description: a.description });
  }, [result]);
}

export function LabHint({ children }: { children: React.ReactNode }) {
  return <p className="rounded-md border border-primary/25 bg-primary/5 p-3 text-sm text-muted-foreground">{children}</p>;
}

export function DemoFootnote() {
  return <Badge variant="demo" className="w-fit">DEMO · gráfico sintético</Badge>;
}
