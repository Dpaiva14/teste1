import type { Metadata } from "next";
import { UsersTable } from "@/features/admin/components/users-table";
import { userListQuery } from "@/features/admin/schemas";
import { listUsers } from "@/features/admin/server/users-service";
import { requireAdminPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Utilizadores" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireAdminPage();
  const { q, page } = userListQuery.catch({ q: undefined, page: 1 }).parse(await searchParams);
  const data = await listUsers(q, page);
  return <UsersTable users={data.users} total={data.total} page={data.page} pages={data.pages} q={q ?? ""} selfId={me.id} />;
}
