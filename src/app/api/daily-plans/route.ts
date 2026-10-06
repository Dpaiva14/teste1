import { z } from "zod";
import { dailyPlanSchema } from "@/features/daily-plan/schemas";
import { getPlan, savePlan } from "@/features/daily-plan/server/daily-plan-service";
import { parseJson, parseQuery, userRoute } from "@/lib/http";
import { isoDateSchema } from "@/lib/http-schemas";

export const GET = userRoute(async ({ req, user }) => ({ plan: await getPlan(user, parseQuery(req, z.object({ date: isoDateSchema })).date) }));
export const PUT = userRoute(async ({ req, user }) => savePlan(user, await parseJson(req, dailyPlanSchema)));
