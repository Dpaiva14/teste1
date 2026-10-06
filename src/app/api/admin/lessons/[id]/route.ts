import { adminRoute, parseJson } from "@/lib/http";
import { adminIdParams, lessonUpdateSchema } from "@/features/admin/schemas";
import { deleteLesson, getLesson, updateLesson } from "@/features/admin/server/content-service";

export const GET = adminRoute<{ id: string }>(async ({ params }) => ({ lesson: await getLesson(adminIdParams.parse(params).id) }));
export const PATCH = adminRoute<{ id: string }>(async ({ req, params }) => {
  await updateLesson(adminIdParams.parse(params).id, await parseJson(req, lessonUpdateSchema));
  return { ok: true };
});
export const DELETE = adminRoute<{ id: string }>(async ({ params, user }) => {
  await deleteLesson(user, adminIdParams.parse(params).id);
  return { ok: true };
});
