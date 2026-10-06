import { created, parseJson, userRoute } from "@/lib/http";
import { createBacktestSchema } from "@/features/backtest/schemas";
import { createBacktest, listBacktests } from "@/features/backtest/server/backtest-service";

export const GET = userRoute(async ({ user }) => ({ backtests: await listBacktests(user) }));
export const POST = userRoute(async ({ req, user }) => created(await createBacktest(user, await parseJson(req, createBacktestSchema))));
