import { adminRoute, parseJson } from "@/lib/http";
import { adminIdParams, eventSchema } from "@/features/admin/schemas";
import { deleteEvent, updateEvent } from "@/features/admin/server/events-service";

export const PUT = adminRoute<{ id: string }>(async ({ req, params }) => ({ event: await updateEvent(adminIdParams.parse(params).id, await parseJson(req, eventSchema)) }));
export const DELETE = adminRoute<{ id: string }>(async ({ params }) => {
  await deleteEvent(adminIdParams.parse(params).id);
  return { ok: true };
});
