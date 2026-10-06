import { userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { deleteReplay, getReplayState } from "@/features/replay/server/replay-service";

export const GET = userRoute<{ id: string }>(async ({ params, user }) => ({ replay: await getReplayState(user, idParams.parse(params).id) }));
export const DELETE = userRoute<{ id: string }>(async ({ params, user }) => {
  await deleteReplay(user, idParams.parse(params).id);
  return { ok: true };
});
