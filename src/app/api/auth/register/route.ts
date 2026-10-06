import { created, parseJson, publicRoute } from "@/lib/http";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { setSessionCookie } from "@/lib/auth/session";
import { registerSchema } from "@/features/auth/schemas";
import { registerUser } from "@/features/auth/server/auth-service";

export const POST = publicRoute(async ({ req, ip }) => {
  if (ip) enforceRateLimit(RATE_LIMITS.register, ip);
  const input = await parseJson(req, registerSchema);
  const user = await registerUser(input);
  await setSessionCookie(user.id, user.sessionVersion);
  return created({ ok: true, redirectTo: "/dashboard" });
});
