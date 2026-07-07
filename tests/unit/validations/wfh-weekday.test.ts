import { describe, expect, it } from "vitest";
import { wfhWeekdaySchema } from "@/lib/validations/wfh-weekday";

describe("wfhWeekdaySchema", () => {
  const profileId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts weekday 0–4", () => {
    for (const weekday of [0, 1, 2, 3, 4]) {
      const result = wfhWeekdaySchema.safeParse({ profileId, weekday });
      expect(result.success).toBe(true);
    }
  });

  it("accepts null (unassigned)", () => {
    const result = wfhWeekdaySchema.safeParse({ profileId, weekday: null });
    expect(result.success).toBe(true);
  });

  it("rejects weekday 5 (Saturday)", () => {
    const result = wfhWeekdaySchema.safeParse({ profileId, weekday: 5 });
    expect(result.success).toBe(false);
  });

  it("rejects weekday 6 (Sunday)", () => {
    const result = wfhWeekdaySchema.safeParse({ profileId, weekday: 6 });
    expect(result.success).toBe(false);
  });
});
