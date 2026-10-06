import { parseJson, publicRoute } from "@/lib/http";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { resetPasswordSchema } from "@/features/auth/schemas";
import { resetPassword } from "@/features/auth/server/auth-service";

export const POST = publicRoute(async ({ req, ip }) => {
  if (ip) enforceRateLimit(RATE_LIMITS.reset, ip);
  const { token, password } = await parseJson(req, resetPasswordSchema);
  await resetPassword(token, password);
  return { ok: true, redirectTo: "/login?reset=1" };
});
