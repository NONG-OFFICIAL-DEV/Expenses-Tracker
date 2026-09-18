"use client";

import { useState } from "react";
import type { CreateAccountInput } from "@/lib/shared";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AccountForm } from "./account-form";
import { useCreateAccount, useUpdateAccount } from "@/hooks/use-accounts";
import type { AccountWithBalance } from "@/lib/types";

interface AccountFormDialogProps {
  trigger?: React.ReactNode;
  account?: AccountWithBalance;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AccountFormDialog({ trigger, account, open: openProp, onOpenChange: onOpenChangeProp }: AccountFormDialogProps) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChangeProp ?? setOpenState;
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount(account?.id ?? "");
  const isEditing = !!account;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(values: CreateAccountInput) {
    if (isEditing) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent title={isEditing ? "Edit account" : "Add account"}>
        <AccountForm
          defaultValues={account}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? "Save changes" : "Add account"}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
