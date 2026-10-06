"use client";

import type { ExerciseSpec } from "@/modules/types";
import { ConfluenceLab } from "./confluence-lab";
import { FibonacciLab } from "./fibonacci-lab";
import { LevelsLab } from "./levels-lab";
import { StructureLab } from "./structure-lab";

type LabSpec = Extract<ExerciseSpec, { kind: "structure" | "levels" | "fibonacci" | "confluence" }>;

/** Renders a lab inline inside a lesson, locked to one scenario. */
export function LabEmbed({ spec }: { spec: LabSpec }) {
  const scenarios = [{ id: spec.scenarioId, title: spec.scenarioId, bestScore: null }];
  return (
    <div className="grid gap-3">
      {spec.prompt && <p className="text-sm text-muted-foreground">{spec.prompt}</p>}
      {spec.kind === "structure" && <StructureLab scenarios={scenarios} compact />}
      {spec.kind === "levels" && <LevelsLab scenarios={scenarios} compact />}
      {spec.kind === "fibonacci" && <FibonacciLab scenarios={scenarios} compact />}
      {spec.kind === "confluence" && <ConfluenceLab scenarios={scenarios} compact />}
    </div>
  );
}
