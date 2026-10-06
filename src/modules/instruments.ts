import type { Instrument } from "@/lib/market-data/types";

/**
 * Instrument definitions used by calculators, simulator and the DEMO provider.
 *
 * CONTRACT SPECIFICATIONS — sourced from CME Group (see modules/sources.ts, ids "cme-ym-specs" and
 * "cme-mym-specs"). Values that change over time (margins, trading hours) are intentionally NOT hard-coded
 * here as facts; the simulator uses the clearly-labelled illustrative figures in DEMO_MARGIN below.
 */
export const INSTRUMENTS: readonly Instrument[] = [
  {
    symbol: "YM",
    name: "E-mini Dow Futures",
    kind: "FUTURE",
    tickSize: 1,
    priceDecimals: 0,
    pointValue: 5, // $5 × DJIA index; 1 tick = 1 index point = $5.00 (CME Group)
    demoBasePrice: 39000,
    description: "Contrato de futuros E-mini sobre o Dow Jones Industrial Average. 1 tick = 1 ponto = $5,00.",
  },
  {
    symbol: "MYM",
    name: "Micro E-mini Dow Futures",
    kind: "FUTURE",
    tickSize: 1,
    priceDecimals: 0,
    pointValue: 0.5, // $0.50 × DJIA index; 1 tick = 1 index point = $0.50 (CME Group)
    demoBasePrice: 39000,
    description: "Contrato Micro E-mini sobre o Dow Jones Industrial Average. 1 tick = 1 ponto = $0,50 (1/10 do YM).",
  },
  {
    symbol: "US30",
    name: "US30 (CFD — DEMO)",
    kind: "CFD",
    tickSize: 0.1,
    priceDecimals: 1,
    pointValue: null, // broker dependent
    demoBasePrice: 39000,
    description:
      "CFD sobre o Dow Jones. Tamanho do contrato, valor por ponto, spread e margem dependem do broker. Na plataforma demo assume-se $1 por ponto por lote (apenas ilustrativo).",
  },
] as const;

/** For the simulator only: US30 CFD value per point per 1.0 lot. ILLUSTRATIVE — real brokers differ. */
export const DEMO_US30_POINT_VALUE = 1;

/**
 * ILLUSTRATIVE initial margin per contract, USD, used by the DEMO simulator. These are NOT CME margins
 * (exchange margins change frequently — check the CME Group margin page and your broker, which may require more).
 */
export const DEMO_MARGIN: Record<string, number> = {
  YM: 9000,
  MYM: 900,
  US30: 400,
};

export function getInstrument(symbol: string): Instrument | undefined {
  return INSTRUMENTS.find((i) => i.symbol === symbol);
}

export function requireInstrument(symbol: string): Instrument {
  const i = getInstrument(symbol);
  if (!i) throw new Error(`Unknown instrument: ${symbol}`);
  return i;
}

/** USD per index point for ONE contract/lot, using the demo CFD value for US30. */
export function pointValueUsd(symbol: string): number {
  const i = requireInstrument(symbol);
  return i.pointValue ?? DEMO_US30_POINT_VALUE;
}

export const SYMBOLS = INSTRUMENTS.map((i) => i.symbol);
