import { z } from "zod";
import { CATEGORY_KINDS } from "../enums";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(120),
  kind: z.enum(CATEGORY_KINDS),
  parentId: z.string().cuid().nullish(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  parentId: z.string().cuid().nullish(),
});
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
