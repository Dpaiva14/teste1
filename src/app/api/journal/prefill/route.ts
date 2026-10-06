import { z } from "@/lib/zod";
import { parseQuery, userRoute } from "@/lib/http";
import { idSchema } from "@/lib/http-schemas";
import { prefillFromTrade } from "@/features/journal/server/journal-service";

export const GET = userRoute(async ({ req, user }) => {
  const { trade } = parseQuery(req, z.object({ trade: idSchema }));
  return { prefill: await prefillFromTrade(user, trade) };
});
