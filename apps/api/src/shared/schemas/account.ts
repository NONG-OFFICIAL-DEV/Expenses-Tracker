import { z } from "zod";
import { ACCOUNT_TYPES } from "../enums.js";

export const createAccountSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(ACCOUNT_TYPES),
  icon: z.string().max(40).nullish(),
  currency: z.string().length(3).default("USD"),
  openingBalance: z.coerce.number().finite().default(0),
});
export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  type: z.enum(ACCOUNT_TYPES).optional(),
  icon: z.string().max(40).nullish(),
  currency: z.string().length(3).optional(),
  openingBalance: z.coerce.number().finite().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export const reconcileAccountSchema = z.object({
  actualBalance: z.coerce.number().finite(),
  note: z.string().max(500).optional(),
});
export type ReconcileAccountInput = z.infer<typeof reconcileAccountSchema>;
