import { z } from "zod";

export const monthlyReportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});
export type MonthlyReportQueryInput = z.infer<typeof monthlyReportQuerySchema>;
