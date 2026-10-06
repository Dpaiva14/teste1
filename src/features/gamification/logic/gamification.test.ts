import { describe, expect, it } from "vitest";
import { applyActivity, dayKey, effectiveStreak, previousDayKey } from "./streak";
import { rankForXp, XP_RANKS } from "./xp";

describe("rankForXp", () => {
  it("starts at rank 1 and progresses", () => {
    expect(rankForXp(0).current.rank).toBe(1);
    expect(rankForXp(149).current.rank).toBe(1);
    expect(rankForXp(150).current.rank).toBe(2);
    expect(rankForXp(150).percent).toBe(0);
  });
  it("computes percent inside the rank and xp to next", () => {
    const r = rankForXp(300); // between 150 and 450
    expect(r.current.rank).toBe(2);
    expect(r.percent).toBe(50);
    expect(r.xpForNext).toBe(150);
  });
  it("caps at the top rank", () => {
    const top = XP_RANKS[XP_RANKS.length - 1]!;
    const r = rankForXp(top.minXp + 5000);
    expect(r.next).toBeNull();
    expect(r.percent).toBe(100);
  });
  it("ignores negative xp", () => {
    expect(rankForXp(-50).current.rank).toBe(1);
  });
});

describe("streak", () => {
  it("previousDayKey handles month and year boundaries and leap day", () => {
    expect(previousDayKey("2025-03-01")).toBe("2025-02-28");
    expect(previousDayKey("2024-03-01")).toBe("2024-02-29");
    expect(previousDayKey("2025-01-01")).toBe("2024-12-31");
  });
  it("starts, continues, repeats and resets", () => {
    let s = applyActivity({ count: 0, longest: 0, lastActive: null }, "2025-03-10");
    expect(s).toEqual({ count: 1, longest: 1, lastActive: "2025-03-10" });
    s = applyActivity(s, "2025-03-10"); // same day: no change
    expect(s.count).toBe(1);
    s = applyActivity(s, "2025-03-11");
    s = applyActivity(s, "2025-03-12");
    expect(s).toEqual({ count: 3, longest: 3, lastActive: "2025-03-12" });
    s = applyActivity(s, "2025-03-15"); // gap → reset, longest kept
    expect(s).toEqual({ count: 1, longest: 3, lastActive: "2025-03-15" });
  });
  it("effectiveStreak shows a broken streak as 0", () => {
    const s = { count: 5, longest: 5, lastActive: "2025-03-10" };
    expect(effectiveStreak(s, "2025-03-10")).toBe(5);
    expect(effectiveStreak(s, "2025-03-11")).toBe(5); // can still be saved today
    expect(effectiveStreak(s, "2025-03-12")).toBe(0);
    expect(effectiveStreak({ count: 0, longest: 0, lastActive: null }, "2025-03-12")).toBe(0);
  });
  it("dayKey respects the user's timezone", () => {
    const instant = new Date("2025-03-10T23:30:00Z");
    expect(dayKey(instant, "UTC")).toBe("2025-03-10");
    expect(dayKey(instant, "Asia/Tokyo")).toBe("2025-03-11");
    expect(dayKey(instant, "America/New_York")).toBe("2025-03-10");
    expect(dayKey(instant, "Not/AZone")).toBe("2025-03-10"); // invalid tz falls back to UTC
  });
});
