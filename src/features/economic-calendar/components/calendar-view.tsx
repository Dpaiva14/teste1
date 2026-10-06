"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EVENT_EDUCATION } from "@/modules/event-education";
import type { EconomicEventDTO } from "../server/calendar-service";

const IMPACTS = ["LOW", "MEDIUM", "HIGH", "EXTREME"] as const;
const VARIANT = { LOW: "secondary", MEDIUM: "default", HIGH: "warning", EXTREME: "danger" } as const;
const LABEL = { LOW: "Baixo", MEDIUM: "Médio", HIGH: "Alto", EXTREME: "Extremo" } as const;

export function CalendarView({ events, timezone }: { events: EconomicEventDTO[]; timezone: string }) {
  const [active, setActive] = useState<Set<string>>(new Set(IMPACTS));
  const [openId, setOpenId] = useState<string | null>(null);

  const days = useMemo(() => {
    const fmtDay = new Intl.DateTimeFormat("pt-PT", { timeZone: timezone, weekday: "long", day: "numeric", month: "long" });
    const groups = new Map<string, EconomicEventDTO[]>();
    for (const e of events) {
      if (!active.has(e.impact)) continue;
      const k = fmtDay.format(new Date(e.scheduledAt));
      groups.set(k, [...(groups.get(k) ?? []), e]);
    }
    return [...groups.entries()];
  }, [events, active, timezone]);
  const time = new Intl.DateTimeFormat("pt-PT", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por impacto">
        {IMPACTS.map((i) => (
          <Button key={i} size="sm" variant={active.has(i) ? "default" : "outline"} aria-pressed={active.has(i)} onClick={() => setActive((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}>
            {LABEL[i]}
          </Button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">Horas no fuso {timezone.replaceAll("_", " ")}</span>
      </div>

      {days.length === 0 ? (
        <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">Sem eventos para os filtros escolhidos.</CardContent></Card>
      ) : days.map(([day, list]) => (
        <section key={day} className="grid gap-2" aria-label={day}>
          <h3 className="text-sm font-semibold capitalize text-muted-foreground">{day}</h3>
          {list.map((e) => {
            const edu = EVENT_EDUCATION[e.category] ?? EVENT_EDUCATION.OTHER!;
            const open = openId === e.id;
            return (
              <div key={e.id} className={cn("rounded-lg border bg-card", open && "border-primary/50")}>
                <button type="button" aria-expanded={open} onClick={() => setOpenId(open ? null : e.id)} className="flex w-full items-center gap-3 p-3 text-left">
                  <span className="w-14 shrink-0 text-sm font-semibold tabular">{time.format(new Date(e.scheduledAt))}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{e.title}</span>
                    <span className="text-xs text-muted-foreground">{e.country}{e.forecast ? ` · prev. ${e.forecast}` : ""}{e.previous ? ` · anterior ${e.previous}` : ""}{e.actual ? ` · atual ${e.actual}` : ""}</span>
                  </span>
                  {e.isDemo && <Badge variant="demo">DEMO</Badge>}
                  <Badge variant={VARIANT[e.impact]}>{e.impact}</Badge>
                  <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="grid gap-2 border-t p-4 text-sm">
                    <p className="font-semibold">{edu.title}</p>
                    <p><strong>O que é:</strong> {edu.what}</p>
                    <p><strong>Porque importa:</strong> {edu.why}</p>
                    <p><strong>O que observar:</strong> {edu.watch}</p>
                    {e.description && <p className="text-muted-foreground">{e.description}</p>}
                    {e.isDemo && <p className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-2 text-xs"><AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />Evento ILUSTRATIVO: data e hora fictícias. Consulta o calendário oficial (BLS, BEA, Federal Reserve) para datas reais.</p>}
                    {e.source && !e.isDemo && <p className="text-xs text-muted-foreground">Fonte: {e.source}{e.sourceUrl && <> — <a className="text-primary underline" href={e.sourceUrl} target="_blank" rel="noopener noreferrer">ligação</a></>}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
