import type { Metadata } from "next";
import { Disclaimer } from "@/components/brand/disclaimer";
import { prisma } from "@/database/client";
import { AiUnavailable } from "@/features/ai/components/ai-unavailable";
import { TutorChat } from "@/features/ai/components/tutor-chat";
import { aiConfigured } from "@/features/ai/server/ai-client";
import { listConversations } from "@/features/ai/server/tutor-service";
import { requireUserPage } from "@/lib/auth/session";
import { idSchema } from "@/lib/http-schemas";

export const metadata: Metadata = { title: "Tutor IA" };

export default async function TutorPage({ searchParams }: { searchParams: Promise<{ lesson?: string }> }) {
  const user = await requireUserPage("/tutor");
  const { lesson: lessonParam } = await searchParams;
  const configured = aiConfigured();
  const parsed = idSchema.safeParse(lessonParam);
  const lesson = parsed.success ? await prisma.lesson.findFirst({ where: { id: parsed.data, published: true, module: { published: true } }, select: { id: true, title: true } }) : null;
  const conversations = configured ? await listConversations(user) : [];
  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tutor IA</h1>
        <p className="mt-1 max-w-3xl text-muted-foreground">Esclarece dúvidas, pede exemplos e discute o teu raciocínio. O tutor ensina o processo — nunca dá sinais nem promete resultados.</p>
      </header>
      {configured ? <TutorChat initialConversations={conversations} lesson={lesson} /> : <AiUnavailable isAdmin={user.role === "ADMIN"} feature="O Tutor IA" />}
      <Disclaimer withFutures />
    </div>
  );
}
