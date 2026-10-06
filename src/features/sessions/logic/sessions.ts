/**
 * Market-session maths. Windows are defined in each market's LOCAL time and converted with the IANA time-zone
 * database, so daylight-saving differences (US switches in March, the UK weeks later) are handled correctly.
 *
 * Session hours are CONVENTIONS used by traders, not official exchange schedules — treat them as approximate.
 * The CME Globex equity-index schedule (Sun 18:00 → Fri 17:00 ET, daily break 17:00–18:00 ET) is cited in
 * modules/sources.ts and must be checked at the source before relying on it.
 */

export type SessionKey = "ASIAN" | "LONDON" | "OVERLAP" | "NY_OPEN" | "NY_RTH" | "AFTER_HOURS" | "OFF_HOURS" | "CLOSED";

export const SESSION_LABEL: Record<SessionKey, string> = {
  ASIAN: "Ásia",
  LONDON: "Londres",
  OVERLAP: "Londres + pré-mercado EUA",
  NY_OPEN: "Abertura de NY (cash open)",
  NY_RTH: "NY — sessão regular (RTH)",
  AFTER_HOURS: "Pós-mercado EUA",
  OFF_HOURS: "Fora de sessões principais",
  CLOSED: "Mercado fechado (fim de semana)",
};

export interface MarketDef {
  key: "TOKYO" | "LONDON" | "NEW_YORK";
  label: string;
  tz: string;
  /** local opening / closing time as minutes since midnight */
  open: number;
  close: number;
  note: string;
}

export const MARKETS: readonly MarketDef[] = [
  { key: "TOKYO", label: "Ásia (Tóquio)", tz: "Asia/Tokyo", open: 9 * 60, close: 15 * 60, note: "≈ 09:00–15:00 locais (aproximado)" },
  { key: "LONDON", label: "Londres", tz: "Europe/London", open: 8 * 60, close: 16 * 60 + 30, note: "08:00–16:30 locais" },
  { key: "NEW_YORK", label: "Nova Iorque (RTH)", tz: "America/New_York", open: 9 * 60 + 30, close: 16 * 60, note: "Cash market dos EUA: 09:30–16:00 ET" },
];

const WEEKDAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export interface LocalClock {
  weekday: number; // 0=Sun
  minutes: number; // since local midnight
  year: number;
  month: number;
  day: number;
}

export function localClock(instant: Date, tz: string): LocalClock {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", weekday: "short", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(instant);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return {
    weekday: WEEKDAY[get("weekday")] ?? 0,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
  };
}

/** UTC offset (minutes, east positive) of `tz` at `instant`. */
export function tzOffsetMinutes(instant: Date, tz: string): number {
  const c = localClock(instant, tz);
  const asUtc = Date.UTC(c.year, c.month - 1, c.day, Math.floor(c.minutes / 60), c.minutes % 60);
  return Math.round((asUtc - Math.floor(instant.getTime() / 60_000) * 60_000) / 60_000);
}

/** Converts a wall-clock time in `tz` to the real instant (two passes to be correct around DST changes). */
export function localToUtc(year: number, month: number, day: number, minutes: number, tz: string): Date {
  const guess = Date.UTC(year, month - 1, day, Math.floor(minutes / 60), minutes % 60);
  let t = guess - tzOffsetMinutes(new Date(guess), tz) * 60_000;
  t = guess - tzOffsetMinutes(new Date(t), tz) * 60_000;
  return new Date(t);
}

const isWeekday = (d: number) => d >= 1 && d <= 5;

function marketOpen(instant: Date, m: MarketDef): boolean {
  const c = localClock(instant, m.tz);
  return isWeekday(c.weekday) && c.minutes >= m.open && c.minutes < m.close;
}

/** CME Globex equity-index trading window: Sun 18:00 ET → Fri 17:00 ET, with a 17:00–18:00 ET daily break. */
export function globexStatus(instant: Date): "OPEN" | "DAILY_BREAK" | "WEEKEND_CLOSED" {
  const c = localClock(instant, "America/New_York");
  const m = c.minutes;
  if (c.weekday === 6) return "WEEKEND_CLOSED";
  if (c.weekday === 5 && m >= 17 * 60) return "WEEKEND_CLOSED";
  if (c.weekday === 0 && m < 18 * 60) return "WEEKEND_CLOSED";
  if (m >= 17 * 60 && m < 18 * 60) return "DAILY_BREAK";
  return "OPEN";
}

