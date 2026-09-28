import { useState } from "react";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, ArrowLeftRight } from "lucide-react";
import { formatAmount } from "@/lib/shared";
import { TransactionDetailDialog } from "@/components/transactions/transaction-detail-dialog";
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
  const [open, setOpen] = useState(false);
  const Icon = TYPE_ICON[transaction.type];
  const sign = transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "-" : "";
  const title = transaction.type === "TRANSFER" ? null : transaction.merchant || transaction.category?.name || transaction.type;
  const subtitle = new Date(transaction.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left transition-colors hover:bg-neutral-50"
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${TYPE_COLOR[transaction.type]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 overflow-hidden">
          {transaction.type === "TRANSFER" ? (
            <p className="flex items-center gap-1 text-sm font-medium text-neutral-900">
              <span className="min-w-0 truncate">{transaction.account.name}</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-neutral-400" />
              <span className="min-w-0 truncate">{transaction.toAccount?.name ?? "?"}</span>
            </p>
          ) : (
            <p className="truncate text-sm font-medium text-neutral-900">{title}</p>
          )}
          <p className="text-xs text-neutral-500">
            {subtitle}
            {transaction.type !== "TRANSFER" && transaction.category ? ` · ${transaction.category.name}` : ""}
          </p>
        </div>
        <p className={`text-sm font-semibold tabular-nums ${AMOUNT_COLOR[transaction.type]}`}>
          {sign}
          {formatAmount(transaction.amount, transaction.account.currency, transaction.account.type)}
        </p>
      </button>

      <TransactionDetailDialog transaction={transaction} open={open} onOpenChange={setOpen} />
    </>
  );
}
