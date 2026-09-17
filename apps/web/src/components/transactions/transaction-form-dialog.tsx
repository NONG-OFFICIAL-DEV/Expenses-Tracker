"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TransactionForm, type TransactionFormValues } from "./transaction-form";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import type { Transaction } from "@/lib/types";

interface TransactionFormDialogProps {
  trigger: React.ReactNode;
  transaction?: Transaction;
  onSaved?: () => void;
}

export function TransactionFormDialog({ trigger, transaction, onSaved }: TransactionFormDialogProps) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction(transaction?.id ?? "");

  const isEditing = !!transaction;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: TransactionFormValues) {
    if (isEditing) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
    setOpen(false);
    onSaved?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={isEditing ? "Edit transaction" : "Add transaction"}>
        <TransactionForm
          defaultValues={transaction}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? "Save changes" : undefined}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
