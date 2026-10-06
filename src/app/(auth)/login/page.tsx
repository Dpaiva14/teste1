import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { isGoogleConfigured, safeNextPath } from "@/lib/auth/google";

export const metadata: Metadata = { title: "Iniciar sessão" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; reset?: string }> }) {
  const { next, error, reset } = await searchParams;
  if (await getCurrentUser()) redirect(safeNextPath(next));
  return (
    <div className="grid gap-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h1>
        <p className="text-sm text-muted-foreground">Continua a construir o teu processo de decisão.</p>
      </div>
      <LoginForm googleEnabled={isGoogleConfigured()} next={next ? safeNextPath(next) : undefined} initialError={error} justReset={reset === "1"} />
    </div>
  );
}
