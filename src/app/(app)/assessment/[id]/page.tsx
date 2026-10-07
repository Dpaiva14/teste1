import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { AssessmentWorkspace } from "@/features/assessment/components/assessment-workspace";
import { getAssessmentState } from "@/features/assessment/server/assessment-service";
import { requireUserPage } from "@/lib/auth/session";
import { orNotFound } from "@/lib/page-helpers";

export const metadata: Metadata = { title: "Avaliação final" };

export default async function AssessmentSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUserPage(`/assessment/${id}`);
  const state = await orNotFound(getAssessmentState(user, id));
  return (
    <div className="grid gap-6">
      <AssessmentWorkspace initial={state} />
      <Disclaimer withFutures />
    </div>
  );
}
