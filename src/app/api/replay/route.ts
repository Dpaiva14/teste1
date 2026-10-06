import { created, parseJson, userRoute } from "@/lib/http";
import { createReplaySchema } from "@/features/replay/schemas";
import { createReplay, listReplays } from "@/features/replay/server/replay-service";

export const GET = userRoute(async ({ user }) => ({ sessions: await listReplays(user) }));
export const POST = userRoute(async ({ req, user }) => created(await createReplay(user, await parseJson(req, createReplaySchema))));
