import { z } from "zod";
import { CATEGORY_KINDS } from "../enums.js";

export const createCategorySchema = z
  .object({
    name: z.string().min(1).max(120),
    kind: z.enum(CATEGORY_KINDS),
    parentId: z.string().cuid().nullish(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "INCOME" && data.parentId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Income categories cannot have subcategories",
        path: ["parentId"],
      });
    }
  });
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  parentId: z.string().cuid().nullish(),
  isActive: z.boolean().optional(),
});
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
