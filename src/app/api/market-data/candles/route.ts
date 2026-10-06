import { parseQuery, userRoute } from "@/lib/http";
import { candlesQuerySchema } from "@/features/chart/schemas";
import { dataSource, getCandles } from "@/lib/market-data/service";

export const GET = userRoute(async ({ req }) => {
  const q = parseQuery(req, candlesQuerySchema);
  const candles = await getCandles({ symbol: q.symbol, timeframe: q.timeframe, from: q.from, to: q.to, seed: q.seed, limit: 3000 });
  return { source: dataSource(), symbol: q.symbol, timeframe: q.timeframe, candles };
});
