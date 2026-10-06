import { adminRoute, parseJson } from "@/lib/http";
import { adminIdParams, userUpdateSchema } from "@/features/admin/schemas";
import { updateUser } from "@/features/admin/server/users-service";

export const PATCH = adminRoute<{ id: string }>(async ({ req, params, user }) => {
  await updateUser(user, adminIdParams.parse(params).id, await parseJson(req, userUpdateSchema));
  return { ok: true };
});
