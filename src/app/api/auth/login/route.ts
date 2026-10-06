import { parseJson, publicRoute } from "@/lib/http";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { setSessionCookie } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/google";
import { loginSchema } from "@/features/auth/schemas";
import { authenticate } from "@/features/auth/server/auth-service";

export const POST = publicRoute(async ({ req, ip }) => {
  const input = await parseJson(req, loginSchema);
  // Two independent buckets: per IP (when trustworthy) and per target account (credential stuffing).
  if (ip) enforceRateLimit(RATE_LIMITS.login, ip);
  enforceRateLimit(RATE_LIMITS.loginPerEmail, input.email);
  const user = await authenticate(input.email, input.password);
  await setSessionCookie(user.id, user.sessionVersion);
  return { ok: true, redirectTo: safeNextPath(input.next) };
});
