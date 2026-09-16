import { z } from "zod";
import { TRANSACTION_TYPES } from "../enums";

export const createTransactionSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES),
    accountId: z.string().cuid(),
    toAccountId: z.string().cuid().nullish(),
    categoryId: z.string().cuid().nullish(),
    amount: z.coerce.number().positive(),
    date: z.coerce.date(),
    merchant: z.string().max(200).nullish(),
    note: z.string().max(1000).nullish(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "TRANSFER") {
      if (!data.toAccountId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "toAccountId is required for transfers", path: ["toAccountId"] });
      }
      if (data.toAccountId === data.accountId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cannot transfer to the same account", path: ["toAccountId"] });
      }
      if (data.categoryId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Transfers cannot have a category", path: ["categoryId"] });
      }
    } else {
      if (!data.categoryId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "categoryId is required", path: ["categoryId"] });
      }
      if (data.toAccountId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "toAccountId is only valid for transfers", path: ["toAccountId"] });
      }
    }
  });
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  accountId: z.string().cuid().optional(),
  toAccountId: z.string().cuid().nullish(),
  categoryId: z.string().cuid().nullish(),
  amount: z.coerce.number().positive().optional(),
  date: z.coerce.date().optional(),
  merchant: z.string().max(200).nullish(),
  note: z.string().max(1000).nullish(),
});
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export const transactionFiltersSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  type: z.enum(TRANSACTION_TYPES).optional(),
  categoryId: z.string().cuid().optional(),
  accountId: z.string().cuid().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});
export type TransactionFiltersInput = z.infer<typeof transactionFiltersSchema>;
