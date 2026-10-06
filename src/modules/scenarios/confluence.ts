import type { ChartOverlay } from "@/features/chart/types";
import type { ScenarioDef } from "./types";

/**
 * Confluence scenarios: a decision point (decisionIndex) with a proposed trade. Candles AFTER decisionIndex are the
 * "what happened" reveal. Two of the three outcomes deliberately contradict the quality of the process:
 *   - conf-strong-long       strong process, wins
 *   - conf-weak-long         weak process, wins by luck
 *   - conf-strong-short-loss strong process, loses  → "outcome ≠ process"
 */

const strongLongPoints = [
  { at: 0, price: 38000 }, { at: 8, price: 38200 }, { at: 16, price: 38090 }, { at: 30, price: 38420 },
  { at: 38, price: 38300 }, { at: 52, price: 38620 }, { at: 59, price: 38455 }, { at: 63, price: 38520 },
  { at: 70, price: 38450 },
] as const;

const mirror = (p: number) => 77000 - p;
const strongShortPoints = strongLongPoints.map((p) => ({ at: p.at, price: mirror(p.price) }));

const strongAnnotations: ChartOverlay[] = [
  { type: "zone", id: "flip", top: 38458, bottom: 38418, fromIndex: 40, label: "S/R flip (ex-resistência) + Fib 50–61,8%", tone: "info" },
  { type: "hline", id: "eq-lows", price: 38452, label: "Equal lows (liquidez)", tone: "warning", dashed: true },
];

