"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, errorMessage } from "@/lib/api-client";
import type { AdminUserRow } from "../types";

export function UsersTable({ users, total, page, pages, q, selfId }: { users: AdminUserRow[]; total: number; page: number; pages: number; q: string; selfId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const go = (p: number, search = q) => router.push(`/admin/users?${new URLSearchParams({ ...(search ? { q: search } : {}), page: String(p) })}`);

  async function patch(u: AdminUserRow, body: { role?: "STUDENT" | "ADMIN"; disabled?: boolean }, confirmText?: string) {
    if (confirmText && !confirm(confirmText)) return;
    try {
      await api(`/api/admin/users/${u.id}`, { method: "PATCH", body });
      toast.success("Utilizador atualizado.");
      router.refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <div className="grid gap-4">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          go(1, query.trim());
        }}
      >
        <label htmlFor="u-search" className="sr-only">
          Pesquisar utilizadores
        </label>
        <Input id="u-search" value={query} maxLength={100} placeholder="Nome ou email…" onChange={(e) => setQuery(e.target.value)} className="max-w-sm" />
        <Button type="submit" variant="outline">
          <Search /> Pesquisar
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">{total} utilizador(es)</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead className="text-right">XP</TableHead>
            <TableHead>Último dia ativo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const self = u.id === selfId;
            return (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {u.name} {self && <Badge variant="outline">tu</Badge>}
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <select
                    aria-label={`Papel de ${u.name}`}
                    value={u.role}
                    disabled={self}
                    onChange={(e) => patch(u, { role: e.target.value as "STUDENT" | "ADMIN" }, e.target.value === "ADMIN" ? `Dar permissões de administrador a ${u.email}?` : undefined)}
                    className="h-8 rounded-md border border-input bg-card px-2 text-xs disabled:opacity-60"
                  >
                    <option value="STUDENT">Aluno</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </TableCell>
                <TableCell className="text-right tabular">{u.xp}</TableCell>
                <TableCell className="tabular text-xs text-muted-foreground">{u.lastActiveOn ?? "—"}</TableCell>
                <TableCell>{u.disabled ? <Badge variant="danger">desativado</Badge> : <Badge variant="success">ativo</Badge>}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" disabled={self} onClick={() => patch(u, { disabled: !u.disabled }, u.disabled ? undefined : `Desativar ${u.email}? A sessão atual é terminada.`)}>
                    {u.disabled ? "Reativar" : "Desativar"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => go(page - 1)}>
            Anterior
          </Button>
          <span className="tabular text-muted-foreground">
            {page} / {pages}
          </span>
          <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => go(page + 1)}>
            Seguinte
          </Button>
        </div>
      )}
    </div>
  );
}
