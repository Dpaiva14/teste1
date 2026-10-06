import { z } from "@/lib/zod";
import { parseJson, userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { advanceReplay } from "@/features/replay/server/replay-service";

export const POST = userRoute<{ id: string }>(async ({ req, params, user }) => {
  const { bars } = await parseJson(req, z.object({ bars: z.number().int().min(1).max(20).default(1) }));
  return { replay: await advanceReplay(user, idParams.parse(params).id, bars) };
});
