"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { useApiAction } from "@/hooks/use-api-action";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const action = useApiAction((input: { email: string }) =>
    api<{ message: string }>("/api/auth/forgot-password", { method: "POST", body: input }),
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await action.run({ email });
    if (res) setSent(res.message);
  }

  if (sent) {
    return (
      <div className="grid gap-4">
        <Alert variant="success">
          <AlertDescription>{sent}</AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/login">Voltar ao início de sessão</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {action.error && (
        <Alert variant="destructive">
          <AlertDescription>{action.error}</AlertDescription>
        </Alert>
      )}
      <Field label="E-mail da conta" htmlFor="email" error={action.fieldErrors.email?.[0]}>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Button type="submit" disabled={action.pending}>
        {action.pending && <Loader2 className="animate-spin" />}
        Enviar ligação de recuperação
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Voltar ao início de sessão
        </Link>
      </p>
    </form>
  );
}
