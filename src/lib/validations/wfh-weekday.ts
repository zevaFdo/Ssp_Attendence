import { z } from "zod";

export const wfhWeekdaySchema = z.object({
  profileId: z.string().uuid(),
  weekday: z.number().int().min(0).max(4).nullable(),
});

export type WfhWeekdayInput = z.infer<typeof wfhWeekdaySchema>;
