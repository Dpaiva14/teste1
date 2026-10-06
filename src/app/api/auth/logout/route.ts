import { publicRoute } from "@/lib/http";
import { clearSessionCookie } from "@/lib/auth/session";

export const POST = publicRoute(async () => {
  await clearSessionCookie();
  return { ok: true, redirectTo: "/login" };
});
