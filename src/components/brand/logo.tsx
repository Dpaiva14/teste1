import { cn } from "@/lib/utils";

/** Simple candlestick mark — original artwork. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} role="img" aria-label="US30 Trading Academy">
      <rect width="32" height="32" rx="8" fill="var(--primary)" />
      <g stroke="#fff" strokeWidth="1.6" strokeLinecap="round">
        <line x1="9" y1="7" x2="9" y2="25" />
        <line x1="16" y1="5" x2="16" y2="21" />
        <line x1="23" y1="10" x2="23" y2="27" />
      </g>
      <rect x="6.5" y="12" width="5" height="9" rx="1" fill="#fff" />
      <rect x="13.5" y="8.5" width="5" height="8" rx="1" fill="#fff" opacity="0.55" />
      <rect x="20.5" y="14" width="5" height="9" rx="1" fill="#fff" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[0.95rem] font-semibold tracking-tight">US30 Trading Academy</span>
          <span className="mt-1 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">Dow · Futures · Price Action</span>
        </span>
      )}
    </span>
  );
}
