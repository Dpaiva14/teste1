import { adminRoute, parseJson } from "@/lib/http";
import { adminIdParams, moduleUpdateSchema } from "@/features/admin/schemas";
import { updateModule } from "@/features/admin/server/content-service";

export const PATCH = adminRoute<{ id: string }>(async ({ req, params }) => {
  await updateModule(adminIdParams.parse(params).id, await parseJson(req, moduleUpdateSchema));
  return { ok: true };
});
