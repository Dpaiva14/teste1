import { adminRoute } from "@/lib/http";
import { adminIdParams } from "@/features/admin/schemas";
import { deleteAsset } from "@/features/media/server/storage";

export const DELETE = adminRoute<{ id: string }>(async ({ params, user }) => {
  await deleteAsset(user, adminIdParams.parse(params).id);
  return { ok: true };
});
