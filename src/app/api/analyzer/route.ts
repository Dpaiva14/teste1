import { parseJson, userRoute } from "@/lib/http";
import { analyzeSchema } from "@/features/ai/schemas";
import { analyzeImage, analyzeScenario } from "@/features/ai/server/analyzer-service";

export const POST = userRoute(async ({ req, user }) => {
  const input = await parseJson(req, analyzeSchema);
  return input.mode === "scenario" ? { analysis: await analyzeScenario(user, input.scenarioId, input.narrate) } : { image: await analyzeImage(user, input) };
});
