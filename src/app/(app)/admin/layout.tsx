import type { Metadata } from "next";
import { AdminNav } from "@/features/admin/components/admin-nav";
import { requireAdminPage } from "@/lib/auth/session";

export const metadata: Metadata = { title: { default: "Administração", template: "%s · Administração" } };

/** Role check on the server for every admin page (the API routes check it again with `adminRoute`). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return (
    <div className="grid gap-6">
      <header className="grid gap-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Administração</h1>
        <AdminNav />
      </header>
      {children}
    </div>
  );
}
