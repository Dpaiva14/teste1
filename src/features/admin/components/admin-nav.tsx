"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Visão geral", exact: true },
  { href: "/admin/content", label: "Conteúdo" },
  { href: "/admin/users", label: "Utilizadores" },
  { href: "/admin/events", label: "Eventos económicos" },
  { href: "/admin/glossary", label: "Glossário" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Administração" className="flex flex-wrap gap-1 rounded-lg bg-muted p-1 text-sm">
      {ITEMS.map((i) => {
        const active = i.exact ? path === i.href : path === i.href || path.startsWith(`${i.href}/`);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined} className={cn("rounded-md px-3 py-1.5 font-medium transition-colors", active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
