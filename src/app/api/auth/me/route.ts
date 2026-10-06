import { userRoute } from "@/lib/http";

export const GET = userRoute(({ user }) => ({ user }));
