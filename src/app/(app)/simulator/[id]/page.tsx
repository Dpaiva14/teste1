import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Disclaimer } from "@/components/brand/disclaimer";
import { SimulatorWorkspace } from "@/features/simulator/components/simulator-workspace";
import { getAccountState } from "@/features/simulator/server/simulator-service";
import { requireUserPage } from "@/lib/auth/session";
import { HttpError } from "@/lib/errors";

export const metadata: Metadata = { title: "Simulador" };

export default async function SimulatorAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUserPage(`/simulator/${id}`);
  try {
    const account = await getAccountState(user, id);
    return (
      <div className="grid gap-6">
        <SimulatorWorkspace initial={account} />
        <Disclaimer withFutures />
      </div>
    );
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  }
}
