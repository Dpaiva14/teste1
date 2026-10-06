"use client";

import { useEffect, useMemo, useState } from "react";
import { Globe2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, errorMessage } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { classifySession, dayBands, formatCountdown, formatLocal, globexStatus, localToUtc, localClock, MARKETS, marketStatus, SESSION_LABEL } from "../logic/sessions";

const COMMON_TZ = ["UTC", "Europe/Lisbon", "Europe/London", "Europe/Madrid", "Europe/Paris", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Sao_Paulo", "Atlantic/Azores", "Asia/Tokyo", "Asia/Dubai", "Australia/Sydney"];
const BAND_STYLE: Record<string, string> = { TOKYO: "bg-info/30 border-info/50", LONDON: "bg-warning/30 border-warning/50", NEW_YORK: "bg-success/30 border-success/50" };
const GLOBEX_LABEL = { OPEN: "Aberto", DAILY_BREAK: "Pausa diária", WEEKEND_CLOSED: "Fechado (fim de semana)" } as const;

export function SessionClock({ savedTimezone }: { savedTimezone: string }) {
  const [tz, setTz] = useState(savedTimezone);
  const [now, setNow] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Subscribe to the clock (external system). The first tick is scheduled, not set synchronously in the effect body.
    const first = setTimeout(() => setNow(new Date()), 0);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const browserTz = useMemo(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; }
  }, []);
  const zones = useMemo(() => [...new Set([savedTimezone, browserTz, ...COMMON_TZ])], [savedTimezone, browserTz]);

  if (!now) return <div className="h-96 animate-pulse rounded-xl border bg-muted/30" aria-busy="true" />;

  const bands = dayBands(now, tz);
  const clock = localClock(now, tz);
  const nowMin = clock.minutes + now.getSeconds() / 60;
  const session = classifySession(now);
  const globex = globexStatus(now);
  const statuses = MARKETS.map((m) => marketStatus(now, m));
  const ny = statuses[2]!;

  // Next NY cash open (09:30 ET) for the countdown, even when the market is currently open.
  const nyClock = localClock(now, "America/New_York");
  let nextOpen = localToUtc(nyClock.year, nyClock.month, nyClock.day, 9 * 60 + 30, "America/New_York");
  for (let i = 0; i < 8 && (nextOpen <= now || [0, 6].includes(localClock(nextOpen, "America/New_York").weekday)); i++) {
    const d = new Date(nextOpen.getTime() + 24 * 3600_000);
    const c = localClock(d, "America/New_York");
    nextOpen = localToUtc(c.year, c.month, c.day, 9 * 60 + 30, "America/New_York");
  }

  async function saveTz() {
    setSaving(true);
    try {
      await api("/api/profile", { method: "PATCH", body: { timezone: tz } });
      toast.success("Fuso horário guardado.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardContent className="grid gap-1 p-6">
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Globe2 className="size-4" /> A tua hora ({tz.replaceAll("_", " ")})</p>
            <p className="text-5xl font-semibold tabular tracking-tight" aria-live="off">{formatLocal(now, tz, true)}</p>
            <p className="text-sm text-muted-foreground">{new Intl.DateTimeFormat("pt-PT", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(now)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="default">{SESSION_LABEL[session]}</Badge>
              <Badge variant={globex === "OPEN" ? "success" : "secondary"}>Globex: {GLOBEX_LABEL[globex]}</Badge>
              <Badge variant="outline">Abertura de NY em {formatCountdown(nextOpen.getTime() - now.getTime())}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-3 p-5">
            <label htmlFor="tz" className="text-sm font-medium">Converter para o fuso horário</label>
            <select id="tz" value={tz} onChange={(e) => setTz(e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm">
              {zones.map((z) => <option key={z} value={z}>{z.replaceAll("_", " ")}{z === browserTz ? " (browser)" : ""}</option>)}
            </select>
            <Button variant="outline" size="sm" disabled={saving || tz === savedTimezone} onClick={saveTz}>Guardar como o meu fuso</Button>
            <p className="text-xs text-muted-foreground">O fuso guardado é usado nos streaks e no calendário.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statuses.map((s) => (
          <Card key={s.market.key}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">{s.market.label}<Badge variant={s.open ? "success" : "secondary"}>{s.open ? "Aberto" : "Fechado"}</Badge></CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1 text-sm">
              <p className="text-2xl font-semibold tabular">{formatLocal(now, s.market.tz)}</p>
              <p className="text-muted-foreground">{s.market.note}</p>
              <p className="text-xs text-muted-foreground">{s.open ? "Fecha" : "Abre"} em {formatCountdown(s.nextChange.getTime() - now.getTime())} ({formatLocal(s.nextChange, tz)} no teu fuso)</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">O dia no teu fuso horário</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div className="relative h-28 rounded-lg border bg-[var(--chart-bg)]" role="img" aria-label="Linha do tempo das sessões de Tóquio, Londres e Nova Iorque no teu fuso horário">
            {MARKETS.map((m, row) =>
              bands.filter((b) => b.key === m.key).map((b, i) => (
                <div key={`${b.key}-${i}`} className={cn("absolute flex h-7 items-center justify-center overflow-hidden rounded border text-[0.7rem] font-semibold", BAND_STYLE[b.key])} style={{ left: `${(b.start / 1440) * 100}%`, width: `${((b.end - b.start) / 1440) * 100}%`, top: `${8 + row * 32}px` }}>
                  {m.label.split(" ")[0]}
                </div>
              )),
            )}
            <div className="absolute inset-y-0 w-px bg-foreground" style={{ left: `${(nowMin / 1440) * 100}%` }} aria-hidden>
              <span className="absolute -top-0.5 left-1 rounded bg-foreground px-1 text-[0.6rem] text-background">agora</span>
            </div>
          </div>
          <div className="flex justify-between font-mono text-[0.65rem] text-muted-foreground">{[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => <span key={h}>{String(h).padStart(2, "0")}h</span>)}</div>
          <ul className="grid gap-1 text-sm sm:grid-cols-3">
            {MARKETS.map((m) => {
              const bs = bands.filter((b) => b.key === m.key);
              const fmt = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(Math.round(min % 60)).padStart(2, "0")}`;
              return <li key={m.key}><span className="font-medium">{m.label}:</span> <span className="tabular text-muted-foreground">{bs.map((b) => `${fmt(b.start)}–${b.end >= 1440 ? "24:00" : fmt(b.end)}`).join(" + ") || "—"}</span></li>;
            })}
          </ul>
          <p className="text-xs text-muted-foreground">As horas são <strong>convenções aproximadas</strong> de sessão (ver Learning Sources) e ajustam-se automaticamente ao horário de verão de cada mercado. A abertura do cash market de Nova Iorque é às 09:30 ET.{ny.open ? " Agora estás dentro do horário regular (RTH)." : ""}</p>
        </CardContent>
      </Card>
    </div>
  );
}
