import { describe, expect, it } from "vitest";
import { companyHolidaySchema } from "@/lib/validations/company-holidays";

describe("companyHolidaySchema", () => {
  const base = {
    name: "創立記念日",
    holiday_date: "2026-04-01",
  };

  it("accepts valid holiday input", () => {
    const result = companyHolidaySchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = companyHolidaySchema.safeParse({ ...base, name: "  " });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = companyHolidaySchema.safeParse({
      ...base,
      holiday_date: "2026/04/01",
    });
    expect(result.success).toBe(false);
  });
});
