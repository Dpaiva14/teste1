import { userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { deleteConversation, getMessages } from "@/features/ai/server/tutor-service";

export const GET = userRoute<{ id: string }>(async ({ params, user }) => ({ messages: await getMessages(user, idParams.parse(params).id) }));
export const DELETE = userRoute<{ id: string }>(async ({ params, user }) => {
  await deleteConversation(user, idParams.parse(params).id);
  return { ok: true };
});
