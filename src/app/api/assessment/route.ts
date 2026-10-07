import { created, userRoute } from "@/lib/http";
import { getOverview, startAssessment } from "@/features/assessment/server/assessment-service";

export const GET = userRoute(async ({ user }) => ({ overview: await getOverview(user) }));
export const POST = userRoute(async ({ user }) => created(await startAssessment(user)));
