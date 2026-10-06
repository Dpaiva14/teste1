import { adminRoute, parseJson } from "@/lib/http";
import { adminIdParams, glossarySchema } from "@/features/admin/schemas";
import { deleteTerm, updateTerm } from "@/features/admin/server/glossary-service";

export const PUT = adminRoute<{ id: string }>(async ({ req, params }) => ({ term: await updateTerm(adminIdParams.parse(params).id, await parseJson(req, glossarySchema)) }));
export const DELETE = adminRoute<{ id: string }>(async ({ params }) => {
  await deleteTerm(adminIdParams.parse(params).id);
  return { ok: true };
});
