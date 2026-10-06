import { userRoute } from "@/lib/http";
import { idParams } from "@/features/trading/schemas";
import { getAccountState } from "@/features/simulator/server/simulator-service";
import { dataSource } from "@/lib/market-data/service";

export const GET = userRoute<{ id: string }>(async ({ params, user }) => {
  const { id } = idParams.parse(params);
  return { source: dataSource(), account: await getAccountState(user, id) };
});
