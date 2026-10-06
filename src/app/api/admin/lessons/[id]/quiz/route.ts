import { adminRoute, parseJson } from "@/lib/http";
import { adminIdParams, quizSchema } from "@/features/admin/schemas";
import { removeQuiz, saveQuiz } from "@/features/admin/server/content-service";

export const PUT = adminRoute<{ id: string }>(async ({ req, params }) => {
  await saveQuiz({ lessonId: adminIdParams.parse(params).id }, await parseJson(req, quizSchema));
  return { ok: true };
});
export const DELETE = adminRoute<{ id: string }>(async ({ params }) => {
  await removeQuiz({ lessonId: adminIdParams.parse(params).id });
  return { ok: true };
});
