import type { PrismaClient } from "@prisma/client";
import type { MonthlyReportQueryInput } from "../../shared/index.js";

export async function getMonthlyReport(prisma: PrismaClient, userId: string, query: MonthlyReportQueryInput) {
  const year = query.year ?? new Date().getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const transactions = await prisma.transaction.findMany({
    where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
    select: { amount: true, date: true, category: { select: { id: true, name: true, parentId: true } } },
  });

  const parentIds = [...new Set(transactions.map((t) => t.category?.parentId).filter((id): id is string => !!id))];
  const parents = parentIds.length
    ? await prisma.category.findMany({ where: { id: { in: parentIds } }, select: { id: true, name: true } })
    : [];
  const parentNameById = new Map(parents.map((p) => [p.id, p.name]));

  const rows = new Map<string, { categoryId: string; name: string; months: number[] }>();
  for (const tx of transactions) {
    if (!tx.category) continue;
    const rollupId = tx.category.parentId ?? tx.category.id;
    const rollupName = tx.category.parentId ? parentNameById.get(tx.category.parentId) ?? tx.category.name : tx.category.name;
    if (!rows.has(rollupId)) {
      rows.set(rollupId, { categoryId: rollupId, name: rollupName, months: new Array(12).fill(0) });
    }
    const row = rows.get(rollupId)!;
    const monthIndex = tx.date.getUTCMonth();
    row.months[monthIndex] += tx.amount.toNumber();
  }

  const grid = [...rows.values()].sort((a, b) => a.name.localeCompare(b.name));
  const totalsByMonth = new Array(12).fill(0);
  for (const row of grid) {
    row.months.forEach((value, index) => {
      totalsByMonth[index] += value;
    });
  }

  return { year, categories: grid, totalsByMonth };
}
