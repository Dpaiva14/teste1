import { userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { finishBacktest } from "@/features/backtest/server/backtest-service";

export const POST = userRoute<{ id: string }>(async ({ params, user }) => ({ backtest: await finishBacktest(user, idParams.parse(params).id) }));
