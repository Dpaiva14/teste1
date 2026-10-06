"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ExerciseSpec } from "@/modules/types";

const LAB_ROUTE = {
  structure: { href: "/labs/market-structure", label: "Market Structure Lab" },
  levels: { href: "/labs/levels", label: "Draw Your Levels" },
  fibonacci: { href: "/labs/fibonacci", label: "Fibonacci Lab" },
  confluence: { href: "/labs/confluence", label: "Confluence Lab" },
} as const;

/** Placeholder until the labs are embedded inline (replaced by the real lab components). */
export function LabEmbed({ spec }: { spec: Extract<ExerciseSpec, { kind: "structure" | "levels" | "fibonacci" | "confluence" }> }) {
  const lab = LAB_ROUTE[spec.kind];
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm">{spec.prompt ?? "Pratica este conceito num gráfico interativo."}</p>
        <Button asChild>
          <Link href={`${lab.href}?scenario=${spec.scenarioId}`}>
            Abrir {lab.label} <ArrowRight />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
