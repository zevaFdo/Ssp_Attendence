import { describe, expect, it } from "vitest";
import { approvalDecisionSchema } from "@/lib/validations/requests";

describe("approvalDecisionSchema", () => {
  const base = {
    requestId: "550e8400-e29b-41d4-a716-446655440000",
    decision: "approved" as const,
  };

  it("accepts approve without rejectionReason", () => {
    const result = approvalDecisionSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("rejects reject without rejectionReason", () => {
    const result = approvalDecisionSchema.safeParse({
      ...base,
      decision: "rejected",
    });
    expect(result.success).toBe(false);
  });

  it("rejects reject with fewer than 5 characters", () => {
    const result = approvalDecisionSchema.safeParse({
      ...base,
      decision: "rejected",
      rejectionReason: "短い",
    });
    expect(result.success).toBe(false);
  });

  it("accepts reject with rejectionReason of 5+ characters", () => {
    const result = approvalDecisionSchema.safeParse({
      ...base,
      decision: "rejected",
      rejectionReason: "業務都合により",
    });
    expect(result.success).toBe(true);
  });
});
