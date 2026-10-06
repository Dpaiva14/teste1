import { userRoute } from "@/lib/http";
import { getCurriculum } from "@/features/academy/server/curriculum-service";

export const GET = userRoute(async ({ user }) => getCurriculum(user));
