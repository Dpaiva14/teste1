import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Recuperar password" };

export default function ForgotPasswordPage() {
  return (
    <div className="grid gap-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Recuperar password</h1>
        <p className="text-sm text-muted-foreground">Indica o e-mail da tua conta e enviamos uma ligação de recuperação (válida 1 hora).</p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
