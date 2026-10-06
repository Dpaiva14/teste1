import { parseJson, userRoute } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { labParamsSchema } from "@/features/labs/schemas";
import { checkLab } from "@/features/labs/server/lab-service";
import { z } from "@/lib/zod";

export const POST = userRoute<{ kind: string; id: string }>(async ({ req, params, user }) => {
  const { kind, id } = labParamsSchema.parse(params);
  enforceRateLimit({ name: "lab-check", limit: 120, windowMs: 10 * 60_000 }, user.id);
  const body = await parseJson(req, z.unknown());
  return checkLab(user, kind, id!, body);
});
