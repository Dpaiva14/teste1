import { created, parseJson, userRoute } from "@/lib/http";
import { openTradeSchema, idParams } from "@/features/trading/schemas";
import { placeTrade } from "@/features/simulator/server/simulator-service";

export const POST = userRoute<{ id: string }>(async ({ req, params, user }) => {
  const { id } = idParams.parse(params);
  return created({ account: await placeTrade(user, id, await parseJson(req, openTradeSchema)) });
});
