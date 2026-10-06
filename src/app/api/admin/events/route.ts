import { adminRoute, created, parseJson } from "@/lib/http";
import { eventSchema } from "@/features/admin/schemas";
import { createEvent, listEvents } from "@/features/admin/server/events-service";

export const GET = adminRoute(async () => ({ events: await listEvents() }));
export const POST = adminRoute(async ({ req, user }) => created({ event: await createEvent(user, await parseJson(req, eventSchema)) }));
