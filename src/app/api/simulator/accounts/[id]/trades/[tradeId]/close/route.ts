import { userRoute } from "@/lib/http";
import { tradeParams } from "@/features/trading/schemas";
import { closeTrade } from "@/features/simulator/server/simulator-service";

export const POST = userRoute<{ id: string; tradeId: string }>(async ({ params, user }) => {
  const { id, tradeId } = tradeParams.parse(params);
  return { account: await closeTrade(user, id, tradeId) };
});
