import type { ModuleDef } from "../types";
import { tradingFoundations } from "./01-trading-foundations";
import { futuresFundamentals } from "./02-futures-fundamentals";
import { readingCandles } from "./03-reading-candles";
import { trend } from "./04-trend";
import { supportResistance } from "./05-support-resistance";
import { supplyDemand } from "./06-supply-demand";

/** All curriculum modules, in navigation order (01 → 26). */
export const MODULES: readonly ModuleDef[] = [tradingFoundations, futuresFundamentals, readingCandles, trend, supportResistance, supplyDemand].sort((a, b) => a.number - b.number);
