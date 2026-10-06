import { adminRoute, created, parseJson } from "@/lib/http";
import { adminIdParams, lessonCreateSchema } from "@/features/admin/schemas";
import { createLesson } from "@/features/admin/server/content-service";

export const POST = adminRoute<{ id: string }>(async ({ req, params }) => created({ lesson: await createLesson(adminIdParams.parse(params).id, await parseJson(req, lessonCreateSchema)) }));
