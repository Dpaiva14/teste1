import { z } from "zod";
import { parseJson, userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { drawingsSchema } from "@/features/replay/schemas";
import { saveDrawings } from "@/features/replay/server/replay-service";

export const PUT = userRoute<{ id: string }>(async ({ req, params, user }) => {
  const { drawings } = await parseJson(req, z.object({ drawings: drawingsSchema }));
  return saveDrawings(user, idParams.parse(params).id, drawings);
});
