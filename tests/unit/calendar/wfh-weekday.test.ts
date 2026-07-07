import { describe, expect, it } from "vitest";
import {
  isDefaultWfhDay,
  profileWeekdayToJsDay,
} from "@/lib/calendar/wfh-weekday-core";

describe("wfh-weekday", () => {
  it("maps profile weekday 0–4 to JS day Mon–Fri", () => {
    expect(profileWeekdayToJsDay(0)).toBe(1);
    expect(profileWeekdayToJsDay(4)).toBe(5);
  });

  it("returns false when default WFH weekday is null", () => {
    expect(isDefaultWfhDay(null, "2026-07-08")).toBe(false);
  });

  it("matches assigned weekday in Tokyo (Wed = profile 2)", () => {
    expect(isDefaultWfhDay(2, "2026-07-08")).toBe(true);
    expect(isDefaultWfhDay(2, "2026-07-09")).toBe(false);
  });
});
