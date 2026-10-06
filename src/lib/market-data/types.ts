/** Market-data domain types. Client-safe (no server imports). */

export const TIMEFRAMES = ["M1", "M5", "M15", "H1", "H4", "D1"] as const;
export type Timeframe = (typeof TIMEFRAMES)[number];

export const TIMEFRAME_MINUTES: Record<Timeframe, number> = {
  M1: 1,
  M5: 5,
  M15: 15,
  H1: 60,
  H4: 240,
  D1: 1440,
};

export const TIMEFRAME_LABEL: Record<Timeframe, string> = {
  M1: "1 min",
  M5: "5 min",
  M15: "15 min",
  H1: "1 hora",
  H4: "4 horas",
  D1: "Diário",
};

export function isTimeframe(v: string): v is Timeframe {
  return (TIMEFRAMES as readonly string[]).includes(v);
}

/** One OHLCV bar. `time` is the bar's open time in epoch SECONDS (UTC). */
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type InstrumentKind = "FUTURE" | "CFD" | "INDEX";

export interface Instrument {
  symbol: string;
  name: string;
  kind: InstrumentKind;
  /** Smallest price increment, in index points. */
  tickSize: number;
  /** Decimals used when displaying prices. */
  priceDecimals: number;
  /** USD value of one full index point for ONE contract. null = broker dependent (CFD). */
  pointValue: number | null;
  /** Starting level used by the DEMO generator (synthetic — not a real quote). */
  demoBasePrice: number;
  description: string;
}

export interface CandleQuery {
  symbol: string;
  timeframe: Timeframe;
  from: Date;
  to: Date;
  /** DEMO provider only: variant seed so students can practise on different synthetic series. */
  seed?: number;
  /** Safety cap on number of bars returned. */
  limit?: number;
}

/**
 * Boundary between the application and any source of market data.
 * The app depends ONLY on this interface; real vendors are added by implementing it
 * (see docs/MARKET_DATA.md). API keys live in server env vars and never reach the browser.
 */
export interface MarketDataProvider {
  readonly name: string;
  /** true when data is synthetic: the UI then shows DEMO badges everywhere. */
  readonly isDemo: boolean;
  /** true when results may be cached in the MarketData table. */
  readonly cacheable: boolean;
  listInstruments(): Promise<Instrument[]>;
  getCandles(query: CandleQuery): Promise<Candle[]>;
}

export type DataSourceInfo = { provider: string; isDemo: boolean };
