import { adminRoute, created, parseJson } from "@/lib/http";
import { glossarySchema } from "@/features/admin/schemas";
import { createTerm, listGlossary } from "@/features/admin/server/glossary-service";

export const GET = adminRoute(async () => ({ terms: await listGlossary() }));
export const POST = adminRoute(async ({ req }) => created({ term: await createTerm(await parseJson(req, glossarySchema)) }));
