import { requireUserPage } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await requireUserPage("/dashboard");
  return <h1 className="text-2xl font-semibold">Olá, {user.name}</h1>;
}
