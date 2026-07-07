import { describe, expect, it, vi } from "vitest";
import * as jpNational from "@/lib/calendar/jp-national";
import { isHolidaySync } from "@/lib/calendar/is-holiday-core";

describe("isHolidaySync", () => {
  it("returns true for weekends", () => {
    expect(isHolidaySync("2026-07-04", new Set())).toBe(true);
    expect(isHolidaySync("2026-07-05", new Set())).toBe(true);
  });

  it("returns true for company special holidays", () => {
    expect(isHolidaySync("2026-12-31", new Set())).toBe(true);
    expect(isHolidaySync("2026-08-15", new Set())).toBe(true);
  });

  it("returns true for custom DB holidays", () => {
    expect(isHolidaySync("2026-04-01", new Set(["2026-04-01"]))).toBe(true);
  });

  it("returns true for Japan national holidays", () => {
    vi.spyOn(jpNational, "isJapanNationalHoliday").mockReturnValue(true);
    expect(isHolidaySync("2026-01-01", new Set())).toBe(true);
    vi.restoreAllMocks();
  });

  it("returns false for a regular weekday", () => {
    vi.spyOn(jpNational, "isJapanNationalHoliday").mockReturnValue(false);
    expect(isHolidaySync("2026-07-07", new Set())).toBe(false);
    vi.restoreAllMocks();
  });
});
