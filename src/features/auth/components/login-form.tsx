"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { useApiAction } from "@/hooks/use-api-action";
import { GoogleButton } from "./google-button";

const URL_ERRORS: Record<string, string> = {
  google_not_configured: "O login com Google não está configurado neste ambiente.",
  google_denied: "O acesso com Google foi cancelado.",
  google_failed: "Não foi possível concluir o login com Google. Tenta novamente.",
};

export function LoginForm({
  googleEnabled,
  next,
  initialError,
  justReset,
}: {
  googleEnabled: boolean;
  next?: string;
  initialError?: string;
  justReset?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const action = useApiAction((input: { email: string; password: string; next?: string }) =>
    api<{ redirectTo: string }>("/api/auth/login", { method: "POST", body: input }),
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await action.run({ email, password, next });
    if (res) {
      router.replace(res.redirectTo);
      router.refresh();
    }
  }

  const urlError = initialError ? URL_ERRORS[initialError] : undefined;

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {justReset && (
        <Alert variant="success">
          <AlertDescription>Password atualizada. Já podes iniciar sessão.</AlertDescription>
        </Alert>
      )}
      {(action.error || urlError) && (
        <Alert variant="destructive">
          <AlertDescription>{action.error ?? urlError}</AlertDescription>
        </Alert>
      )}
      <Field label="E-mail" htmlFor="email" error={action.fieldErrors.email?.[0]}>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" htmlFor="password" error={action.fieldErrors.password?.[0]}>
        <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <div className="-mt-2 text-right">
        <Link href="/forgot-password" className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Esqueci-me da password
        </Link>
      </div>
      <Button type="submit" disabled={action.pending}>
        {action.pending && <Loader2 className="animate-spin" />}
        Iniciar sessão
      </Button>
      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleButton next={next} />
        </>
      )}
      <p className="text-center text-sm text-muted-foreground">
        Ainda não tens conta?{" "}
        <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
