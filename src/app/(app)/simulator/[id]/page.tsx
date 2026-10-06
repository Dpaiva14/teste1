import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { SimulatorWorkspace } from "@/features/simulator/components/simulator-workspace";
import { getAccountState } from "@/features/simulator/server/simulator-service";
import { requireUserPage } from "@/lib/auth/session";
import { orNotFound } from "@/lib/page-helpers";

export const metadata: Metadata = { title: "Simulador" };

export default async function SimulatorAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUserPage(`/simulator/${id}`);
  const account = await orNotFound(getAccountState(user, id));
  return (
    <div className="grid gap-6">
      <SimulatorWorkspace initial={account} />
      <Disclaimer withFutures />
    </div>
  );
}
