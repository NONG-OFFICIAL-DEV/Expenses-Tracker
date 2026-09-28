"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Pencil, ScaleIcon, Trash2 } from "lucide-react";
import { formatAmount } from "@/lib/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ACCOUNT_TYPE_LABELS } from "@/lib/account-type-labels";
import { resolveAccountIcon } from "@/lib/account-icons";
import { resolveAccountColor } from "@/lib/account-colors";
import { useDeleteAccount } from "@/hooks/use-accounts";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { ReconcileDialog } from "@/components/accounts/reconcile-dialog";
import type { AccountWithBalance } from "@/lib/types";

export function AccountCard({ account }: { account: AccountWithBalance }) {
  const Icon = resolveAccountIcon(account);
  const colorHex = resolveAccountColor(account);
  const [editOpen, setEditOpen] = useState(false);
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteAccount();

  return (
    <>
      <Card className="transition-colors" style={{ borderColor: `${colorHex}66` }}>
        <CardContent className="flex items-center gap-2 p-4">
          <Link href={`/accounts/${account.id}`} className="flex flex-1 items-center gap-3 overflow-hidden">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colorHex}26`, color: colorHex }}
            >
              {/* resolveAccountIcon only ever picks from a fixed, stateless set of lucide
                  icon components, so a different pick between renders is safe to swap in place. */}
              {/* eslint-disable-next-line react-hooks/static-components */}
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-medium text-neutral-900">{account.name}</p>
              <p className="text-xs text-neutral-500">{ACCOUNT_TYPE_LABELS[account.type]}</p>
            </div>
          </Link>
          <p className="text-lg font-bold tabular-nums">{formatAmount(account.balance, account.currency, account.type)}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Account options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit account
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setReconcileOpen(true)}>
                <ScaleIcon className="h-4 w-4" />
                Recalculate balance
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setDeleteOpen(true)}
                className="text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      <AccountFormDialog account={account} open={editOpen} onOpenChange={setEditOpen} />
      <ReconcileDialog accountId={account.id} open={reconcileOpen} onOpenChange={setReconcileOpen} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete account"
        description={`Delete "${account.name}"? This will also delete its transactions. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={async () => {
          await deleteMutation.mutateAsync(account.id);
        }}
      />
    </>
  );
}