export const CONFLUENCE_SCENARIOS: readonly ScenarioDef[] = [
  {
    id: "conf-strong-long",
    title: "Compra com confluência forte (7/8)",
    description: "Tendência bullish, pullback para um nível S/R que muda de função, zona Fibonacci, equal lows varridos e engulfing.",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-20T13:30:00Z",
    seed: 401,
    points: [...strongLongPoints, { at: 80, price: 38790 }],
    tail: 6,
    overrides: [
      { at: 73, ohlc: [38470, 38480, 38418, 38465] }, // sweep of equal lows, long lower wick
      { at: 74, ohlc: [38462, 38515, 38455, 38512] }, // bullish engulfing
    ],
    annotations: strongAnnotations,
    confluence: {
      decisionIndex: 74,
      direction: "LONG",
      entry: 38512,
      stop: 38408,
      target: 38710,
      factors: {
        trend: { present: true, note: "Sequência HH/HL no timeframe de trabalho (e, neste exemplo, o viés do timeframe superior é de alta)." },
        structure: { present: true, note: "O último HL (38.300) continua intacto e o pullback é uma correção dentro da estrutura, não uma quebra." },
        sr: { present: true, note: "O pullback para 38.420–38.455 coincide com a antiga resistência (H2 = 38.420) rompida e agora a funcionar como suporte." },
        supplyDemand: { present: false, note: "A zona de procura relevante (base antes do impulso, ~38.300) está longe: o preço não está a reagir a uma zona de procura fresca. Falta este fator." },
        fibonacci: { present: true, note: "O pullback recuou entre 50% (38.460) e 61,8% (38.422) do impulso 38.300→38.620." },
        priceAction: { present: true, note: "Candle de rejeição (pavio inferior longo) seguido de engulfing bullish no ponto de decisão." },
        liquidity: { present: true, note: "Dois mínimos iguais (≈38.450–38.455) foram varridos (low 38.418) e o preço recuperou: stops abaixo foram absorvidos." },
        riskReward: { present: true, note: "Risco 104 pts (entrada 38.512 → stop 38.408), alvo 198 pts (extensão ≈127,2%) → R:R ≈ 1,9:1, acima do mínimo de 1,5." },
      },
      verdict:
        "Processo sólido (7/8): só falta o fator oferta/procura. Mesmo assim, 7/8 NÃO garante nada: define o stop, calcula o tamanho e aceita que qualquer trade individual pode perder. Neste exemplo o preço seguiu para o alvo — mas o valor do exercício está na análise, não no resultado.",
    },
  },
  {
    id: "conf-weak-long",
    title: "Compra sem confluência (0–1/8) — e que ganha",
    description: "Ideia de compra contra a estrutura, sem confirmação e com mau R:R. O preço acaba por subir (sorte).",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-21T13:30:00Z",
    seed: 402,
    points: [
      { at: 0, price: 39000 }, { at: 8, price: 38780 }, { at: 16, price: 38890 }, { at: 28, price: 38600 },
      { at: 36, price: 38740 }, { at: 50, price: 38420 }, { at: 58, price: 38560 }, { at: 66, price: 38505 },
      { at: 82, price: 38760 },
    ],
    tail: 6,
    overrides: [{ at: 66, ohlc: [38512, 38521, 38498, 38508] }], // indecision candle
    confluence: {
      decisionIndex: 66,
      direction: "LONG",
      entry: 38508,
      stop: 38458,
      target: 38538,
      factors: {
        trend: { present: false, note: "A sequência é LH/LL (bearish): comprar é ir contra a tendência de trabalho, sem justificação de timeframe superior." },
        structure: { present: false, note: "Nenhuma quebra de estrutura a favor da compra: o último LL (38.420) e o último LH (38.560) continuam a mandar." },
        sr: { present: false, note: "O preço está a meio caminho entre o último mínimo e o último máximo — sem suporte relevante no ponto de entrada." },
        supplyDemand: { present: false, note: "Não há zona de procura fresca junto à entrada; acima há oferta (zona do LH 38.560)." },
        fibonacci: { present: false, note: "Não existe um swing de referência coerente com a ideia; qualquer 'nível' seria escolhido a posteriori." },
        priceAction: { present: false, note: "Candle de indecisão (corpo minúsculo), sem rejeição nem confirmação." },
        liquidity: { present: false, note: "Não há liquidez evidente varrida; nada explica porque é que 'agora'." },
        riskReward: { present: false, note: "Risco 50 pts vs. alvo 30 pts → R:R de 0,6:1. Precisarias de acertar ≈63% das vezes só para empatar." },
      },
      verdict:
        "Processo fraco (0/8). No gráfico real o preço subiu depois — mas isso foi sorte, não vantagem. Repetir decisões destas é uma receita para perder ao longo do tempo. Um resultado positivo não valida um processo mau.",
    },
  },
  {
    id: "conf-strong-short-loss",
    title: "Venda com confluência forte (7/8) — e que perde",
    description: "O mesmo desenho do exemplo forte, em espelho (venda). O stop é atingido: processo bom, resultado mau.",
    symbol: "YM",
    timeframe: "M15",
    startISO: "2025-01-22T13:30:00Z",
    seed: 403,
    points: [...strongShortPoints, { at: 80, price: 38640 }],
    tail: 6,
    overrides: [
      { at: 73, ohlc: [38530, 38582, 38520, 38535] }, // sweep of equal highs, long upper wick
      { at: 74, ohlc: [38538, 38545, 38485, 38488] }, // bearish engulfing
    ],
    annotations: [
      { type: "zone", id: "flip", top: 38582, bottom: 38542, fromIndex: 40, label: "S/R flip (ex-suporte) + Fib 50–61,8%", tone: "info" },
      { type: "hline", id: "eq-highs", price: 38548, label: "Equal highs (liquidez)", tone: "warning", dashed: true },
    ],
    confluence: {
      decisionIndex: 74,
      direction: "SHORT",
      entry: 38488,
      stop: 38592,
      target: 38290,
      factors: {
        trend: { present: true, note: "Sequência LH/LL no timeframe de trabalho, com viés de baixa no timeframe superior." },
        structure: { present: true, note: "O último LH (38.700) intacto; o repique foi uma correção dentro da estrutura bearish." },
        sr: { present: true, note: "O repique chegou à zona 38.545–38.580, antigo suporte rompido que agora funciona como resistência." },
        supplyDemand: { present: false, note: "A zona de oferta relevante (base antes do impulso, ~38.700) está longe do ponto de entrada. Falta este fator." },
        fibonacci: { present: true, note: "O repique recuperou entre 50% e 61,8% do impulso 38.700→38.380." },
        priceAction: { present: true, note: "Rejeição com pavio superior longo e engulfing bearish no ponto de decisão." },
        liquidity: { present: true, note: "Equal highs varridos (high 38.582) e recuperação para baixo." },
        riskReward: { present: true, note: "Risco 104 pts, alvo 198 pts → R:R ≈ 1,9:1." },
      },
      verdict:
        "Mesma qualidade de processo do exemplo bullish (7/8) — mas aqui o stop foi atingido. Uma perda com processo correto é parte normal do trading: perde-se 1R e segue-se. Julga o processo, não o resultado de um único trade.",
    },
  },
];
