import { z } from "zod";
import { created, parseJson, userRoute } from "@/lib/http";
import { createAccount, listAccounts } from "@/features/simulator/server/simulator-service";

const createSchema = z.object({
  name: z.string().trim().min(1).max(40).default("Conta demo"),
  initialBalance: z.number().finite().min(1000).max(1_000_000).default(10000),
  timeframe: z.enum(["M1", "M5", "M15", "H1", "H4"]).default("M5"),
});

export const GET = userRoute(async ({ user }) => ({ accounts: await listAccounts(user) }));
export const POST = userRoute(async ({ req, user }) => created(await createAccount(user, await parseJson(req, createSchema))));
