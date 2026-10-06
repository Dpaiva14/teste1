export interface GlossaryEntry {
  slug: string;
  term: string;
  category: "Mercado" | "Instrumentos" | "Ordens e execução" | "Análise técnica" | "Risco" | "Psicologia" | "Estatística";
  definition: string;
  simple: string;
  technical: string;
  example: string;
  related: readonly string[];
}

export const GLOSSARY: readonly GlossaryEntry[] = [
  {
    slug: "tick",
    term: "Tick",
    category: "Instrumentos",
    definition: "A menor variação de preço permitida num instrumento.",
    simple: "O \"degrau\" mais pequeno que o preço pode dar.",
    technical: "Definido pela bolsa para cada contrato. No YM e no MYM, 1 tick = 1,00 ponto do índice.",
    example: "No YM, passar de 39.000 para 39.001 é 1 tick (= $5 por contrato).",
    related: ["point", "tick-value"],
  },
  {
    slug: "point",
    term: "Point (ponto)",
    category: "Instrumentos",
    definition: "Uma unidade do valor de um índice.",
    simple: "Se o índice vai de 39.000 para 39.050, subiu 50 pontos.",
    technical: "O valor em dólares de um ponto depende do contrato: YM $5, MYM $0,50; num CFD depende do broker.",
    example: "50 pontos × $5 × 1 YM = $250.",
    related: ["tick", "tick-value"],
  },
  {
    slug: "tick-value",
    term: "Tick value",
    category: "Instrumentos",
    definition: "O valor monetário de um tick por contrato.",
    simple: "Quanto dinheiro vale cada degrau do preço.",
    technical: "YM: $5,00 por tick; MYM: $0,50 por tick (CME Group).",
    example: "Stop de 40 ticks no MYM = 40 × $0,50 = $20 por contrato.",
    related: ["tick", "point"],
  },
];

export function getGlossaryEntry(slug: string): GlossaryEntry | undefined {
  return GLOSSARY.find((g) => g.slug === slug);
}
