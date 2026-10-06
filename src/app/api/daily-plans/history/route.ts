import { planHistory } from "@/features/daily-plan/server/daily-plan-service";
import { userRoute } from "@/lib/http";

export const GET = userRoute(async ({ user }) => planHistory(user));
