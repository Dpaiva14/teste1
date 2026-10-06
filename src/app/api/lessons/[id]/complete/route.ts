import { userRoute } from "@/lib/http";
import { idParamSchema } from "@/features/academy/schemas";
import { completeLessonManually } from "@/features/academy/server/lesson-service";

export const POST = userRoute<{ id: string }>(async ({ params, user }) => {
  const { id } = idParamSchema.parse(params);
  return completeLessonManually(user, id);
});
