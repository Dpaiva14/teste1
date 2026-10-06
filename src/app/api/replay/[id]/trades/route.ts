import { created, parseJson, userRoute } from "@/lib/http";
import { idParams, openTradeSchema } from "@/features/trading/schemas";
import { placeReplayTrade } from "@/features/replay/server/replay-service";

export const POST = userRoute<{ id: string }>(async ({ req, params, user }) => created({ replay: await placeReplayTrade(user, idParams.parse(params).id, await parseJson(req, openTradeSchema)) }));
