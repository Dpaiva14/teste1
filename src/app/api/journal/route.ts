import { created, parseJson, parseQuery, userRoute } from "@/lib/http";
import { journalInputSchema, journalListSchema } from "@/features/journal/schemas";
import { createEntry, listEntries } from "@/features/journal/server/journal-service";

export const GET = userRoute(async ({ req, user }) => listEntries(user, parseQuery(req, journalListSchema)));
export const POST = userRoute(async ({ req, user }) => created(await createEntry(user, await parseJson(req, journalInputSchema))));
