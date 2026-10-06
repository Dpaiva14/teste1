import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { DisclaimerFooter } from "@/components/brand/disclaimer";
import { BRAND } from "@/modules/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_60%)] p-10 lg:flex">
        <Link href="/" aria-label="Início">
          <Logo />
        </Link>
        <div className="max-w-md space-y-6">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">{BRAND.subtitle}</h2>
          <blockquote className="border-l-2 border-primary pl-4 text-muted-foreground">“{BRAND.principle}”</blockquote>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-wide text-muted-foreground">
            {BRAND.pipeline.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                {step}
                {i < BRAND.pipeline.length - 1 && <span aria-hidden>→</span>}
              </li>
            ))}
          </ol>
        </div>
        <p className="text-xs text-muted-foreground">Plataforma educativa. Sem sinais. Sem promessas de rentabilidade.</p>
      </aside>
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between p-5 lg:hidden">
          <Link href="/" aria-label="Início">
            <Logo />
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center px-5 py-8">
          <div className="w-full max-w-sm">{children}</div>
        </main>
        <DisclaimerFooter />
      </div>
    </div>
  );
}
