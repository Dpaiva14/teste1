import type { ScenarioDef } from "./types";

/** Support/resistance scenarios for "Draw Your Levels". Zones are the educational solution (±~15 pts). */
export const LEVEL_SCENARIOS: readonly ScenarioDef[] = [
  {
    id: "levels-range-01",
    title: "Resistência e suporte bem definidos",
    description: "O preço rejeita três vezes uma resistência e três vezes um suporte.",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-13T13:30:00Z",
    seed: 201,
    points: [
      { at: 0, price: 38450 }, { at: 10, price: 38600 }, { at: 18, price: 38300 }, { at: 28, price: 38605 },
      { at: 36, price: 38305 }, { at: 46, price: 38595 }, { at: 54, price: 38298 }, { at: 64, price: 38460 },
    ],
    tail: 8,
    levels: {
      zones: [
        { kind: "resistance", top: 38625, bottom: 38585, touches: 3, note: "Três máximos (38.600 / 38.605 / 38.595) rejeitados na mesma zona: oferta a absorver compras. Desenha uma ZONA, não uma linha exata." },
        { kind: "support", top: 38320, bottom: 38280, touches: 3, note: "Três mínimos (38.300 / 38.305 / 38.298) seguram na mesma região: procura a absorver vendas." },
      ],
    },
  },
  {
    id: "levels-flip-01",
    title: "Resistência que se torna suporte",
    description: "Uma resistência testada três vezes é rompida e depois testada por cima como suporte.",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-14T13:30:00Z",
    seed: 202,
    points: [
      { at: 0, price: 38000 }, { at: 10, price: 38300 }, { at: 18, price: 38150 }, { at: 28, price: 38305 },
      { at: 36, price: 38140 }, { at: 46, price: 38310 }, { at: 58, price: 38520 }, { at: 66, price: 38302 },
      { at: 80, price: 38600 },
    ],
    tail: 6,
    levels: {
      zones: [
        { kind: "support", top: 38325, bottom: 38285, touches: 4, note: "Era resistência (3 rejeições) e passou a suporte depois do rompimento: o reteste em 38.302 respeitou a zona. Suporte↔resistência é uma das ideias mais usadas — mas pode falhar." },
        { kind: "support", top: 38165, bottom: 38125, touches: 2, note: "Dois mínimos (38.150 / 38.140) antes do rompimento: suporte menor, mais frágil (apenas 2 toques)." },
      ],
    },
  },
];
