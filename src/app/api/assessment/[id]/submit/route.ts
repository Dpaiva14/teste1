import { userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { submitAssessment } from "@/features/assessment/server/assessment-service";

export const POST = userRoute<{ id: string }>(async ({ params, user }) => ({ assessment: await submitAssessment(user, idParams.parse(params).id) }));
