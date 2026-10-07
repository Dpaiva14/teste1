# Market data

The application never talks to a data vendor directly. Everything that needs candles (charts, labs, replay, simulator,
backtesting, assessment, AI chart reading) goes through one boundary:

```ts
// src/lib/market-data/types.ts
interface MarketDataProvider {
  readonly name: string;
  readonly isDemo: boolean;     // true → every chart shows the DEMO badge
  readonly cacheable: boolean;  // true → results may be cached in the MarketData table
  listInstruments(): Promise<Instrument[]>;
  getCandles(query: CandleQuery): Promise<Candle[]>;
}
```

`getCandles` in `src/lib/market-data/service.ts` is the only function the rest of the app calls.

## What ships: the DEMO provider

`MARKET_DATA_PROVIDER=demo` (the default) generates **synthetic, deterministic candles** from a seeded PRNG
(`src/lib/market-data/demo-generator.ts`). They are shaped like index futures (trends, ranges, swings, session-dependent
volatility) so that structure, levels, Fibonacci, liquidity and replay can be practised — but they are **not** prices of the
Dow Jones or of any contract.

Rules the code enforces:

- `DemoProvider.isDemo === true`, so the DEMO badge is shown wherever a chart appears;
- series dates are positions on a synthetic calendar, not real market dates;
- nothing in the repository presents synthetic data as real data, and no real quote is hard-coded anywhere;
- the same `(symbol, timeframe, seed, start)` always yields the same series, which makes replay, backtests and the
  final assessment reproducible and testable.

## Instrument facts and where they come from

`src/modules/instruments.ts` holds the contract definitions used by the calculators and the simulator.

| Symbol | Meaning | Value per point | Source |
| --- | --- | --- | --- |
| `YM` | CME E-mini Dow futures | $5.00 (tick = 1 point = $5.00) | CME Group contract specifications |
| `MYM` | CME Micro E-mini Dow futures | $0.50 (tick = 1 point = $0.50) | CME Group contract specifications |
| `US30` | Dow Jones **CFD** | broker dependent; the simulator assumes $1/point/lot, **illustrative only** | — |

Verification status is recorded honestly in `src/modules/sources.ts` (shown on the *Learning Sources* page): the YM/MYM
figures and the quarterly March/June/September/December cycle were confirmed on **2026-10-06 from official CME Group
excerpts**; the CME pages themselves could not be opened from the build environment. Re-check them on the CME website before
relying on them.

Values that change over time or between brokers are **not** presented as facts: margins, trading hours, fees, spreads and
CFD specifications are illustrative (`DEMO_MARGIN` in `instruments.ts`, `DEMO_COSTS` in
`src/features/trading/logic/engine.ts`) and are labelled as such in the UI.

## Plugging in a real provider

1. Create `src/lib/market-data/providers/<vendor>.ts` implementing `MarketDataProvider`.
   - Read the key with `getEnv().MARKET_DATA_API_KEY` (server only — `env.ts` imports `server-only`).
   - Return candles with `time` in **epoch seconds (UTC)**, ascending, no gaps filled artificially.
   - Set `isDemo = false` and `cacheable = true` if the vendor's terms allow storing the data.
2. Register it in `src/lib/market-data/registry.ts`:
   ```ts
   const factories = { demo: () => new DemoProvider(), myvendor: () => new MyVendorProvider() };
   ```
3. Set `MARKET_DATA_PROVIDER=myvendor` and `MARKET_DATA_API_KEY=…` in the server environment.

With `cacheable = true`, `getCandles` writes through to the `MarketData` table and serves later requests from it.

### Things a real provider changes

- **Replay, backtesting and the assessment** currently build their series with `loadSeries()` (`src/features/trading/server/feed.ts`)
  from a *seed*. With a real provider you would replace the seed by a historical window chosen server-side, keep the "only
  candles up to the cursor are ever sent to the browser" rule, and keep the unseen part server-side until the decision.
- **DEMO badges** disappear automatically when `isDemo` is false; review every screen that says "dados sintéticos".
- **Licensing**: market data is usually licensed per use. Check redistribution and display terms before enabling it.
- **Adjusting for contract rolls** (YM/MYM expire quarterly) is the provider's job; the app does not stitch contracts.

## Why the browser never sees the vendor

Keys, vendor URLs and rate limits live on the server. The browser calls the app's own endpoints
(`/api/market-data/…`) which apply authentication, validation and rate limiting before calling `getCandles`.
