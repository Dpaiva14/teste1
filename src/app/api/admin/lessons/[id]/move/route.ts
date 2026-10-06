import { adminRoute, parseJson } from "@/lib/http";
import { adminIdParams, moveSchema } from "@/features/admin/schemas";
import { moveLesson } from "@/features/admin/server/content-service";

export const POST = adminRoute<{ id: string }>(async ({ req, params }) => {
  await moveLesson(adminIdParams.parse(params).id, (await parseJson(req, moveSchema)).direction);
  return { ok: true };
});
