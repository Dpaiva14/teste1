import { userRoute } from "@/lib/http";
import { labParamsSchema } from "@/features/labs/schemas";
import { listLabScenarios } from "@/features/labs/server/lab-service";

export const GET = userRoute<{ kind: string }>(async ({ params, user }) => {
  const { kind } = labParamsSchema.parse(params);
  return { scenarios: await listLabScenarios(user, kind) };
});
