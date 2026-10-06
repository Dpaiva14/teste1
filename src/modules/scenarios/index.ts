import { CONFLUENCE_SCENARIOS } from "./confluence";
import { FIB_SCENARIOS } from "./fibonacci";
import { LEVEL_SCENARIOS } from "./levels";
import { STRUCTURE_SCENARIOS } from "./structure";
import type { ScenarioDef } from "./types";

export const SCENARIOS: readonly ScenarioDef[] = [...STRUCTURE_SCENARIOS, ...LEVEL_SCENARIOS, ...FIB_SCENARIOS, ...CONFLUENCE_SCENARIOS];

const byId = new Map(SCENARIOS.map((s) => [s.id, s]));

export function getScenario(id: string): ScenarioDef | undefined {
  return byId.get(id);
}

export function requireScenario(id: string): ScenarioDef {
  const s = byId.get(id);
  if (!s) throw new Error(`Unknown scenario: ${id}`);
  return s;
}

export type { ScenarioDef } from "./types";
