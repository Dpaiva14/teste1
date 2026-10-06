import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "danger" | "warning" | "primary";

const toneClass: Record<Tone, string> = {
  default: "text-foreground",
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
  primary: "text-primary",
};

export function Stat({ label, value, hint, tone = "default", className }: { label: string; value: React.ReactNode; hint?: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-card/60 p-3", className)}>
      <p className="text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold tabular", toneClass[tone])}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
