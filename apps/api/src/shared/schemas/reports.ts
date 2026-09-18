import { z } from "zod";
import { CATEGORY_KINDS } from "../enums.js";

export const monthlyReportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  kind: z.enum(CATEGORY_KINDS).default("EXPENSE"),
});
export type MonthlyReportQueryInput = z.infer<typeof monthlyReportQuerySchema>;
