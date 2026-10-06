"use client";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  suffix,
  prefix,
  className,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: React.ReactNode;
  error?: string | undefined;
  suffix?: string;
  prefix?: string;
  className?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} className={className}>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <Input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn("tabular", prefix && "pl-7", suffix && "pr-12")}
        />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </Field>
  );
}

export function SymbolSelectNative({ id, value, onChange, label = "Instrumento", includeCustom = false }: { id: string; value: string; onChange: (v: string) => void; label?: string; includeCustom?: boolean }) {
  return (
    <Field label={label} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        <option value="YM">YM — E-mini Dow ($5/pt)</option>
        <option value="MYM">MYM — Micro E-mini Dow ($0,50/pt)</option>
        <option value="US30">US30 — CFD (demo $1/pt; varia por broker)</option>
        {includeCustom && <option value="CUSTOM">Personalizado (indico o valor por ponto)</option>}
      </select>
    </Field>
  );
}

export function DirectionToggle({ value, onChange }: { value: "LONG" | "SHORT"; onChange: (v: "LONG" | "SHORT") => void }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-medium leading-none">Direção</span>
      <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1" role="radiogroup" aria-label="Direção">
        {(["LONG", "SHORT"] as const).map((d) => (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={value === d}
            onClick={() => onChange(d)}
            className={cn(
              "rounded px-3 py-1 text-sm font-medium transition-colors",
              value === d ? (d === "LONG" ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground") : "text-muted-foreground hover:text-foreground",
            )}
          >
            {d === "LONG" ? "Compra (Long)" : "Venda (Short)"}
          </button>
        ))}
      </div>
    </div>
  );
}
