import type { PrismaClient } from "@prisma/client";
import type { CreateAccountInput, UpdateAccountInput, ReconcileAccountInput } from "../../shared/index.js";
import { Decimal } from "../../lib/decimal.js";

export class NotFoundError extends Error {}

export async function computeAccountBalance(
  prisma: PrismaClient,
  accountId: string,
  excludeTransactionId?: string
): Promise<Decimal> {
  const account = await prisma.account.findUniqueOrThrow({ where: { id: accountId } });
  const notExcluded = excludeTransactionId ? { id: { not: excludeTransactionId } } : {};

  const [income, expense, transfersIn, transfersOut, adjustments] = await Promise.all([
    prisma.transaction.aggregate({ where: { accountId, type: "INCOME", ...notExcluded }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { accountId, type: "EXPENSE", ...notExcluded }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { toAccountId: accountId, type: "TRANSFER", ...notExcluded }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { accountId, type: "TRANSFER", ...notExcluded }, _sum: { amount: true } }),
    prisma.balanceAdjustment.aggregate({ where: { accountId }, _sum: { difference: true } }),
  ]);

  return account.openingBalance
    .plus(income._sum.amount ?? 0)
    .minus(expense._sum.amount ?? 0)
    .plus(transfersIn._sum.amount ?? 0)
    .minus(transfersOut._sum.amount ?? 0)
    .plus(adjustments._sum.difference ?? 0);
}

export async function listAccounts(prisma: PrismaClient, userId: string) {
  const accounts = await prisma.account.findMany({ where: { userId }, orderBy: { createdAt: "asc" } });
  return Promise.all(
    accounts.map(async (account) => ({
      ...account,
      balance: await computeAccountBalance(prisma, account.id),
    }))
  );
}

export async function getAccount(prisma: PrismaClient, userId: string, accountId: string) {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) throw new NotFoundError("Account not found");
  const balance = await computeAccountBalance(prisma, accountId);
  return { ...account, balance };
}

export function createAccount(prisma: PrismaClient, userId: string, input: CreateAccountInput) {
  return prisma.account.create({
    data: {
      userId,
      name: input.name,
      type: input.type,
      currency: input.currency,
      openingBalance: new Decimal(input.openingBalance),
    },
  });
}

export async function updateAccount(prisma: PrismaClient, userId: string, accountId: string, input: UpdateAccountInput) {
  const existing = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!existing) throw new NotFoundError("Account not found");
  return prisma.account.update({
    where: { id: accountId },
    data: {
      name: input.name,
      type: input.type,
      currency: input.currency,
      isActive: input.isActive,
      openingBalance: input.openingBalance !== undefined ? new Decimal(input.openingBalance) : undefined,
    },
  });
}

export async function deleteAccount(prisma: PrismaClient, userId: string, accountId: string) {
  const existing = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!existing) throw new NotFoundError("Account not found");
  await prisma.account.delete({ where: { id: accountId } });
}

export async function reconcileAccount(prisma: PrismaClient, userId: string, accountId: string, input: ReconcileAccountInput) {
  const existing = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!existing) throw new NotFoundError("Account not found");

  const calculatedBalance = await computeAccountBalance(prisma, accountId);
  const actualBalance = new Decimal(input.actualBalance);
  const difference = actualBalance.minus(calculatedBalance);

  return prisma.balanceAdjustment.create({
    data: {
      accountId,
      calculatedBalance,
      actualBalance,
      difference,
      note: input.note,
    },
  });
}

export function listBalanceAdjustments(prisma: PrismaClient, accountId: string) {
  return prisma.balanceAdjustment.findMany({ where: { accountId }, orderBy: { createdAt: "desc" } });
}
