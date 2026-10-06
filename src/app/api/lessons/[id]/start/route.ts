import { userRoute } from "@/lib/http";
import { idParamSchema } from "@/features/academy/schemas";
import { startLesson } from "@/features/academy/server/lesson-service";

export const POST = userRoute<{ id: string }>(async ({ params, user }) => {
  const { id } = idParamSchema.parse(params);
  await startLesson(user, id);
  return { ok: true };
});
