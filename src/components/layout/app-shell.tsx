"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flame, LogOut, Menu, Settings, Sparkles, UserRound } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { SidebarNav } from "./sidebar-nav";
import { api } from "@/lib/api-client";
import { DISCLAIMER } from "@/modules/legal";

export interface ShellUser {
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  xp: number;
  streakCount: number;
}

export function AppShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 overflow-y-auto border-r bg-card/40 p-4 scrollbar-thin lg:flex">
        <Link href="/dashboard" aria-label="Dashboard" className="px-2 pt-1">
          <Logo />
        </Link>
        <SidebarNav isAdmin={isAdmin} />
        <div className="mt-auto rounded-lg border bg-muted/40 p-3 text-[0.7rem] leading-relaxed text-muted-foreground">
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Modo educativo
          </p>
          Sem sinais, sem promessas. O objetivo é construir um processo de decisão repetível.
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur sm:px-5">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Navegação da plataforma</SheetDescription>
              <Logo className="mb-3 mt-1" />
              <SidebarNav isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="lg:hidden" aria-label="Dashboard">
            <Logo compact />
          </Link>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <div className="hidden items-center gap-3 rounded-md border bg-card px-3 py-1 text-xs sm:flex" aria-label="Progresso de gamificação">
              <span className="flex items-center gap-1 font-medium tabular" title="Dias consecutivos de aprendizagem">
                <Flame className="size-3.5 text-warning" />
                {user.streakCount}
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="font-medium tabular text-primary" title="Experiência">
                {user.xp.toLocaleString("pt-PT")} XP
              </span>
            </div>
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon" aria-label="Perfil e definições">
              <Link href="/profile">
                <Settings />
              </Link>
            </Button>
            <div className="hidden items-center gap-2 border-l pl-3 sm:flex">
              <UserRound className="size-4 text-muted-foreground" />
              <span className="max-w-32 truncate text-sm">{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Terminar sessão">
              <LogOut />
            </Button>
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t px-4 py-4 text-[0.7rem] leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
          <p className="mx-auto max-w-[1400px]">{DISCLAIMER}</p>
        </footer>
      </div>
    </div>
  );
}
