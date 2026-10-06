import { requireUserPage } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await requireUserPage("/dashboard");
  return <main className="p-6">Olá, {user.name}</main>;
}
