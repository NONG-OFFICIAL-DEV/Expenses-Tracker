import type { PrismaClient, Prisma as PrismaNamespace, Account } from "@prisma/client";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFiltersInput,
} from "../../shared/index.js";
import { formatAmount } from "../../shared/index.js";
import { computeAccountBalance } from "../accounts/accounts.service.js";
import { Decimal } from "../../lib/decimal.js";

export class NotFoundError extends Error {}
export class ValidationError extends Error {}

async function assertAccountOwnership(prisma: PrismaClient, userId: string, accountId: string) {
  const account = await prisma.account.findFirst({ where: { id: accountId, userId } });
  if (!account) throw new ValidationError("Account not found");
  return account;
}

async function assertSufficientBalanceForTransfer(
  prisma: PrismaClient,
  account: Account,
  amount: Decimal,
  excludeTransactionId?: string
) {
  if (account.type === "CREDIT_CARD") return;
  const balance = await computeAccountBalance(prisma, account.id, excludeTransactionId);
  if (balance.lessThan(amount)) {
    throw new ValidationError(
      `Insufficient balance in "${account.name}" — available ${formatAmount(balance.toString(), account.currency, account.type)}`
    );
  }
}

async function assertCategoryUsable(prisma: PrismaClient, userId: string, categoryId: string, expectedKind: "INCOME" | "EXPENSE") {
  const category = await prisma.category.findFirst({ where: { id: categoryId, OR: [{ userId: null }, { userId }] } });
  if (!category) throw new ValidationError("Category not found");
  if (category.kind !== expectedKind) throw new ValidationError(`Category kind must be ${expectedKind}`);
  return category;
}

export async function createTransaction(prisma: PrismaClient, userId: string, input: CreateTransactionInput) {
  const account = await assertAccountOwnership(prisma, userId, input.accountId);

  if (input.type === "TRANSFER") {
    await assertAccountOwnership(prisma, userId, input.toAccountId!);
    await assertSufficientBalanceForTransfer(prisma, account, new Decimal(input.amount));
  } else {
    await assertCategoryUsable(prisma, userId, input.categoryId!, input.type);
  }

  return prisma.transaction.create({
    data: {
      userId,
      accountId: input.accountId,
      toAccountId: input.type === "TRANSFER" ? input.toAccountId : null,
      categoryId: input.type === "TRANSFER" ? null : input.categoryId,
      type: input.type,
      amount: new Decimal(input.amount),
      date: input.date,
      merchant: input.merchant ?? null,
      note: input.note ?? null,
    },
    include: { category: true, account: true, toAccount: true },
  });
}

export async function getTransaction(prisma: PrismaClient, userId: string, id: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
    include: { category: true, account: true, toAccount: true },
  });
  if (!transaction) throw new NotFoundError("Transaction not found");
  return transaction;
}

export async function updateTransaction(prisma: PrismaClient, userId: string, id: string, input: UpdateTransactionInput) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Transaction not found");

  const nextType = input.type ?? existing.type;
  const nextAccountId = input.accountId ?? existing.accountId;
  const nextToAccountId = input.toAccountId !== undefined ? input.toAccountId : existing.toAccountId;
  const nextCategoryId = input.categoryId !== undefined ? input.categoryId : existing.categoryId;
  const nextAmount = input.amount !== undefined ? new Decimal(input.amount) : existing.amount;

  const account = await assertAccountOwnership(prisma, userId, nextAccountId);

  if (nextType === "TRANSFER") {
    if (!nextToAccountId) throw new ValidationError("toAccountId is required for transfers");
    if (nextToAccountId === nextAccountId) throw new ValidationError("Cannot transfer to the same account");
    await assertAccountOwnership(prisma, userId, nextToAccountId);
    await assertSufficientBalanceForTransfer(prisma, account, nextAmount, existing.id);
  } else {
    if (!nextCategoryId) throw new ValidationError("categoryId is required");
    await assertCategoryUsable(prisma, userId, nextCategoryId, nextType);
  }

  return prisma.transaction.update({
    where: { id },
    data: {
      type: nextType,
      accountId: nextAccountId,
      toAccountId: nextType === "TRANSFER" ? nextToAccountId : null,
      categoryId: nextType === "TRANSFER" ? null : nextCategoryId,
      amount: input.amount !== undefined ? new Decimal(input.amount) : undefined,
      date: input.date,
      merchant: input.merchant,
      note: input.note,
    },
    include: { category: true, account: true, toAccount: true },
  });
}

