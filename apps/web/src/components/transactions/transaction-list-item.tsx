import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { formatAmount } from "@/lib/shared";
import type { Transaction } from "@/lib/types";

const TYPE_ICON = {
  INCOME: ArrowDownLeft,
  EXPENSE: ArrowUpRight,
  TRANSFER: ArrowLeftRight,
};

const TYPE_COLOR = {
  INCOME: "text-emerald-600 bg-emerald-50",
  EXPENSE: "text-red-600 bg-red-50",
  TRANSFER: "text-neutral-600 bg-neutral-100",
};

const AMOUNT_COLOR = {
  INCOME: "text-emerald-600",
  EXPENSE: "text-red-600",
  TRANSFER: "text-neutral-900",
};

export function TransactionListItem({ transaction }: { transaction: Transaction }) {
  const Icon = TYPE_ICON[transaction.type];
  const sign = transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "-" : "";
  const title =
    transaction.type === "TRANSFER"
      ? `${transaction.account.name} → ${transaction.toAccount?.name ?? "?"}`
      : transaction.merchant || transaction.category?.name || transaction.type;
  const subtitle = new Date(transaction.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/transactions/${transaction.id}`}
      className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm transition-colors hover:bg-neutral-50"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${TYPE_COLOR[transaction.type]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-500">
          {subtitle}
          {transaction.type !== "TRANSFER" && transaction.category ? ` · ${transaction.category.name}` : ""}
        </p>
      </div>
      <p className={`text-sm font-semibold tabular-nums ${AMOUNT_COLOR[transaction.type]}`}>
        {sign}
        {formatAmount(transaction.amount, transaction.account.currency, transaction.account.type)}
      </p>
    </Link>
  );
}