/** Mutually-exclusive bucket used to tag trades (best/worst session analytics). */
export function classifySession(instant: Date): SessionKey {
  if (globexStatus(instant) === "WEEKEND_CLOSED") return "CLOSED";
  const ny = localClock(instant, "America/New_York");
  const m = ny.minutes;
  const nyWeekday = isWeekday(ny.weekday);
  if (nyWeekday && m >= 9 * 60 + 30 && m < 11 * 60) return "NY_OPEN";
  if (nyWeekday && m >= 11 * 60 && m < 16 * 60) return "NY_RTH";
  const london = marketOpen(instant, MARKETS[1]!);
  if (london && nyWeekday && m >= 8 * 60 && m < 9 * 60 + 30) return "OVERLAP";
  if (london) return "LONDON";
  if (marketOpen(instant, MARKETS[0]!)) return "ASIAN";
  if (nyWeekday && m >= 16 * 60 && m < 20 * 60) return "AFTER_HOURS";
  return "OFF_HOURS";
}

export interface MarketStatus {
  market: MarketDef;
  open: boolean;
  /** next transition instant (close if open, else next open) */
  nextChange: Date;
  localTime: string;
}

export function marketStatus(instant: Date, m: MarketDef): MarketStatus {
  const open = marketOpen(instant, m);
  // Scan forward minute-granularity-by-hour for the next transition (cheap: at most ~7 days).
  let probe = new Date(Math.floor(instant.getTime() / 60_000) * 60_000);
  const step = 15 * 60_000;
  for (let i = 0; i < 7 * 24 * 4; i++) {
    probe = new Date(probe.getTime() + step);
    if (marketOpen(probe, m) !== open) {
      // refine to the exact minute
      let lo = probe.getTime() - step;
      let hi = probe.getTime();
      while (hi - lo > 60_000) {
        const mid = Math.floor((lo + hi) / 2 / 60_000) * 60_000;
        if (marketOpen(new Date(mid), m) === open) lo = mid;
        else hi = mid;
      }
      return { market: m, open, nextChange: new Date(hi), localTime: formatLocal(instant, m.tz) };
    }
  }
  return { market: m, open, nextChange: probe, localTime: formatLocal(instant, m.tz) };
}

export function formatLocal(instant: Date, tz: string, withSeconds = false): string {
  return new Intl.DateTimeFormat("pt-PT", { timeZone: tz, hour: "2-digit", minute: "2-digit", ...(withSeconds ? { second: "2-digit" } : {}), hourCycle: "h23" }).format(instant);
}

export interface DayBand {
  key: string;
  label: string;
  /** minutes since midnight in the VIEWER's time zone; start < end, both in [0, 1440] (bands crossing midnight are split) */
  start: number;
  end: number;
}

/**
 * The day's windows for each market, expressed in the viewer's time zone. `reference` decides which calendar
 * day (in each market's own zone) is shown. Bands crossing the viewer's midnight are split in two.
 */
export function dayBands(reference: Date, viewerTz: string): DayBand[] {
  const out: DayBand[] = [];
  const viewerDay = localClock(reference, viewerTz);
  const viewerMidnight = localToUtc(viewerDay.year, viewerDay.month, viewerDay.day, 0, viewerTz).getTime();
  for (const m of MARKETS) {
    // Use the market-local calendar date that contains the viewer's local noon.
    const noon = localToUtc(viewerDay.year, viewerDay.month, viewerDay.day, 12 * 60, viewerTz);
    const c = localClock(noon, m.tz);
    const open = localToUtc(c.year, c.month, c.day, m.open, m.tz).getTime();
    const close = localToUtc(c.year, c.month, c.day, m.close, m.tz).getTime();
    const s = (open - viewerMidnight) / 60_000;
    const e = (close - viewerMidnight) / 60_000;
    const push = (a: number, b: number) => {
      const start = Math.max(0, a);
      const end = Math.min(1440, b);
      if (end > start) out.push({ key: m.key, label: m.label, start, end });
    };
    push(s, e);
    push(s + 1440, e + 1440); // part that wraps from the previous day
    push(s - 1440, e - 1440);
  }
  return out;
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.round(ms / 60_000));
  const d = Math.floor(total / 1440);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}
