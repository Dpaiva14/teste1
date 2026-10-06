import { AppShell } from "@/components/layout/app-shell";
import { requireUserPage } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserPage();
  return (
    <AppShell user={{ name: user.name, email: user.email, role: user.role, xp: user.xp, streakCount: user.streakCount }}>{children}</AppShell>
  );
}
