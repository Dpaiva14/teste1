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

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const action = useApiAction((input: { token: string; password: string }) =>
    api<{ redirectTo: string }>("/api/auth/reset-password", { method: "POST", body: input }),
  );
  const check = password.length > 0 ? passwordSchema.safeParse(password) : null;
  const pwError = check && !check.success ? check.error.issues[0]?.message : undefined;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await action.run({ token, password });
    if (res) router.replace(res.redirectTo);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      {action.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {action.error}{" "}
            <Link href="/forgot-password" className="underline">
              Pedir nova ligação
            </Link>
          </AlertDescription>
        </Alert>
      )}
      <Field label="Nova password" htmlFor="password" hint="Mínimo de 10 caracteres." error={pwError ?? action.fieldErrors.password?.[0]}>
        <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Button type="submit" disabled={action.pending || Boolean(pwError) || password.length === 0}>
        {action.pending && <Loader2 className="animate-spin" />}
        Guardar nova password
      </Button>
    </form>
  );
}
