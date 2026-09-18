"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reconcileAccountSchema, type ReconcileAccountInput } from "@/lib/shared";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useReconcileAccount } from "@/hooks/use-accounts";

interface ReconcileDialogProps {
  accountId: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ReconcileDialog({ accountId, trigger, open: openProp, onOpenChange: onOpenChangeProp }: ReconcileDialogProps) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = onOpenChangeProp ?? setOpenState;
  const mutation = useReconcileAccount(accountId);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReconcileAccountInput>({ resolver: zodResolver(reconcileAccountSchema) });

  const submit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent title="Reconcile balance">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <p className="text-sm text-neutral-500">
            Enter the actual balance from your bank or wallet. The difference will be recorded as a balance
            adjustment.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="actualBalance">Actual balance</Label>
            <Input id="actualBalance" type="number" step="0.00000001" {...register("actualBalance")} />
            {errors.actualBalance && <p className="text-xs text-red-600">{errors.actualBalance.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" {...register("note")} />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Reconcile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
