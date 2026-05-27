import { z } from "zod";

export const requestCreateSchema = z.object({
  type: z.enum(["leave", "late"]),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat"),
  reason: z
    .string()
    .trim()
    .min(5, "validation.reasonMin")
    .max(1000, "validation.reasonMax"),
});

export type RequestCreateInput = z.infer<typeof requestCreateSchema>;

export const approvalDecisionSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
});
export type ApprovalDecisionInput = z.infer<typeof approvalDecisionSchema>;
