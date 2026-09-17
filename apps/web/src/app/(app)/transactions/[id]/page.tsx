"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Loader2, Pencil, Trash2 } from "lucide-react";
import { formatAmount } from "@/lib/shared";
import { Button } from "@/components/ui/button";
import { useTransaction, useDeleteTransaction, useDuplicateTransaction } from "@/hooks/use-transactions";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 py-3 last:border-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  );
}

const AMOUNT_COLOR: Record<string, string> = {
  INCOME: "text-emerald-600",
  EXPENSE: "text-red-600",
  TRANSFER: "text-neutral-900",
};

const AMOUNT_SIGN: Record<string, string> = {
  INCOME: "+",
  EXPENSE: "-",
  TRANSFER: "",
};

export default function TransactionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: transaction, isLoading } = useTransaction(params.id);
  const deleteMutation = useDeleteTransaction();
  const duplicateMutation = useDuplicateTransaction();

  if (isLoading || !transaction) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
        Loading transaction...
      </div>
    );
  }

  async function handleDelete() {
    if (!confirm("Delete this transaction? This cannot be undone.")) return;
    await deleteMutation.mutateAsync(transaction!.id);
    router.push("/transactions");
  }

  async function handleDuplicate() {
    const duplicate = await duplicateMutation.mutateAsync(transaction!.id);
    router.push(`/transactions/${duplicate.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/transactions" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" />
        Back to transactions
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-400">{transaction.type}</p>
          <p className={`text-3xl font-bold tabular-nums ${AMOUNT_COLOR[transaction.type]}`}>
            {AMOUNT_SIGN[transaction.type]}
            {formatAmount(transaction.amount, transaction.account.currency, transaction.account.type)}
          </p>
        </div>
        <div className="flex gap-2">
          <TransactionFormDialog
            transaction={transaction}
            trigger={
              <Button size="icon" variant="outline">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button size="icon" variant="outline" onClick={handleDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <Row label="Date" value={new Date(transaction.date).toLocaleDateString()} />
        <Row label="Account" value={transaction.account.name} />
        {transaction.type === "TRANSFER" ? (
          <Row label="To account" value={transaction.toAccount?.name ?? "-"} />
        ) : (
          <Row label="Category" value={transaction.category?.name ?? "-"} />
        )}
        {transaction.merchant && <Row label="Merchant" value={transaction.merchant} />}
        {transaction.note && <Row label="Note" value={transaction.note} />}
      </div>
    </div>
  );
}
