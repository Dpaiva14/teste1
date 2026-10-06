import { userRoute } from "@/lib/http";
import { getStats } from "@/features/journal/server/journal-service";

export const GET = userRoute(async ({ user }) => getStats(user));
