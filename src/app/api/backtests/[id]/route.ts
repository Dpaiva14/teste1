import { userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { deleteBacktest, getBacktestState } from "@/features/backtest/server/backtest-service";

export const GET = userRoute<{ id: string }>(async ({ params, user }) => ({ backtest: await getBacktestState(user, idParams.parse(params).id) }));
export const DELETE = userRoute<{ id: string }>(async ({ params, user }) => {
  await deleteBacktest(user, idParams.parse(params).id);
  return { ok: true };
});
