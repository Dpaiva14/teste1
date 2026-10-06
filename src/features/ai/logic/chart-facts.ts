import { atrSeries, classifyStructure, detectSwings, labelStructure, lastAtr, type MarketStructure } from "@/lib/market-data/indicators";
import type { Candle } from "@/lib/market-data/types";
import { roundTo } from "@/lib/money";

/**
 * Objective, reproducible facts about a candle series. Everything here is computed — nothing is predicted — and the
 * same facts feed both the deterministic reading below and (optionally) the AI narrative, so the model never has to
 * "see" numbers it could misread.
 */
export interface KeyLevel {
  price: number;
  touches: number;
  /** relative to the last close */
  kind: "support" | "resistance";
  distancePoints: number;
  distanceAtr: number;
}

export interface ChartFacts {
  candles: number;
  structure: MarketStructure;
  /** label of the most recent swing high / low (HH, LH, HL, LL) — explains WHY the structure is what it is */
  lastHighLabel: string | null;
  lastLowLabel: string | null;
  swings: { index: number; type: "high" | "low"; price: number; label: string | null }[];
  atr: number;
  lastClose: number;
  rangeHigh: number;
  rangeLow: number;
  /** where the last close sits inside the range: 0 = at the low, 100 = at the high */
  rangePosition: number;
  /** close-to-close change over the last 10 candles, in ATR units */
  momentumAtr: number;
  lastCandle: { direction: "bullish" | "bearish" | "doji"; bodyAtr: number; upperWickPct: number; lowerWickPct: number };
  levels: KeyLevel[];
  invalidation: { bullish: number | null; bearish: number | null };
}

const CLUSTER_ATR = 0.6;

export function computeChartFacts(candles: readonly Candle[]): ChartFacts {
  if (candles.length < 20) throw new Error("São precisos pelo menos 20 candles para analisar.");
  const last = candles[candles.length - 1]!;
  const atr = lastAtr(candles) || 1;
  const swings = labelStructure(detectSwings(candles, 3, 3));
  const rangeHigh = Math.max(...candles.map((c) => c.high));
  const rangeLow = Math.min(...candles.map((c) => c.low));
  const span = rangeHigh - rangeLow || 1;

  // Cluster swing prices that sit within CLUSTER_ATR of each other → levels, ranked by how often price reacted there.
  const sorted = [...swings].sort((a, b) => a.price - b.price);
  const clusters: { prices: number[] }[] = [];
  for (const s of sorted) {
    const c = clusters[clusters.length - 1];
    if (c && s.price - c.prices[c.prices.length - 1]! <= atr * CLUSTER_ATR) c.prices.push(s.price);
    else clusters.push({ prices: [s.price] });
  }
  const levels = clusters
    .map((c): KeyLevel => {
      const price = c.prices.reduce((a, b) => a + b, 0) / c.prices.length;
      const dist = last.close - price;
      return { price: roundTo(price, 1), touches: c.prices.length, kind: dist >= 0 ? "support" : "resistance", distancePoints: roundTo(Math.abs(dist), 1), distanceAtr: roundTo(Math.abs(dist) / atr, 2) };
    })
    .sort((a, b) => a.distancePoints - b.distancePoints)
    .slice(0, 6);

  const body = last.close - last.open;
  const range = last.high - last.low || 1;
  const lastCandle = {
    direction: Math.abs(body) < range * 0.1 ? ("doji" as const) : body > 0 ? ("bullish" as const) : ("bearish" as const),
    bodyAtr: roundTo(Math.abs(body) / atr, 2),
    upperWickPct: Math.round(((last.high - Math.max(last.open, last.close)) / range) * 100),
    lowerWickPct: Math.round(((Math.min(last.open, last.close) - last.low) / range) * 100),
  };

  const ref = candles[Math.max(0, candles.length - 11)]!;
  const lastHigh = [...swings].reverse().find((s) => s.type === "high");
  const lastLow = [...swings].reverse().find((s) => s.type === "low");
  const structure = classifyStructure(swings);
  return {
    candles: candles.length,
    structure,
    lastHighLabel: [...swings].reverse().find((x) => x.type === "high" && x.label)?.label ?? null,
    lastLowLabel: [...swings].reverse().find((x) => x.type === "low" && x.label)?.label ?? null,
    swings: swings.slice(-8).map((s) => ({ index: s.index, type: s.type, price: s.price, label: s.label ?? null })),
    atr: roundTo(atr, 1),
    lastClose: last.close,
    rangeHigh,
    rangeLow,
    rangePosition: Math.round(((last.close - rangeLow) / span) * 100),
    momentumAtr: roundTo((last.close - ref.close) / atr, 2),
    lastCandle,
    levels,
    // Where each directional idea would stop making sense: below the last higher low / above the last lower high.
    invalidation: { bullish: lastLow?.price ?? null, bearish: lastHigh?.price ?? null },
  };
}

