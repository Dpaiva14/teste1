"use client";

import { Eraser, Minus, MousePointer2, Percent, Square, TrendingUp, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_DRAWINGS, type Drawing } from "../schemas";

export type Tool = "none" | Drawing["kind"];

const TOOLS: { key: Tool; label: string; icon: typeof Minus; hint: string }[] = [
  { key: "none", label: "Cursor", icon: MousePointer2, hint: "Sem desenhar" },
  { key: "level", label: "Nível", icon: Minus, hint: "Clica no preço para marcar um nível horizontal" },
  { key: "zone", label: "Zona", icon: Square, hint: "Arrasta para marcar uma zona de suporte/resistência" },
  { key: "trend", label: "Tendência", icon: TrendingUp, hint: "Arrasta de um ponto a outro para traçar uma linha" },
  { key: "fib", label: "Fibonacci", icon: Percent, hint: "Arrasta do início (A) ao fim (B) de um movimento" },
];

export function DrawingToolbar({ tool, onTool, count, onUndo, onClear, disabled }: { tool: Tool; onTool: (t: Tool) => void; count: number; onUndo: () => void; onClear: () => void; disabled: boolean }) {
  const active = TOOLS.find((t) => t.key === tool);
  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label="Ferramenta de desenho">
        {TOOLS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={tool === key}
            disabled={disabled}
            onClick={() => onTool(key)}
            className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50", tool === key ? "border-primary bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <Icon className="size-3.5" aria-hidden /> {label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <Button size="sm" variant="ghost" disabled={disabled || count === 0} onClick={onUndo}>
          <Undo2 /> Desfazer
        </Button>
        <Button size="sm" variant="ghost" disabled={disabled || count === 0} onClick={onClear}>
          <Eraser /> Limpar
        </Button>
        <span className="ml-auto text-xs text-muted-foreground tabular">
          {count}/{MAX_DRAWINGS} desenhos
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{active?.hint}. Marcar o teu plano antes de entrar conta na avaliação de processo.</p>
    </div>
  );
}
