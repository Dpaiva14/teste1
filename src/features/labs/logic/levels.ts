import type { LevelZoneSolution, ScenarioDef } from "@/modules/scenarios/types";

export interface UserZone {
  top: number;
  bottom: number;
  kind: "support" | "resistance";
}

export interface ZoneMatch {
  solutionIndex: number;
  userIndex: number | null;
  /** 0..1 how close the user's zone is to the educational solution */
  locationScore: number;
  kindCorrect: boolean;
  note: string;
  solution: LevelZoneSolution;
}

export interface LevelsCheck {
  scorePercent: number;
  matches: ZoneMatch[];
  extraZones: number[];
  /** indexes of user zones that were too thick to be meaningful */
  tooThick: number[];
}

const center = (z: { top: number; bottom: number }) => (z.top + z.bottom) / 2;
const height = (z: { top: number; bottom: number }) => Math.abs(z.top - z.bottom);

/**
 * Compares user-drawn zones with the educational solution.
 * Location uses the distance between centres relative to a tolerance of ~0.6 ATR (zones, not exact lines);
 * zones thicker than 4× the solution are penalised. Kind (support/resistance) is worth 30% of each level.
 */
export function checkLevels(def: ScenarioDef, zones: readonly UserZone[], atr: number): LevelsCheck {
  if (!def.levels) throw new Error(`Scenario ${def.id} has no levels solution`);
  const solution = def.levels.zones;
  const tolerance = Math.max(0.6 * atr, 1);
  const taken = new Set<number>();
  const matches: ZoneMatch[] = [];

  solution.forEach((s, si) => {
    let bestIdx: number | null = null;
    let bestDist = Infinity;
    zones.forEach((z, zi) => {
      if (taken.has(zi)) return;
      const d = Math.abs(center(z) - center(s));
      if (d < bestDist) {
        bestDist = d;
        bestIdx = zi;
      }
    });
    if (bestIdx !== null && bestDist <= tolerance * 1.5) {
      const z = zones[bestIdx]!;
      taken.add(bestIdx);
      let loc = Math.max(0, 1 - bestDist / (tolerance * 1.5));
      if (height(z) > 4 * Math.max(height(s), 1)) loc *= 0.5; // a huge zone "covers everything" and says nothing
      matches.push({ solutionIndex: si, userIndex: bestIdx, locationScore: loc, kindCorrect: z.kind === s.kind, note: s.note, solution: s });
    } else {
      matches.push({ solutionIndex: si, userIndex: null, locationScore: 0, kindCorrect: false, note: s.note, solution: s });
    }
  });

  const extraZones = zones.map((_, i) => i).filter((i) => !taken.has(i));
  const tooThick = zones.map((z, i) => ({ z, i })).filter(({ z }) => height(z) > 8 * Math.max(...solution.map(height), 1)).map(({ i }) => i);
  const earned = matches.reduce((s, m) => s + (m.userIndex === null ? 0 : m.locationScore * 0.7 + (m.kindCorrect ? 0.3 : 0)), 0);
  const penalty = 0.25 * extraZones.length;
  return {
    scorePercent: Math.round(Math.max(0, Math.min(1, (earned - penalty) / solution.length)) * 100),
    matches,
    extraZones,
    tooThick,
  };
}
