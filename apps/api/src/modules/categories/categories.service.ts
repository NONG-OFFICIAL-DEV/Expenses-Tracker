import type { PrismaClient } from "@prisma/client";
import type { CreateCategoryInput, UpdateCategoryInput } from "../../shared/index.js";

export class NotFoundError extends Error {}
export class ValidationError extends Error {}

export function listCategories(prisma: PrismaClient, userId: string) {
  return prisma.category.findMany({
    where: { OR: [{ userId: null }, { userId }] },
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
}

export async function createCategory(prisma: PrismaClient, userId: string, input: CreateCategoryInput) {
  if (input.parentId) {
    if (input.kind === "INCOME") throw new ValidationError("Income categories cannot have subcategories");
    const parent = await prisma.category.findFirst({
      where: { id: input.parentId, OR: [{ userId: null }, { userId }] },
    });
    if (!parent) throw new ValidationError("Parent category not found");
    if (parent.kind !== input.kind) throw new ValidationError("Subcategory kind must match parent kind");
  }
  return prisma.category.create({
    data: { userId, name: input.name, kind: input.kind, parentId: input.parentId ?? null },
  });
}

export async function updateCategory(prisma: PrismaClient, userId: string, categoryId: string, input: UpdateCategoryInput) {
  // Renaming or toggling active/inactive is allowed on default (system) categories too, not
  // just the user's own — they're shared read-only-by-default rows, not per-user copies.
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, OR: [{ userId: null }, { userId }] },
  });
  if (!existing) throw new NotFoundError("Category not found");
  return prisma.category.update({
    where: { id: categoryId },
    data: { name: input.name, parentId: input.parentId, isActive: input.isActive },
  });
}

export async function deleteCategory(prisma: PrismaClient, userId: string, categoryId: string) {
  // Deleting is still restricted to categories the user created themselves — default
  // categories are shared, so a delete would remove them for every user.
  const existing = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!existing) throw new NotFoundError("Category not found or not deletable");
  await prisma.category.delete({ where: { id: categoryId } });
}
