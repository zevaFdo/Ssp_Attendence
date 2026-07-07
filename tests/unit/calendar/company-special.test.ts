import { describe, expect, it } from "vitest";
import { isCompanySpecialHoliday } from "@/lib/calendar/company-special";

describe("isCompanySpecialHoliday", () => {
  it("returns true for year-end and new-year range", () => {
    expect(isCompanySpecialHoliday("2026-12-29")).toBe(true);
    expect(isCompanySpecialHoliday("2026-12-31")).toBe(true);
    expect(isCompanySpecialHoliday("2027-01-01")).toBe(true);
    expect(isCompanySpecialHoliday("2027-01-04")).toBe(true);
  });

  it("returns false outside year-end range", () => {
    expect(isCompanySpecialHoliday("2026-12-28")).toBe(false);
    expect(isCompanySpecialHoliday("2027-01-05")).toBe(false);
  });

  it("returns true for Obon range", () => {
    expect(isCompanySpecialHoliday("2026-08-14")).toBe(true);
    expect(isCompanySpecialHoliday("2026-08-15")).toBe(true);
    expect(isCompanySpecialHoliday("2026-08-16")).toBe(true);
  });

  it("returns false outside Obon range", () => {
    expect(isCompanySpecialHoliday("2026-08-13")).toBe(false);
    expect(isCompanySpecialHoliday("2026-08-17")).toBe(false);
  });
});
