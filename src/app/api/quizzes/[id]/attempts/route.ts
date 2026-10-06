import { parseJson, userRoute } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { idParamSchema, quizSubmitSchema } from "@/features/academy/schemas";
import { submitQuiz } from "@/features/academy/server/quiz-service";

export const POST = userRoute<{ id: string }>(async ({ req, params, user }) => {
  const { id } = idParamSchema.parse(params);
  enforceRateLimit({ name: "quiz-submit", limit: 60, windowMs: 10 * 60_000 }, user.id);
  const { responses } = await parseJson(req, quizSubmitSchema);
  return submitQuiz(user, id, { responses });
});
