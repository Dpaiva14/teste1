import { userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { finishReplay } from "@/features/replay/server/replay-service";

export const POST = userRoute<{ id: string }>(async ({ params, user }) => ({ replay: await finishReplay(user, idParams.parse(params).id) }));
