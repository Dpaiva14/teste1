import { parseJson, noContent, userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { journalInputSchema } from "@/features/journal/schemas";
import { deleteEntry, getEntry, updateEntry } from "@/features/journal/server/journal-service";

export const GET = userRoute<{ id: string }>(async ({ params, user }) => ({ entry: await getEntry(user, idParams.parse(params).id) }));
export const PUT = userRoute<{ id: string }>(async ({ req, params, user }) => updateEntry(user, idParams.parse(params).id, await parseJson(req, journalInputSchema)));
export const DELETE = userRoute<{ id: string }>(async ({ params, user }) => {
  await deleteEntry(user, idParams.parse(params).id);
  return noContent();
});
