import { z } from "zod";
import { listEvents } from "@/features/economic-calendar/server/calendar-service";
import { parseQuery, userRoute } from "@/lib/http";

const schema = z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() });

export const GET = userRoute(async ({ req }) => {
  const q = parseQuery(req, schema);
  return { events: await listEvents(q.from, q.to) };
});
