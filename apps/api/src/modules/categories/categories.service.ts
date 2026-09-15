import type { PrismaClient } from "@prisma/client";
import type { CreateCategoryInput, UpdateCategoryInput } from "@expense-tracker/shared";

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
  const existing = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!existing) throw new NotFoundError("Category not found or not editable");
  return prisma.category.update({
    where: { id: categoryId },
    data: { name: input.name, parentId: input.parentId },
  });
}

export async function deleteCategory(prisma: PrismaClient, userId: string, categoryId: string) {
  const existing = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!existing) throw new NotFoundError("Category not found or not editable");
  await prisma.category.delete({ where: { id: categoryId } });
}
