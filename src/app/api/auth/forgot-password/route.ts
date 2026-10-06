import { parseJson, publicRoute } from "@/lib/http";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { forgotPasswordSchema } from "@/features/auth/schemas";
import { requestPasswordReset } from "@/features/auth/server/auth-service";

export const POST = publicRoute(async ({ req, ip }) => {
  const { email } = await parseJson(req, forgotPasswordSchema);
  if (ip) enforceRateLimit(RATE_LIMITS.forgot, ip);
  enforceRateLimit(RATE_LIMITS.forgotPerEmail, email);
  await requestPasswordReset(email);
  // Identical response whether or not the account exists (no user enumeration).
  return { ok: true, message: "Se existir uma conta com este e-mail, enviámos instruções para repor a password." };
});
