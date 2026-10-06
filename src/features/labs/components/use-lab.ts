"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api-client";
import type { Candle } from "@/lib/market-data/types";
import type { AchievementDef } from "@/modules/achievements";
import type { LabKind } from "../schemas";

export interface LabScenarioData {
  id: string;
  title: string;
  description: string;
  symbol: string;
  timeframe: string;
  priceDecimals: number;
  candles: Candle[];
  context: Record<string, unknown>;
}

export interface LabCheckResponse<F = Record<string, unknown>> {
  scorePercent: number;
  passed: boolean;
  xpAwarded: number;
  newAchievements: AchievementDef[];
  feedback: F;
}

export function useLabScenario(kind: LabKind, id: string) {
  const key = `${kind}:${id}`;
  const [state, setState] = useState<{ key: string; data: LabScenarioData | null; error: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<{ scenario: LabScenarioData }>(`/api/labs/${kind}/scenarios/${id}`)
      .then((r) => !cancelled && setState({ key, data: r.scenario, error: null }))
      .catch((e) => !cancelled && setState({ key, data: null, error: errorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [kind, id, key]);

  // Results belonging to another scenario are ignored: "loading" is derived, never set from the effect body.
  const current = state?.key === key ? state : null;
  return { data: current?.data ?? null, error: current?.error ?? null, loading: current === null };
}

export function useLabCheck<F>(kind: LabKind, id: string) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const check = useCallback(
    async (answer: unknown): Promise<LabCheckResponse<F> | null> => {
      setPending(true);
      setError(null);
      try {
        const res = await api<LabCheckResponse<F>>(`/api/labs/${kind}/scenarios/${id}/check`, { method: "POST", body: answer });
        router.refresh(); // header XP / streak
        return res;
      } catch (e) {
        setError(errorMessage(e));
        return null;
      } finally {
        setPending(false);
      }
    },
    [kind, id, router],
  );
  return { check, pending, error };
}
