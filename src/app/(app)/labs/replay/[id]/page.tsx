import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { ReplayWorkspace } from "@/features/replay/components/replay-workspace";
import { getReplayState } from "@/features/replay/server/replay-service";
import { requireUserPage } from "@/lib/auth/session";
import { orNotFound } from "@/lib/page-helpers";

export const metadata: Metadata = { title: "Chart Replay" };

export default async function ReplaySessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUserPage(`/labs/replay/${id}`);
  const state = await orNotFound(getReplayState(user, id));
  return (
    <div className="grid gap-6">
      <ReplayWorkspace initial={state} />
      <Disclaimer withFutures />
    </div>
  );
}
