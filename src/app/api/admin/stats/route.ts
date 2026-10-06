import { adminRoute } from "@/lib/http";
import { getAdminStats } from "@/features/admin/server/stats-service";

export const GET = adminRoute(async () => ({ stats: await getAdminStats() }));
