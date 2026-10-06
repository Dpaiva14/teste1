import type { ScenarioDef } from "./types";

/**
 * Market-structure scenarios (DEMO, synthetic). Every interior waypoint is, by construction, a clean swing
 * high/low (verified by scenarios.test.ts). Prices are synthetic index levels — not real Dow history.
 */
export const STRUCTURE_SCENARIOS: readonly ScenarioDef[] = [
  {
    id: "structure-bull-01",
    title: "Estrutura bullish — escadaria de HH/HL",
    description: "Uma sequência de máximos e mínimos progressivamente mais altos.",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-06T13:30:00Z",
    seed: 101,
    points: [
      { at: 0, price: 38000 }, { at: 8, price: 38240 }, { at: 16, price: 38090 }, { at: 28, price: 38420 },
      { at: 36, price: 38250 }, { at: 50, price: 38610 }, { at: 58, price: 38440 }, { at: 72, price: 38800 },
      { at: 80, price: 38650 }, { at: 88, price: 38780 },
    ],
    tail: 6,
    structure: {
      answer: "BULLISH",
      note: "Cada máximo (HH) supera o anterior e cada mínimo (HL) fica acima do mínimo anterior: compradores a controlar as correções.",
    },
  },
  {
    id: "structure-bear-01",
    title: "Estrutura bearish — escadaria de LH/LL",
    description: "Máximos e mínimos progressivamente mais baixos.",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-07T13:30:00Z",
    seed: 102,
    points: [
      { at: 0, price: 39000 }, { at: 8, price: 38760 }, { at: 16, price: 38910 }, { at: 28, price: 38580 },
      { at: 36, price: 38750 }, { at: 50, price: 38390 }, { at: 58, price: 38560 }, { at: 72, price: 38200 },
      { at: 80, price: 38350 }, { at: 88, price: 38220 },
    ],
    tail: 6,
    structure: {
      answer: "BEARISH",
      note: "Cada mínimo (LL) rompe o anterior e cada recuperação falha num máximo mais baixo (LH): vendedores a controlar os repiques.",
    },
  },
  {
    id: "structure-range-01",
    title: "Mercado lateral — swings sobrepostos",
    description: "Os swings sobrepõem-se: os rótulos misturam-se (LH, HL, HH, LL).",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-08T13:30:00Z",
    seed: 103,
    points: [
      { at: 0, price: 38350 }, { at: 8, price: 38480 }, { at: 16, price: 38210 }, { at: 28, price: 38455 },
      { at: 36, price: 38235 }, { at: 46, price: 38490 }, { at: 54, price: 38200 }, { at: 66, price: 38470 },
      { at: 74, price: 38220 }, { at: 82, price: 38400 },
    ],
    tail: 6,
    structure: {
      answer: "RANGE",
      note: "Não há sequência consistente: os máximos e mínimos oscilam à volta da mesma faixa (≈38.200–38.490). Sinais mistos = mercado sem direção clara.",
    },
  },
  {
    id: "structure-shift-bull-to-bear",
    title: "Mudança de estrutura — de bullish para bearish",
    description: "Uma tendência de alta que perde a estrutura: quebra do último HL e sequência LH/LL.",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-09T13:30:00Z",
    seed: 104,
    points: [
      { at: 0, price: 38000 }, { at: 8, price: 38250 }, { at: 16, price: 38100 }, { at: 28, price: 38440 },
      { at: 36, price: 38290 }, { at: 50, price: 38620 }, { at: 58, price: 38430 }, { at: 70, price: 38520 },
      { at: 80, price: 38300 }, { at: 88, price: 38410 }, { at: 98, price: 38170 }, { at: 104, price: 38260 },
    ],
    tail: 6,
    structure: {
      answer: "BEARISH",
      note: "A estrutura era bullish até ao HL de 38.430. O LH em 38.520 (não superou 38.620) e a quebra desse HL (LL em 38.300) sinalizam a mudança para estrutura bearish.",
    },
    annotations: [
      { type: "hline", id: "last-hl", price: 38430, label: "Último HL — a sua quebra muda a estrutura", tone: "warning", dashed: true },
    ],
  },
  {
    id: "structure-shift-bear-to-bull",
    title: "Mudança de estrutura — de bearish para bullish",
    description: "Uma tendência de baixa que perde a estrutura: quebra do último LH e sequência HL/HH.",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-10T13:30:00Z",
    seed: 105,
    points: [
      { at: 0, price: 39000 }, { at: 8, price: 38750 }, { at: 16, price: 38900 }, { at: 28, price: 38560 },
      { at: 36, price: 38710 }, { at: 50, price: 38380 }, { at: 58, price: 38570 }, { at: 70, price: 38480 },
      { at: 80, price: 38700 }, { at: 88, price: 38590 }, { at: 98, price: 38830 }, { at: 104, price: 38740 },
    ],
    tail: 6,
    structure: {
      answer: "BULLISH",
      note: "A estrutura era bearish até ao LH de 38.570. O HL em 38.480 (acima do LL de 38.380) e o HH em 38.700 que quebra o LH anterior sinalizam a mudança para estrutura bullish.",
    },
    annotations: [
      { type: "hline", id: "last-lh", price: 38570, label: "Último LH — a sua quebra muda a estrutura", tone: "warning", dashed: true },
    ],
  },
];
