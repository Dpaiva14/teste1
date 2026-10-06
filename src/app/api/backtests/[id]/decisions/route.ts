import { parseJson, userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { decisionSchema } from "@/features/backtest/schemas";
import { decide } from "@/features/backtest/server/backtest-service";

export const POST = userRoute<{ id: string }>(async ({ req, params, user }) => decide(user, idParams.parse(params).id, await parseJson(req, decisionSchema)));
