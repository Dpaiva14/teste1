import { userRoute } from "@/lib/http";
import { dataSource, listInstruments } from "@/lib/market-data/service";

export const GET = userRoute(async () => ({ source: dataSource(), instruments: await listInstruments() }));
