import { z } from "zod";

export const clockInSchema = z.object({
  status: z.enum(["present", "wfh", "late"]).default("present"),
  notes: z.string().max(500).optional(),
});
export type ClockInInput = z.infer<typeof clockInSchema>;

export const overrideAttendanceSchema = z.object({
  userId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["present", "late", "absent", "wfh", "on_leave"]),
  notes: z.string().max(500).optional(),
});
export type OverrideAttendanceInput = z.infer<typeof overrideAttendanceSchema>;
