import type { PrismaClient } from "@prisma/client";
import type { DashboardQueryInput } from "../../shared/index.js";
import { monthRange, previousMonth } from "../../lib/dates.js";
import { computeAccountBalance } from "../accounts/accounts.service.js";
import { Decimal } from "../../lib/decimal.js";

async function monthTotals(prisma: PrismaClient, userId: string, year: number, month: number) {
  const { start, end } = monthRange(year, month);
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
  ]);
  const incomeTotal = income._sum.amount ?? new Decimal(0);
  const expenseTotal = expense._sum.amount ?? new Decimal(0);
  return { income: incomeTotal, expense: expenseTotal, net: incomeTotal.minus(expenseTotal) };
}

async function categoryBreakdown(prisma: PrismaClient, userId: string, year: number, month: number) {
  const { start, end } = monthRange(year, month);
  const transactions = await prisma.transaction.findMany({
    where: { userId, type: "EXPENSE", date: { gte: start, lt: end } },
    select: { amount: true, category: { select: { id: true, name: true, parentId: true } } },
  });

  const parentIds = [...new Set(transactions.map((t) => t.category?.parentId).filter((id): id is string => !!id))];
  const parents = parentIds.length
    ? await prisma.category.findMany({ where: { id: { in: parentIds } }, select: { id: true, name: true } })
    : [];
  const parentNameById = new Map(parents.map((p) => [p.id, p.name]));

  const totals = new Map<string, { categoryId: string; name: string; total: Decimal }>();
  for (const tx of transactions) {
    if (!tx.category) continue;
    const rollupId = tx.category.parentId ?? tx.category.id;
    const rollupName = tx.category.parentId ? parentNameById.get(tx.category.parentId) ?? tx.category.name : tx.category.name;
    const existing = totals.get(rollupId);
    if (existing) {
      existing.total = existing.total.plus(tx.amount);
    } else {
      totals.set(rollupId, { categoryId: rollupId, name: rollupName, total: tx.amount });
    }
  }

  return [...totals.values()]
    .map((t) => ({ categoryId: t.categoryId, name: t.name, total: t.total.toNumber() }))
    .sort((a, b) => b.total - a.total);
}

export async function getDashboardSummary(prisma: PrismaClient, userId: string, query: DashboardQueryInput) {
  const now = new Date();
  const year = query.year ?? now.getUTCFullYear();
  const month = query.month ?? now.getUTCMonth() + 1;
  const prev = previousMonth(year, month);

  const [current, previous, breakdown, accounts] = await Promise.all([
    monthTotals(prisma, userId, year, month),
    monthTotals(prisma, userId, prev.year, prev.month),
    categoryBreakdown(prisma, userId, year, month),
    prisma.account.findMany({ where: { userId, isActive: true }, select: { id: true } }),
  ]);

  const balances = await Promise.all(accounts.map((a) => computeAccountBalance(prisma, a.id)));
  const totalBalance = balances.reduce((sum, b) => sum.plus(b), new Decimal(0));

  return {
    year,
    month,
    income: current.income.toNumber(),
    expenses: current.expense.toNumber(),
    net: current.net.toNumber(),
    savings: current.net.toNumber(),
    totalBalance: totalBalance.toNumber(),
    categoryBreakdown: breakdown,
    previousMonth: {
      year: prev.year,
      month: prev.month,
      income: previous.income.toNumber(),
      expenses: previous.expense.toNumber(),
      net: previous.net.toNumber(),
    },
  };
}
