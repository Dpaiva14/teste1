import { userRoute } from "@/lib/http";
import { labParamsSchema } from "@/features/labs/schemas";
import { getLabScenario } from "@/features/labs/server/lab-service";
import { dataSource } from "@/lib/market-data/service";

export const GET = userRoute<{ kind: string; id: string }>(async ({ params }) => {
  const { kind, id } = labParamsSchema.parse(params);
  return { source: dataSource(), scenario: getLabScenario(kind, id!) };
});
