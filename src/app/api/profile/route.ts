import { prisma } from "@/database/client";
import { profileUpdateSchema } from "@/features/profile/schemas";
import { parseJson, userRoute } from "@/lib/http";

export const PATCH = userRoute(async ({ req, user }) => {
  const data = await parseJson(req, profileUpdateSchema);
  const updated = await prisma.user.update({ where: { id: user.id }, data, select: { name: true, timezone: true } });
  return { ok: true, profile: updated };
});
