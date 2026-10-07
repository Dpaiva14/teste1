"use client";

import { Crosshair, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { CONFLUENCE_FACTORS } from "@/features/labs/logic/confluence";
import { ENTRY_REASONS } from "@/features/trading/logic/entry-reasons";
import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";
import { ACCOUNT_BALANCE, RISK_PERCENT, type Answers, type FactorKey, type StepKey } from "../schemas";
import type { PlanMetrics } from "../logic/evaluate";

export type PriceField = "entry" | "stop" | "target" | "contracts";

export interface StepCtx {
  answers: Answers;
  patch: (p: Partial<Answers>) => void;
  plan: PlanMetrics;
  atr: number;
  texts: Record<PriceField, string>;
  setText: (field: PriceField, text: string) => void;
  picking: boolean;
  setPicking: (v: boolean) => void;
  zoneRole: "demand" | "supply";
  setZoneRole: (r: "demand" | "supply") => void;
  disabled: boolean;
}

function Choice<T extends string>({ value, options, onChange, label, disabled }: { value: T | null; options: { value: T; label: string; hint?: string }[]; onChange: (v: T) => void; label: string; disabled: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={cn("rounded-lg border p-3 text-left text-sm transition-colors disabled:opacity-60", value === o.value ? "border-primary bg-primary/10" : "hover:border-primary/50")}
        >
          <span className="font-medium">{o.label}</span>
          {o.hint && <span className="mt-0.5 block text-xs text-muted-foreground">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

function Marks({ items, onRemove, label, disabled }: { items: { id: string; text: string }[]; onRemove: (id: string) => void; label: string; disabled: boolean }) {
  if (items.length === 0) return <p className="text-xs text-muted-foreground">Ainda sem marcações. {label}</p>;
  return (
    <ul className="grid gap-1.5" aria-label="Marcações feitas">
      {items.map((m) => (
        <li key={m.id} className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm">
          <span className="tabular">{m.text}</span>
          <Button size="icon-sm" variant="ghost" disabled={disabled} onClick={() => onRemove(m.id)} aria-label={`Remover ${m.text}`}>
            <Trash2 />
          </Button>
        </li>
      ))}
    </ul>
  );
}

function PriceInput({ ctx, field, label, hint, id }: { ctx: StepCtx; field: PriceField; label: string; hint?: string; id: string }) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <Input id={id} inputMode="decimal" autoComplete="off" disabled={ctx.disabled} value={ctx.texts[field]} onChange={(e) => ctx.setText(field, e.target.value)} className="tabular" />
    </Field>
  );
}

function PickButton({ ctx, what }: { ctx: StepCtx; what: string }) {
  return (
    <Button type="button" size="sm" variant={ctx.picking ? "default" : "outline"} disabled={ctx.disabled} onClick={() => ctx.setPicking(!ctx.picking)}>
      <Crosshair /> {ctx.picking ? "A escolher no gráfico… (clica)" : `Escolher ${what} no gráfico`}
    </Button>
  );
}

const rr = (plan: PlanMetrics) => (plan.valid && plan.rewardRisk !== null ? `${plan.rewardRisk}:1` : "—");

export function StepPanel({ step, ctx }: { step: StepKey; ctx: StepCtx }) {
  const { answers: a, patch, plan, disabled } = ctx;

  switch (step) {
    case "trend":
      return (
        <div className="grid gap-3">
          <Choice
            label="Tendência"
            disabled={disabled}
            value={a.trend}
            onChange={(v) => patch({ trend: v })}
            options={[
              { value: "UP", label: "Alta", hint: "Predominam máximos e mínimos mais altos e o preço subiu de forma direcional." },
              { value: "DOWN", label: "Baixa", hint: "Predominam máximos e mínimos mais baixos e o preço desceu de forma direcional." },
              { value: "RANGE", label: "Lateral", hint: "Sem direção dominante: o preço oscila entre extremos." },
            ]}
          />
          <p className="text-xs text-muted-foreground">Olha para o gráfico completo (não só para as últimas velas). Em gráficos ambíguos, mais do que uma leitura pode ser aceitável — o importante é a coerência com o resto do teu plano.</p>
        </div>
      );

    case "structure":
      return (
        <Choice
          label="Estrutura"
          disabled={disabled}
          value={a.structure}
          onChange={(v) => patch({ structure: v })}
          options={[
            { value: "BULLISH", label: "HH + HL (estrutura de alta)", hint: "O último máximo é mais alto e o último mínimo também." },
            { value: "BEARISH", label: "LH + LL (estrutura de baixa)", hint: "O último máximo é mais baixo e o último mínimo também." },
            { value: "RANGE", label: "Lateral / mista", hint: "Sinais mistos (compressão, expansão) ou sem swings claros." },
          ]}
        />
      );

    case "sr":
      return (
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">Clica no gráfico para marcar níveis horizontais onde o preço reagiu mais do que uma vez. Máximo de 8.</p>
          <Marks items={a.sr.map((s, n) => ({ id: s.id, text: `S/R ${n + 1}: ${s.price.toLocaleString("en-US")}` }))} onRemove={(id) => patch({ sr: a.sr.filter((s) => s.id !== id) })} label="Clica no gráfico." disabled={disabled} />
        </div>
      );

    case "supplyDemand":
      return (
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">Escolhe o tipo e arrasta no gráfico para desenhar uma zona (de onde o preço partiu com força). Máximo de 6.</p>
          <div role="radiogroup" aria-label="Tipo de zona" className="grid grid-cols-2 gap-2">
            {(["demand", "supply"] as const).map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={ctx.zoneRole === r}
                disabled={disabled}
                onClick={() => ctx.setZoneRole(r)}
                className={cn("rounded-lg border p-2 text-sm font-medium transition-colors", ctx.zoneRole === r ? (r === "demand" ? "border-success bg-success/10 text-success" : "border-danger bg-danger/10 text-danger") : "text-muted-foreground hover:text-foreground")}
              >
                {r === "demand" ? "Procura (compradores)" : "Oferta (vendedores)"}
              </button>
            ))}
          </div>
          <Marks
            items={a.zones.map((z) => ({ id: z.id, text: `${z.role === "demand" ? "Procura" : "Oferta"}: ${Math.min(z.top, z.bottom).toLocaleString("en-US")}–${Math.max(z.top, z.bottom).toLocaleString("en-US")}` }))}
            onRemove={(id) => patch({ zones: a.zones.filter((z) => z.id !== id) })}
            label="Arrasta no gráfico."
            disabled={disabled}
          />
        </div>
      );

    case "fibonacci":
      return (
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">Arrasta do início (A) ao fim (B) do movimento dominante. Ancora nos extremos reais (swings), não em pontos a meio.</p>
          {a.fib ? (
            <div className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-sm">
              <span className="tabular">
                A {a.fib.from.price.toLocaleString("en-US")} → B {a.fib.to.price.toLocaleString("en-US")}
              </span>
              <Button size="icon-sm" variant="ghost" disabled={disabled} onClick={() => patch({ fib: null })} aria-label="Remover Fibonacci">
                <Trash2 />
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Ainda sem Fibonacci. Arrasta no gráfico (ou continua sem, se não houver um impulso claro).</p>
          )}
        </div>
      );

    case "confluence": {
      const count = a.confluence.length;
      return (
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">Marca apenas os fatores que consegues apontar no gráfico. A avaliação verifica cada um contra o teu próprio plano (direção, entrada, marcações): marcar sem evidência custa pontos — e esquecer um fator presente também.</p>
          <ul className="grid gap-2">
            {CONFLUENCE_FACTORS.map((f) => {
              const checked = a.confluence.includes(f.key as FactorKey);
              return (
                <li key={f.key}>
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-sm hover:border-primary/50">
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={(v) => patch({ confluence: v === true ? [...a.confluence, f.key as FactorKey] : a.confluence.filter((k) => k !== f.key) })}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium">{f.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{f.question}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-muted-foreground tabular">{count} de 8 fatores marcados.</p>
        </div>
      );
    }

    case "liquidity":
      return (
        <div className="grid gap-3">
          <p className="text-sm text-muted-foreground">Marca máximos ou mínimos iguais (equal highs/lows) onde se acumulam stops. Clica no gráfico (máximo 4) — ou indica que não há liquidez evidente.</p>
          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-sm">
            <Checkbox checked={a.liquidity.none} disabled={disabled} onCheckedChange={(v) => patch({ liquidity: { levels: v === true ? [] : a.liquidity.levels, none: v === true } })} />
            Não identifico liquidez evidente neste gráfico
          </label>
          <Marks
            items={a.liquidity.levels.map((l) => ({ id: l.id, text: `Liquidez: ${l.price.toLocaleString("en-US")}` }))}
            onRemove={(id) => patch({ liquidity: { ...a.liquidity, levels: a.liquidity.levels.filter((l) => l.id !== id) } })}
            label={a.liquidity.none ? "Desmarca a opção acima para marcar níveis." : "Clica no gráfico."}
            disabled={disabled}
          />
        </div>
      );

    case "entry":
      return (
        <div className="grid gap-3">
          <Choice
            label="Direção"
            disabled={disabled}
            value={a.direction}
            onChange={(v) => patch({ direction: v })}
            options={[
              { value: "LONG", label: "Compra (LONG)" },
              { value: "SHORT", label: "Venda (SHORT)" },
            ]}
          />
          <PriceInput ctx={ctx} field="entry" id="as-entry" label="Preço de entrada" hint="Tratado como ordem pendente nesse preço." />
          <PickButton ctx={ctx} what="a entrada" />
        </div>
      );

    case "stop":
      return (
        <div className="grid gap-3">
          <PriceInput ctx={ctx} field="stop" id="as-stop" label="Stop loss" hint={a.direction === "SHORT" ? "Numa venda, o stop fica acima da entrada." : "Numa compra, o stop fica abaixo da entrada."} />
          <PickButton ctx={ctx} what="o stop" />
          <p className="text-xs text-muted-foreground tabular">
            Distância ao stop: {plan.stopPoints !== null ? `${plan.stopPoints} pontos (≈ ${(plan.stopPoints / ctx.atr).toFixed(1)} ATR)` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Pergunta de teste: o stop está onde a ideia fica errada, ou apenas onde «dói menos»?</p>
        </div>
      );

    case "target":
      return (
        <div className="grid gap-3">
          <PriceInput ctx={ctx} field="target" id="as-target" label="Take profit" hint={a.direction === "SHORT" ? "Numa venda, o alvo fica abaixo da entrada." : "Numa compra, o alvo fica acima da entrada."} />
          <PickButton ctx={ctx} what="o alvo" />
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-md border p-2">
              <p className="text-[0.65rem] uppercase text-muted-foreground">Stop</p>
              <p className="tabular font-medium">{plan.stopPoints ?? "—"}</p>
            </div>
            <div className="rounded-md border p-2">
              <p className="text-[0.65rem] uppercase text-muted-foreground">Alvo</p>
              <p className="tabular font-medium">{plan.targetPoints ?? "—"}</p>
            </div>
            <div className="rounded-md border p-2">
              <p className="text-[0.65rem] uppercase text-muted-foreground">R:R</p>
              <p className="tabular font-medium">{rr(plan)}</p>
            </div>
          </div>
        </div>
      );

    case "size":
      return (
        <div className="grid gap-3">
          <div className="rounded-lg border bg-card/60 p-3 text-sm">
            <p>
              Conta {formatUsd(ACCOUNT_BALANCE)} · risco {RISK_PERCENT}% = <strong>{formatUsd(plan.riskBudget)}</strong>
            </p>
            <p className="mt-1 text-muted-foreground tabular">
              MYM: $0,50 por ponto · stop de {plan.stopPoints ?? "—"} pontos → {plan.riskPerContract !== null ? formatUsd(plan.riskPerContract) : "—"} de risco por contrato
            </p>
          </div>
          <PriceInput ctx={ctx} field="contracts" id="as-contracts" label="Contratos MYM" hint="Número inteiro. Arredonda sempre para baixo." />
          <p className="text-xs text-muted-foreground">
            Fórmula: contratos = orçamento ÷ risco por contrato (para baixo). Se nenhum número inteiro couber, a resposta correta é 0 — não se aumenta o risco para «caber». Podes usar a{" "}
            <Link href="/tools/position-size" target="_blank" className="underline underline-offset-2">
              calculadora de posição
            </Link>
            .
          </p>
        </div>
      );

    case "reason":
      return (
        <div className="grid gap-3">
          <Choice
            label="Decisão"
            disabled={disabled}
            value={a.decision}
            onChange={(v) => patch({ decision: v })}
            options={[
              { value: "TAKE", label: "Tomo o trade", hint: "O plano cumpre o teu critério." },
              { value: "WAIT", label: "Espero (não tomo o trade)", hint: "Faltam condições; o plano fica como cenário condicional." },
            ]}
          />
          <Field label="Porque entras? (razão da entrada)" htmlFor="as-entry-reason">
            <select id="as-entry-reason" disabled={disabled} value={a.entryReason ?? ""} onChange={(e) => patch({ entryReason: (e.target.value || null) as Answers["entryReason"] })} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
              <option value="">— escolhe —</option>
              {ENTRY_REASONS.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Porque estás a considerar este trade?" htmlFor="as-reason" hint={`${a.reason.trim().length}/1200 · recomendado 60+ caracteres`}>
            <Textarea id="as-reason" disabled={disabled} maxLength={1200} value={a.reason} onChange={(e) => patch({ reason: e.target.value })} placeholder="Contexto, níveis, confluência, risco…" />
          </Field>
          <Field label="O que invalida a tua tese?" htmlFor="as-invalid" hint={`${a.invalidation.trim().length}/600 · recomendado 20+ caracteres`}>
            <Textarea id="as-invalid" disabled={disabled} maxLength={600} value={a.invalidation} onChange={(e) => patch({ invalidation: e.target.value })} placeholder="Se… então a ideia está errada e saio." />
          </Field>
        </div>
      );
  }
}
