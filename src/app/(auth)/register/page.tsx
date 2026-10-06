import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/features/auth/components/register-form";
import { getCurrentUser } from "@/lib/auth/session";
import { isGoogleConfigured } from "@/lib/auth/google";

export const metadata: Metadata = { title: "Criar conta" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <div className="grid gap-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Cria a tua conta</h1>
        <p className="text-sm text-muted-foreground">Do zero ao avançado — sempre em modo educativo e simulado.</p>
      </div>
      <RegisterForm googleEnabled={isGoogleConfigured()} />
    </div>
  );
}
