import { z } from "zod";

/**
 * Statuses an employee may set on themselves from the ClockInOutCard
 * switcher. Excludes `absent` (synthetic) but includes the 4 new
 * groupware-style presence labels.
 */
export const setStatusSchema = z.object({
  status: z.enum([
    "present",
    "wfh",
    "meeting",
    "break",
    "out_of_office",
    "clocked_out",
    "late",
    "on_leave",
  ]),
});
export type SetStatusInput = z.infer<typeof setStatusSchema>;

export const overrideAttendanceSchema = z.object({
  userId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat"),
  status: z.enum([
    "present",
    "late",
    "absent",
    "wfh",
    "on_leave",
    "meeting",
    "break",
    "out_of_office",
    "clocked_out",
  ]),
  notes: z.string().max(500).optional(),
});
export type OverrideAttendanceInput = z.infer<typeof overrideAttendanceSchema>;
