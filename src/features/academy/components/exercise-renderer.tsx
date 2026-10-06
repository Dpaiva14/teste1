"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { CostsCalculator } from "@/features/calculators/components/costs-calculator";
import { LeverageCalculator } from "@/features/calculators/components/leverage-calculator";
import { PositionSizeFutures } from "@/features/calculators/components/position-size-futures";
import { RewardRiskCalculator } from "@/features/calculators/components/rr-calculator";
import { RiskCalculator } from "@/features/calculators/components/risk-calculator";
import { TickValueCalculator } from "@/features/calculators/components/tick-value-calculator";
import type { ExerciseSpec } from "@/modules/types";
import { LabEmbed } from "@/features/labs/components/lab-embed";

function Reflection({ lessonId, prompt, placeholder }: { lessonId: string; prompt: string; placeholder?: string }) {
  const key = `reflection:${lessonId}`;
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    // Sync the uncontrolled textarea with what this browser saved earlier (external system: localStorage).
    try {
      if (ref.current) ref.current.value = localStorage.getItem(key) ?? "";
    } catch {
      /* storage unavailable */
    }
  }, [key]);
  return (
    <Card>
      <CardContent className="grid gap-3 p-5">
        <p className="font-medium">{prompt}</p>
        <Textarea
          ref={ref}
          defaultValue=""
          rows={4}
          placeholder={placeholder}
          onChange={(e) => {
            try {
              localStorage.setItem(key, e.target.value);
            } catch {
              /* ignore */
            }
          }}
        />
        <p className="text-xs text-muted-foreground">Reflexão pessoal — fica guardada apenas neste browser e não é avaliada.</p>
      </CardContent>
    </Card>
  );
}

export function ExerciseRenderer({ spec, lessonId }: { spec: ExerciseSpec; lessonId: string }) {
  switch (spec.kind) {
    case "calculator":
      return (
        <div className="grid gap-3">
          {spec.prompt && <p className="text-sm text-muted-foreground">{spec.prompt}</p>}
          {spec.tool === "tick-value" && <TickValueCalculator />}
          {spec.tool === "leverage" && <LeverageCalculator />}
          {spec.tool === "costs" && <CostsCalculator />}
          {spec.tool === "rr" && <RewardRiskCalculator />}
          {spec.tool === "position-size" && <PositionSizeFutures />}
          {spec.tool === "risk" && <RiskCalculator />}
        </div>
      );
    case "reflection":
      return <Reflection lessonId={lessonId} prompt={spec.prompt} placeholder={spec.placeholder} />;
    case "link":
      return (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="text-sm">{spec.prompt}</p>
            <Button asChild>
              <Link href={spec.href}>
                {spec.label} <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    case "structure":
    case "levels":
    case "fibonacci":
    case "confluence":
      return <LabEmbed spec={spec} />;
  }
}
