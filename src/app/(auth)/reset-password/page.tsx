import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Nova password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <div className="grid gap-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Definir nova password</h1>
        <p className="text-sm text-muted-foreground">Depois de guardar, todas as sessões abertas são terminadas por segurança.</p>
      </div>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Ligação inválida. <Link href="/forgot-password" className="text-primary underline">Pedir uma nova</Link>.
        </p>
      )}
    </div>
  );
}