function structureText(f: ChartFacts): string {
  if (f.structure === "BULLISH") return "Os últimos swings formam máximos e mínimos mais altos (HH/HL): contexto de tendência de alta. Isto descreve o que já aconteceu — não garante continuação.";
  if (f.structure === "BEARISH") return "Os últimos swings formam máximos e mínimos mais baixos (LH/LL): contexto de tendência de baixa. Isto descreve o que já aconteceu — não garante continuação.";
  const h = f.lastHighLabel;
  const l = f.lastLowLabel;
  if (h === "LH" && l === "HL") return "Sinais mistos: o último máximo é mais baixo (LH) mas o último mínimo é mais alto (HL) — o preço está a comprimir. Uma compressão tende a resolver-se num rompimento, mas a direção não é conhecida de antemão.";
  if (h === "HH" && l === "LL") return "Sinais mistos: o último máximo é mais alto (HH) mas o último mínimo é mais baixo (LL) — a amplitude está a expandir e o mercado está instável, com maior risco de whipsaws.";
  if (h === "LH" && l === "LL") return "Sinais mistos.";
  if (h === null || l === null) return "Ainda há poucos swings confirmados para classificar a estrutura com segurança.";
  return `Sinais mistos: último máximo ${h}, último mínimo ${l}. Não há uma tendência clara — contexto lateral ou de transição, onde os rompimentos falsos são comuns.`;
}

/**
 * Plain-language, probabilistic reading derived only from the facts. Used on its own when no AI model is configured
 * and as the grounding for the AI narrative.
 */
export function educationalReading(f: ChartFacts, ctx: { symbol: string; timeframe: string }): string[] {
  const out: string[] = [];
  out.push(structureText(f));

  const zone = f.rangePosition >= 75 ? "na parte alta" : f.rangePosition <= 25 ? "na parte baixa" : "na zona intermédia";
  out.push(`O último fecho (${f.lastClose.toLocaleString("en-US")}) está ${zone} do intervalo analisado (${f.rangeLow.toLocaleString("en-US")}–${f.rangeHigh.toLocaleString("en-US")}). O ATR recente é ≈ ${f.atr} pontos em ${ctx.symbol} ${ctx.timeframe}.`);

  const near = f.levels.filter((l) => l.touches >= 2).slice(0, 2);
  if (near.length > 0) {
    out.push(
      near.map((l) => `${l.kind === "support" ? "Suporte" : "Resistência"} provável em ≈ ${l.price.toLocaleString("en-US")} (${l.touches} reações, a ${l.distancePoints} pts / ${l.distanceAtr} ATR)`).join("; ") +
        ". Níveis são zonas, não linhas exatas.",
    );
  } else {
    out.push("Não há níveis com pelo menos duas reações claras neste intervalo — os pontos marcados são swings isolados e menos fiáveis.");
  }

  const mom = Math.abs(f.momentumAtr) < 0.8 ? "pouco movimento direcional" : f.momentumAtr > 0 ? "impulso ascendente" : "impulso descendente";
  const c = f.lastCandle;
  const wick = c.upperWickPct >= 50 ? " com sombra superior longa (rejeição de preços altos)" : c.lowerWickPct >= 50 ? " com sombra inferior longa (rejeição de preços baixos)" : "";
  out.push(`Nas últimas 10 barras: ${mom} (${f.momentumAtr > 0 ? "+" : ""}${f.momentumAtr} ATR). Último candle ${c.direction === "doji" ? "de indecisão" : c.direction === "bullish" ? "de alta" : "de baixa"} (corpo ≈ ${c.bodyAtr} ATR)${wick}.`);

  if (f.structure === "BULLISH" && f.invalidation.bullish !== null) {
    out.push(`Cenário a favor da estrutura (estudo): tende a ser mais coerente esperar um recuo a uma zona de valor e confirmação antes de considerar uma ideia de alta; essa ideia perderia sentido com um fecho abaixo de ≈ ${f.invalidation.bullish.toLocaleString("en-US")} (último mínimo).`);
  } else if (f.structure === "BEARISH" && f.invalidation.bearish !== null) {
    out.push(`Cenário a favor da estrutura (estudo): tende a ser mais coerente esperar um repique a uma zona de valor e confirmação antes de considerar uma ideia de baixa; essa ideia perderia sentido com um fecho acima de ≈ ${f.invalidation.bearish.toLocaleString("en-US")} (último máximo).`);
  } else {
    out.push("Num contexto sem tendência clara, o estudo mais útil costuma ser marcar os extremos do intervalo e observar como o preço reage neles, em vez de forçar uma direção.");
  }
  out.push("Nada disto é um sinal: são observações sobre o passado recente que ajudam a estruturar o raciocínio. O futuro é incerto e qualquer cenário pode falhar.");
  return out;
}

/** Re-exported so callers do not need a second import for tests/diagnostics. */
export { atrSeries };
