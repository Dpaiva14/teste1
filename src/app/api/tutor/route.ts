import { created, parseJson, userRoute } from "@/lib/http";
import { askTutorSchema } from "@/features/ai/schemas";
import { aiConfigured } from "@/features/ai/server/ai-client";
import { askTutor, listConversations } from "@/features/ai/server/tutor-service";

export const GET = userRoute(async ({ user }) => ({ configured: aiConfigured(), conversations: await listConversations(user) }));
export const POST = userRoute(async ({ req, user }) => created(await askTutor(user, await parseJson(req, askTutorSchema))));
