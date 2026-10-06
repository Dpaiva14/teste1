import type { Metadata } from "next";
import { GlossaryManager } from "@/features/admin/components/glossary-manager";
import { listGlossary } from "@/features/admin/server/glossary-service";

export const metadata: Metadata = { title: "Glossário" };

export default async function AdminGlossary() {
  return <GlossaryManager terms={await listGlossary()} />;
}
