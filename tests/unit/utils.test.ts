import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";
import { todayISO } from "@/lib/utils/date";

describe("utils (smoke)", () => {
  it("cn merges Tailwind classes without conflict", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-sm", false && "hidden", "font-medium")).toBe(
      "text-sm font-medium",
    );
  });

  it("todayISO returns yyyy-MM-dd", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
