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
import { passwordSchema } from "../schemas";
import { GoogleButton } from "./google-button";

export function RegisterForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const action = useApiAction((input: { name: string; email: string; password: string }) =>
    api<{ redirectTo: string }>("/api/auth/register", { method: "POST", body: input }),
  );

  const pwCheck = password.length > 0 ? passwordSchema.safeParse(password) : null;
  const pwError = pwCheck && !pwCheck.success ? pwCheck.error.issues[0]?.message : undefined;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await action.run({ name, email, password });
    if (res) {
      router.replace(res.redirectTo);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {action.error && (
        <Alert variant="destructive">
          <AlertDescription>{action.error}</AlertDescription>
        </Alert>
      )}
      <Field label="Nome" htmlFor="name" error={action.fieldErrors.name?.[0]}>
        <Input id="name" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="E-mail" htmlFor="email" error={action.fieldErrors.email?.[0]}>
        <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field
        label="Password"
        htmlFor="password"
        hint="Mínimo de 10 caracteres. Uma frase longa é melhor do que símbolos aleatórios."
        error={pwError ?? action.fieldErrors.password?.[0]}
      >
        <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" className="mt-0.5 size-4 accent-[var(--primary)]" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
        <span>
          Compreendo que esta plataforma é <strong className="text-foreground">exclusivamente educativa</strong> e não fornece sinais nem
          aconselhamento financeiro. Trading de CFDs e futuros envolve risco significativo de perda de capital.
        </span>
      </label>
      <Button type="submit" disabled={action.pending || !accepted || Boolean(pwError)}>
        {action.pending && <Loader2 className="animate-spin" />}
        Criar conta
      </Button>
      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>
          <GoogleButton />
        </>
      )}
      <p className="text-center text-sm text-muted-foreground">
        Já tens conta?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Iniciar sessão
        </Link>
      </p>
    </form>
  );
}
