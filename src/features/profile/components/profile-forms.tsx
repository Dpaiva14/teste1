"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { passwordSchema } from "@/features/auth/schemas";
import { useApiAction } from "@/hooks/use-api-action";
import { api } from "@/lib/api-client";

const ZONES = ["UTC", "Europe/Lisbon", "Europe/London", "Europe/Madrid", "Europe/Paris", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Sao_Paulo", "Atlantic/Azores", "Asia/Tokyo", "Asia/Dubai", "Australia/Sydney"];

export function ProfileForm({ name: initialName, email, timezone: initialTz }: { name: string; email: string; timezone: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [tz, setTz] = useState(initialTz);
  const action = useApiAction((input: { name: string; timezone: string }) => api("/api/profile", { method: "PATCH", body: input }));
  const zones = [...new Set([initialTz, ...ZONES])];
  return (
    <Card>
      <CardHeader><CardTitle>Perfil</CardTitle><CardDescription>{email}</CardDescription></CardHeader>
      <CardContent className="grid gap-4">
        {action.error && <Alert variant="destructive"><AlertDescription>{action.error}</AlertDescription></Alert>}
        <Field label="Nome" htmlFor="p-name" error={action.fieldErrors.name?.[0]}><Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} /></Field>
        <Field label="Fuso horário" htmlFor="p-tz" hint="Usado para sessões, streaks e calendário.">
          <select id="p-tz" value={tz} onChange={(e) => setTz(e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm">{zones.map((z) => <option key={z} value={z}>{z.replaceAll("_", " ")}</option>)}</select>
        </Field>
        <Button className="w-fit" disabled={action.pending} onClick={async () => { if (await action.run({ name: name.trim(), timezone: tz })) { toast.success("Perfil atualizado."); router.refresh(); } }}>
          {action.pending && <Loader2 className="animate-spin" />} Guardar
        </Button>
      </CardContent>
    </Card>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const action = useApiAction((input: { currentPassword?: string; newPassword: string }) => api("/api/auth/password", { method: "POST", body: input }));
  const check = next ? passwordSchema.safeParse(next) : null;
  const err = check && !check.success ? check.error.issues[0]?.message : undefined;
  return (
    <Card>
      <CardHeader><CardTitle>{hasPassword ? "Alterar password" : "Definir password"}</CardTitle><CardDescription>{hasPassword ? "Ao alterar, as outras sessões são terminadas." : "A tua conta usa o Google. Podes também definir uma password."}</CardDescription></CardHeader>
      <CardContent className="grid gap-4">
        {action.error && <Alert variant="destructive"><AlertDescription>{action.error}</AlertDescription></Alert>}
        {hasPassword && <Field label="Password atual" htmlFor="pw-cur"><Input id="pw-cur" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>}
        <Field label="Nova password" htmlFor="pw-new" hint="Mínimo de 10 caracteres." error={err ?? action.fieldErrors.newPassword?.[0]}><Input id="pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
        <Button className="w-fit" disabled={action.pending || !next || Boolean(err) || (hasPassword && !current)} onClick={async () => { if (await action.run({ currentPassword: hasPassword ? current : undefined, newPassword: next })) { toast.success("Password atualizada."); setCurrent(""); setNext(""); } }}>
          {action.pending && <Loader2 className="animate-spin" />} Guardar password
        </Button>
      </CardContent>
    </Card>
  );
}
