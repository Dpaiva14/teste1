import { userRoute } from "@/lib/http";
import { tradeParams } from "@/features/trading/schemas";
import { closeReplayTrade } from "@/features/replay/server/replay-service";

export const POST = userRoute<{ id: string; tradeId: string }>(async ({ params, user }) => {
  const { id, tradeId } = tradeParams.parse(params);
  return { replay: await closeReplayTrade(user, id, tradeId) };
});
