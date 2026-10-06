import { parseJson, userRoute } from "@/lib/http";
import { idParamSchema, lessonTimeSchema } from "@/features/academy/schemas";
import { addLessonTime } from "@/features/academy/server/lesson-service";

export const POST = userRoute<{ id: string }>(async ({ req, params, user }) => {
  const { id } = idParamSchema.parse(params);
  const { seconds } = await parseJson(req, lessonTimeSchema);
  await addLessonTime(user, id, seconds);
  return { ok: true };
});
