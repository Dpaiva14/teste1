import type { ModuleDef } from "../types";
import { tradingFoundations } from "./01-trading-foundations";

/** All curriculum modules, in navigation order (01 → 26). */
export const MODULES: readonly ModuleDef[] = [tradingFoundations].sort((a, b) => a.number - b.number);