export async function deleteTransaction(prisma: PrismaClient, userId: string, id: string) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Transaction not found");
  await prisma.transaction.delete({ where: { id } });
}

export async function duplicateTransaction(prisma: PrismaClient, userId: string, id: string) {
  const existing = await prisma.transaction.findFirst({ where: { id, userId } });
  if (!existing) throw new NotFoundError("Transaction not found");
  return prisma.transaction.create({
    data: {
      userId,
      accountId: existing.accountId,
      toAccountId: existing.toAccountId,
      categoryId: existing.categoryId,
      type: existing.type,
      amount: existing.amount,
      date: new Date(),
      merchant: existing.merchant,
      note: existing.note,
    },
    include: { category: true, account: true, toAccount: true },
  });
}

export async function listTransactions(prisma: PrismaClient, userId: string, filters: TransactionFiltersInput) {
  const where: PrismaNamespace.TransactionWhereInput = { userId };

  if (filters.dateFrom || filters.dateTo) {
    where.date = {};
    if (filters.dateFrom) where.date.gte = filters.dateFrom;
    // Callers (e.g. the transactions page's month filter) pass dateTo as the
    // start of the following day/month as an exclusive upper bound, not the
    // last instant to include - lte would also match that boundary instant
    // itself, leaking one extra day/month's transactions into the results.
    if (filters.dateTo) where.date.lt = filters.dateTo;
  }
  if (filters.type) where.type = filters.type;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.accountId) {
    where.OR = [{ accountId: filters.accountId }, { toAccountId: filters.accountId }];
  }
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    where.amount = {};
    if (filters.minAmount !== undefined) where.amount.gte = filters.minAmount;
    if (filters.maxAmount !== undefined) where.amount.lte = filters.maxAmount;
  }
  if (filters.search) {
    where.AND = [
      {
        OR: [
          { merchant: { contains: filters.search, mode: "insensitive" } },
          { note: { contains: filters.search, mode: "insensitive" } },
        ],
      },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true, account: true, toAccount: true },
      orderBy: { date: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total, page: filters.page, pageSize: filters.pageSize };
}

// TEMPORARY one-time data fix: transactions created before the date-timezone
// bug was patched (the calendar's local-midnight Date serialized straight to
// UTC, shifting the stored day for any non-UTC user) kept whatever shifted
// date they were saved with. This re-derives each transaction's true local
// calendar day - given the UTC-stored instant, shifting forward by the
// user's offset recovers the local wall-clock reading, whose Y/M/D is the
// day that should have been stored - and reports what would change (preview)
// or applies it (apply). Remove both this and the two routes that call it
// once the affected users have run it.
function correctedDateFor(date: Date, offsetHours: number): Date {
  const shifted = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
}

export async function previewDateBackfill(prisma: PrismaClient, userId: string, offsetHours: number) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { id: true, date: true, type: true, merchant: true, category: { select: { name: true } } },
  });

  return transactions
    .map((tx) => ({
      id: tx.id,
      label: tx.merchant || tx.category?.name || tx.type,
      oldDate: tx.date,
      newDate: correctedDateFor(tx.date, offsetHours),
    }))
    .filter((row) => row.oldDate.getTime() !== row.newDate.getTime())
    .sort((a, b) => a.oldDate.getTime() - b.oldDate.getTime());
}

export async function applyDateBackfill(prisma: PrismaClient, userId: string, offsetHours: number) {
  const rows = await previewDateBackfill(prisma, userId, offsetHours);
  await prisma.$transaction(rows.map((row) => prisma.transaction.update({ where: { id: row.id }, data: { date: row.newDate } })));
  return { updated: rows.length };
}
