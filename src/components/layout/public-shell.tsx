import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { DisclaimerFooter } from "@/components/brand/disclaimer";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

/** Minimal chrome for pages readable without an account. */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur sm:px-6">
        <Link href="/" aria-label="Início"><Logo /></Link>
        <nav aria-label="Principal" className="ml-6 hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
          <Link href="/glossary" className="hover:text-foreground">Glossário</Link>
          <Link href="/sources" className="hover:text-foreground">Fontes</Link>
          <Link href="/disclaimer" className="hover:text-foreground">Aviso legal</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm"><Link href="/login">Entrar</Link></Button>
          <Button asChild size="sm"><Link href="/register">Criar conta</Link></Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <DisclaimerFooter />
    </div>
  );
}
