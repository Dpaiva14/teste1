import type { ModuleDef } from "../types";
import { tradingFoundations } from "./01-trading-foundations";
import { futuresFundamentals } from "./02-futures-fundamentals";
import { readingCandles } from "./03-reading-candles";
import { trend } from "./04-trend";
import { supportResistance } from "./05-support-resistance";
import { supplyDemand } from "./06-supply-demand";
import { marketStructure } from "./07-market-structure";
import { fibonacci } from "./08-fibonacci";
import { priceAction } from "./09-price-action";
import { liquidity } from "./10-liquidity";
import { confluence } from "./11-confluence";
import { marketSessions } from "./12-market-sessions";
import { us30Dow } from "./13-us30-dow";
import { economicFundamentals } from "./14-economic-fundamentals";
import { confluenceTradingFramework } from "./15-confluence-trading-framework";
import { tradeSetups } from "./16-trade-setups";

/** All curriculum modules, in navigation order (01 → 26). */
export const MODULES: readonly ModuleDef[] = [tradingFoundations, futuresFundamentals, readingCandles, trend, supportResistance, supplyDemand, marketStructure, fibonacci, priceAction, liquidity, confluence, marketSessions, us30Dow, economicFundamentals, confluenceTradingFramework, tradeSetups].sort((a, b) => a.number - b.number);
