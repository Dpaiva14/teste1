import { describe, expect, it } from "vitest";
import { classifySession, dayBands, formatCountdown, globexStatus, localClock, localToUtc, marketStatus, MARKETS, tzOffsetMinutes } from "./sessions";

const utc = (s: string) => new Date(s);

describe("time-zone maths", () => {
  it("offsets follow DST (New York −5 in winter, −4 in summer; London 0 / +1)", () => {
    expect(tzOffsetMinutes(utc("2025-01-15T12:00:00Z"), "America/New_York")).toBe(-300);
    expect(tzOffsetMinutes(utc("2025-07-15T12:00:00Z"), "America/New_York")).toBe(-240);
    expect(tzOffsetMinutes(utc("2025-01-15T12:00:00Z"), "Europe/London")).toBe(0);
    expect(tzOffsetMinutes(utc("2025-07-15T12:00:00Z"), "Europe/London")).toBe(60);
    expect(tzOffsetMinutes(utc("2025-07-15T12:00:00Z"), "Asia/Tokyo")).toBe(540);
  });
  it("localToUtc round-trips, including either side of the 2025 US DST change (9 March)", () => {
    expect(localToUtc(2025, 3, 7, 9 * 60 + 30, "America/New_York").toISOString()).toBe("2025-03-07T14:30:00.000Z"); // EST
    expect(localToUtc(2025, 3, 10, 9 * 60 + 30, "America/New_York").toISOString()).toBe("2025-03-10T13:30:00.000Z"); // EDT
    const c = localClock(utc("2025-03-10T13:30:00Z"), "America/New_York");
    expect(c.minutes).toBe(9 * 60 + 30);
  });
});

describe("classifySession", () => {
  it("NY cash open and regular session (winter and summer)", () => {
    expect(classifySession(utc("2025-01-15T14:30:00Z"))).toBe("NY_OPEN"); // 09:30 EST
    expect(classifySession(utc("2025-07-15T13:30:00Z"))).toBe("NY_OPEN"); // 09:30 EDT
    expect(classifySession(utc("2025-01-15T16:30:00Z"))).toBe("NY_RTH"); // 11:30 EST
    expect(classifySession(utc("2025-01-15T20:59:00Z"))).toBe("NY_RTH"); // 15:59 EST
  });
  it("London, overlap and Asia", () => {
    expect(classifySession(utc("2025-01-15T09:00:00Z"))).toBe("LONDON"); // 04:00 EST, London open
    expect(classifySession(utc("2025-01-15T13:30:00Z"))).toBe("OVERLAP"); // 08:30 EST, London 13:30
    expect(classifySession(utc("2025-01-15T03:00:00Z"))).toBe("ASIAN"); // Tokyo 12:00
  });
  it("the London/NY overlap moves with the two DST calendars (US changed on 9 Mar, UK on 30 Mar)", () => {
    // Between the changes London is 4h ahead of New York instead of 5h.
    expect(classifySession(utc("2025-03-12T12:15:00Z"))).toBe("OVERLAP"); // 08:15 EDT, London 12:15 GMT (open)
    expect(classifySession(utc("2025-03-05T12:15:00Z"))).toBe("LONDON"); // 07:15 EST → NY not yet in the 08:00 window
  });
  it("after hours, off hours and weekend closure", () => {
    expect(classifySession(utc("2025-01-15T22:00:00Z"))).toBe("AFTER_HOURS"); // 17:00 EST
    expect(classifySession(utc("2025-01-16T01:00:00Z"))).toBe("ASIAN"); // 20:00 EST, but Tokyo is open (10:00)
    expect(classifySession(utc("2025-01-15T07:00:00Z"))).toBe("OFF_HOURS"); // Tokyo closed (16:00), London not yet open
    expect(classifySession(utc("2025-01-18T15:00:00Z"))).toBe("CLOSED"); // Saturday
    expect(classifySession(utc("2025-01-19T20:00:00Z"))).toBe("CLOSED"); // Sunday 15:00 EST (Globex reopens 18:00)
  });
});

describe("globexStatus", () => {
  it("open, daily break and weekend", () => {
    expect(globexStatus(utc("2025-01-15T15:00:00Z"))).toBe("OPEN");
    expect(globexStatus(utc("2025-01-15T22:30:00Z"))).toBe("DAILY_BREAK"); // 17:30 EST
    expect(globexStatus(utc("2025-01-17T22:30:00Z"))).toBe("WEEKEND_CLOSED"); // Friday after 17:00 EST
    expect(globexStatus(utc("2025-01-19T23:30:00Z"))).toBe("OPEN"); // Sunday 18:30 EST
    expect(globexStatus(utc("2025-01-19T20:00:00Z"))).toBe("WEEKEND_CLOSED");
  });
});

describe("marketStatus", () => {
  const ny = MARKETS[2]!;
  it("open market reports its close", () => {
    const s = marketStatus(utc("2025-01-15T15:00:00Z"), ny); // 10:00 EST
    expect(s.open).toBe(true);
    expect(s.nextChange.toISOString()).toBe("2025-01-15T21:00:00.000Z"); // 16:00 EST
  });
  it("closed market (Friday evening) reports the next Monday open", () => {
    const s = marketStatus(utc("2025-01-17T23:00:00Z"), ny);
    expect(s.open).toBe(false);
    expect(s.nextChange.toISOString()).toBe("2025-01-20T14:30:00.000Z");
  });
});

describe("dayBands", () => {
  it("expresses market windows in the viewer's zone (Lisbon in winter = UTC)", () => {
    const bands = dayBands(utc("2025-01-15T10:00:00Z"), "Europe/Lisbon");
    const ny = bands.find((b) => b.key === "NEW_YORK")!;
    expect(ny.start).toBe(14 * 60 + 30);
    expect(ny.end).toBe(21 * 60);
    const ldn = bands.find((b) => b.key === "LONDON")!;
    expect([ldn.start, ldn.end]).toEqual([8 * 60, 16 * 60 + 30]);
  });
  it("splits bands that cross the viewer's midnight (Tokyo session seen from New York)", () => {
    const bands = dayBands(utc("2025-01-15T18:00:00Z"), "America/New_York").filter((b) => b.key === "TOKYO");
    expect(bands.length).toBeGreaterThanOrEqual(1);
    for (const b of bands) {
      expect(b.start).toBeGreaterThanOrEqual(0);
      expect(b.end).toBeLessThanOrEqual(1440);
    }
  });
});

describe("formatCountdown", () => {
  it("formats minutes, hours and days", () => {
    expect(formatCountdown(5 * 60_000)).toBe("5m");
    expect(formatCountdown(125 * 60_000)).toBe("2h 05m");
    expect(formatCountdown(26 * 3600_000)).toBe("1d 2h");
    expect(formatCountdown(-5)).toBe("0m");
  });
});
