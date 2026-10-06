export interface LevelDef {
  level: number;
  slug: string;
  title: string;
  tagline: string;
  /** Learning-path stage shown on the dashboard ("Your Trading Development"). */
  stage: DevelopmentStage;
}

export type DevelopmentStage = "Beginner" | "Foundation" | "Intermediate" | "Advanced" | "Professional Development";

export const DEVELOPMENT_STAGES: readonly DevelopmentStage[] = ["Beginner", "Foundation", "Intermediate", "Advanced", "Professional Development"];

export const LEVELS: readonly LevelDef[] = [
  { level: 1, slug: "market-foundations", title: "Market Foundations", tagline: "O que são mercados, índices, CFDs e futuros.", stage: "Beginner" },
  { level: 2, slug: "technical-analysis", title: "Technical Analysis", tagline: "Ler candles, tendência, suportes e zonas de oferta/procura.", stage: "Beginner" },
  { level: 3, slug: "market-structure", title: "Market Structure", tagline: "Swings, estrutura, Fibonacci e price action.", stage: "Foundation" },
  { level: 4, slug: "confluence", title: "Confluence", tagline: "Liquidez e a arte de juntar razões independentes.", stage: "Foundation" },
  { level: 5, slug: "us30-futures", title: "US30 / Futures", tagline: "O Dow, YM/MYM, sessões e eventos económicos.", stage: "Intermediate" },
  { level: 6, slug: "strategy-development", title: "Strategy Development", tagline: "Setups educativos e construção de metodologia própria.", stage: "Intermediate" },
  { level: 7, slug: "risk-management", title: "Risk Management", tagline: "Risco, gestão de trade e psicologia.", stage: "Advanced" },
  { level: 8, slug: "advanced-execution", title: "Advanced Execution", tagline: "Replay, simulação e execução avançada.", stage: "Advanced" },
  { level: 9, slug: "backtesting", title: "Backtesting", tagline: "Testar, registar e analisar estatisticamente.", stage: "Advanced" },
  { level: 10, slug: "professional-development", title: "Professional Development", tagline: "Avaliação final e melhoria contínua.", stage: "Professional Development" },
] as const;

export function getLevel(level: number): LevelDef {
  const l = LEVELS.find((x) => x.level === level);
  if (!l) throw new Error(`Unknown level ${level}`);
  return l;
}

/** Share of lessons in the previous level that must be completed to unlock the next one. */
export const UNLOCK_THRESHOLD = 0.8;
