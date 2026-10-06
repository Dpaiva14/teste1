import { parseJson, userRoute } from "@/lib/http";
import { setSessionCookie } from "@/lib/auth/session";
import { changePasswordSchema } from "@/features/auth/schemas";
import { changePassword } from "@/features/auth/server/auth-service";

export const POST = userRoute(async ({ req, user }) => {
  const { currentPassword, newPassword } = await parseJson(req, changePasswordSchema);
  const updated = await changePassword(user.id, currentPassword, newPassword);
  // Re-issue this browser's session under the new sessionVersion; every other session is now invalid.
  await setSessionCookie(updated.id, updated.sessionVersion);
  return { ok: true };
});
