import { z } from "zod";
import { parseJson, userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { advance } from "@/features/simulator/server/simulator-service";

export const POST = userRoute<{ id: string }>(async ({ req, params, user }) => {
  const { id } = idParams.parse(params);
  const { bars } = await parseJson(req, z.object({ bars: z.number().int().min(1).max(20).default(1) }));
  return { account: await advance(user, id, bars) };
});
