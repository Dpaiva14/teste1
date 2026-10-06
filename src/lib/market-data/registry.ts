import "server-only";
import { getEnv } from "@/lib/env";
import { notConfigured } from "@/lib/errors";
import { DemoProvider } from "./providers/demo";
import type { MarketDataProvider } from "./types";

/**
 * Provider registry. To add a real vendor:
 *   1. implement `MarketDataProvider` in ./providers/<vendor>.ts (read its API key via getEnv() — server only);
 *   2. register it below under a name;
 *   3. set MARKET_DATA_PROVIDER=<name> (and MARKET_DATA_API_KEY).
 * See docs/MARKET_DATA.md.
 */
const factories: Record<string, () => MarketDataProvider> = {
  demo: () => new DemoProvider(),
};

let instance: MarketDataProvider | undefined;

export function getMarketDataProvider(): MarketDataProvider {
  if (instance) return instance;
  const name = getEnv().MARKET_DATA_PROVIDER.toLowerCase();
  const factory = factories[name];
  if (!factory) {
    throw notConfigured(`MARKET_DATA_PROVIDER="${name}" não está registado. Providers disponíveis: ${Object.keys(factories).join(", ")}.`);
  }
  instance = factory();
  return instance;
}

export function registerMarketDataProvider(name: string, factory: () => MarketDataProvider): void {
  factories[name.toLowerCase()] = factory;
  instance = undefined;
}
