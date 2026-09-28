"use client";

import { useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { formatAmount } from "@/lib/shared";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { useDeleteTransaction, useDuplicateTransaction } from "@/hooks/use-transactions";
import type { Transaction } from "@/lib/types";

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

interface TransactionDetailDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailDialog({ transaction, open, onOpenChange }: TransactionDetailDialogProps) {
  const deleteMutation = useDeleteTransaction();
  const duplicateMutation = useDuplicateTransaction();
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleDelete() {
    await deleteMutation.mutateAsync(transaction.id);
    onOpenChange(false);
  }

  async function handleDuplicate() {
    await duplicateMutation.mutateAsync(transaction.id);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent title="Transaction details">
          <div className="flex flex-col gap-4">
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
                <Button size="icon" variant="outline" onClick={() => setDeleteOpen(true)}>
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
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete transaction"
        description="Delete this transaction? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
}
