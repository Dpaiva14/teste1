import { AppShell } from "@/components/layout/app-shell";
import { PublicShell } from "@/components/layout/public-shell";
import { getCurrentUser } from "@/lib/auth/session";

/** Public reference pages: full app shell for signed-in users, lightweight public chrome otherwise. */
export default async function ReferenceLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) return <PublicShell>{children}</PublicShell>;
  return <AppShell user={{ name: user.name, email: user.email, role: user.role, xp: user.xp, streakCount: user.streakCount }}>{children}</AppShell>;
}
