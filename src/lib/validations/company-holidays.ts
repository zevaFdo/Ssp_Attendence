import { z } from "zod";

export const companyHolidaySchema = z.object({
  name: z.string().trim().min(1).max(100),
  holiday_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "validation.dateFormat"),
  note: z.string().max(500).optional().or(z.literal("")),
});

export const companyHolidayUpdateSchema = companyHolidaySchema.extend({
  id: z.string().uuid(),
});

export type CompanyHolidayInput = z.infer<typeof companyHolidaySchema>;
