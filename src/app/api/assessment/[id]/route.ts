import { noContent, parseJson, userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { saveDraftSchema } from "@/features/assessment/schemas";
import { abandonAssessment, getAssessmentState, saveDraft } from "@/features/assessment/server/assessment-service";

export const GET = userRoute<{ id: string }>(async ({ params, user }) => ({ assessment: await getAssessmentState(user, idParams.parse(params).id) }));

export const PUT = userRoute<{ id: string }>(async ({ req, params, user }) => {
  const { answers } = await parseJson(req, saveDraftSchema);
  await saveDraft(user, idParams.parse(params).id, answers);
  return { ok: true };
});

export const DELETE = userRoute<{ id: string }>(async ({ params, user }) => {
  await abandonAssessment(user, idParams.parse(params).id);
  return noContent();
});
