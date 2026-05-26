import { z } from "zod";

export const requestCreateSchema = z.object({
  type: z.enum(["leave", "late"]),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  reason: z
    .string()
    .trim()
    .min(5, "Please provide at least 5 characters")
    .max(1000, "Keep it under 1000 characters"),
});

export type RequestCreateInput = z.infer<typeof requestCreateSchema>;

export const approvalDecisionSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
});
export type ApprovalDecisionInput = z.infer<typeof approvalDecisionSchema>;
