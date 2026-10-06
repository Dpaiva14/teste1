import type { ScenarioDef } from "./types";

/** Fibonacci scenarios. A→B is the impulse, C the end of the pullback. Educational: levels do not "cause" reversals. */
export const FIB_SCENARIOS: readonly ScenarioDef[] = [
  {
    id: "fib-bull-618",
    title: "Impulso de alta e pullback até ~61,8%",
    description: "Um impulso bullish A→B, uma correção que retrocede ≈61,8% e a continuação até perto da extensão de 127,2%.",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-15T13:30:00Z",
    seed: 301,
    points: [
      { at: 0, price: 38100 }, { at: 10, price: 37950 }, { at: 30, price: 38550 }, { at: 42, price: 38180 }, { at: 62, price: 38715 },
    ],
    tail: 6,
    fib: {
      a: { at: 10, price: 37950 },
      b: { at: 30, price: 38550 },
      c: { at: 42, price: 38180 },
      direction: "up",
      pullbackRatio: 0.618,
      note: "Impulso A(37.950)→B(38.550) = 600 pts. A correção terminou em 38.180 = (38.550−38.180)/600 ≈ 61,7% de retracement. A continuação aproximou-se da extensão de 127,2% (≈38.713). Isto ilustra a ferramenta — não prova que 61,8% 'faz o preço inverter'.",
    },
    annotations: [],
  },
  {
    id: "fib-bear-50",
    title: "Impulso de baixa e pullback até 50%",
    description: "Um impulso bearish A→B e uma correção que recupera cerca de metade do movimento.",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-16T13:30:00Z",
    seed: 302,
    points: [
      { at: 0, price: 39050 }, { at: 10, price: 39200 }, { at: 30, price: 38600 }, { at: 42, price: 38900 }, { at: 62, price: 38350 },
    ],
    tail: 6,
    fib: {
      a: { at: 10, price: 39200 },
      b: { at: 30, price: 38600 },
      c: { at: 42, price: 38900 },
      direction: "down",
      pullbackRatio: 0.5,
      note: "Impulso A(39.200)→B(38.600) = 600 pts. O repique recuperou 300 pts = 50%. O 50% não é um número de Fibonacci propriamente dito, mas é usado universalmente (herança da Teoria de Dow).",
    },
    annotations: [],
  },
  {
    id: "fib-failed-786",
    title: "Pullback profundo que falha",
    description: "A correção chega aos 78,6% e depois rompe o ponto A: a estrutura falha.",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-17T13:30:00Z",
    seed: 303,
    points: [
      { at: 0, price: 38050 }, { at: 10, price: 37900 }, { at: 30, price: 38500 }, { at: 44, price: 38030 }, { at: 50, price: 38180 }, { at: 62, price: 37840 },
    ],
    tail: 6,
    fib: {
      a: { at: 10, price: 37900 },
      b: { at: 30, price: 38500 },
      c: { at: 44, price: 38030 },
      direction: "up",
      pullbackRatio: 0.786,
      note: "A correção foi até ≈78,3% e depois quebrou o ponto A (37.900). Quanto mais profundo o pullback, mais fraca a tese de continuação — e abaixo de 100% a ideia fica invalidada. Os níveis de Fibonacci não protegem ninguém: o stop sim.",
    },
    annotations: [],
  },
];
