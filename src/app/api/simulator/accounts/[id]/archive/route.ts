import { userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { archiveAccount } from "@/features/simulator/server/simulator-service";

export const POST = userRoute<{ id: string }>(async ({ params, user }) => {
  const { id } = idParams.parse(params);
  await archiveAccount(user, id);
  return { ok: true };
});
