import { PrismaClient } from "@prisma/client";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "./categories-data.js";

const prisma = new PrismaClient();

async function upsertSystemCategory(name: string, kind: "INCOME" | "EXPENSE", parentId: string | null) {
  const existing = await prisma.category.findFirst({ where: { userId: null, name, kind, parentId } });
  if (existing) return existing;
  return prisma.category.create({ data: { userId: null, name, kind, parentId } });
}

async function main() {
  for (const [parentName, children] of Object.entries(EXPENSE_CATEGORIES)) {
    const parent = await upsertSystemCategory(parentName, "EXPENSE", null);
    for (const childName of children) {
      await upsertSystemCategory(childName, "EXPENSE", parent.id);
    }
  }

  for (const name of INCOME_CATEGORIES) {
    await upsertSystemCategory(name, "INCOME", null);
  }

  console.log("Seeded default system categories.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
