"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, MoreVertical, Pencil, ScaleIcon, Trash2 } from "lucide-react";
import { formatAmount } from "@/lib/shared";
import { resolveAccountIcon } from "@/lib/account-icons";
import { resolveAccountColor } from "@/lib/account-colors";
import { ACCOUNT_TYPE_LABELS } from "@/lib/account-type-labels";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAccount, useDeleteAccount } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { ReconcileDialog } from "@/components/accounts/reconcile-dialog";
import { TransactionListItem } from "@/components/transactions/transaction-list-item";
import type { AccountWithBalance } from "@/lib/types";

function AccountIconGlyph({ account, className }: { account: AccountWithBalance; className?: string }) {
  const Icon = resolveAccountIcon(account);
  // resolveAccountIcon only ever picks from a fixed, stateless set of lucide
  // icon components, so a different pick between renders is safe to swap in place.
  // eslint-disable-next-line react-hooks/static-components
  return <Icon className={className} />;
}

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: account, isLoading } = useAccount(params.id);
  const { data: transactions } = useTransactions({ accountId: params.id, page: 1, pageSize: 10 });
  const deleteMutation = useDeleteAccount();
  const [editOpen, setEditOpen] = useState(false);
  const [reconcileOpen, setReconcileOpen] = useState(false);

  if (isLoading || !account) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
        Loading account...
      </div>
    );
  }

  const colorHex = resolveAccountColor(account);

  async function handleDelete() {
    if (!confirm(`Delete "${account!.name}"? This will also delete its transactions. This cannot be undone.`)) return;
    await deleteMutation.mutateAsync(account!.id);
    router.push("/accounts");
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Link href="/accounts" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" />
        Back to accounts
      </Link>

      <AccountFormDialog account={account} open={editOpen} onOpenChange={setEditOpen} />
      <ReconcileDialog accountId={account.id} open={reconcileOpen} onOpenChange={setReconcileOpen} />

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-4 rounded-xl p-5 text-white" style={{ backgroundColor: colorHex }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <AccountIconGlyph account={account} className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{account.name}</p>
                <p className="text-xs leading-tight text-white/70">{ACCOUNT_TYPE_LABELS[account.type]}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-white/15 text-white hover:bg-white/25 hover:text-white"
                  aria-label="Account options"
                >
                  <MoreVertical className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
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
                  onSelect={handleDelete}
                  className="text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <p className="text-sm text-white/80">Current balance</p>
            <p className="text-3xl font-bold tabular-nums">{formatAmount(account.balance, account.currency, account.type)}</p>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">Recent transactions</h2>
          {!transactions || transactions.items.length === 0 ? (
            <p className="text-sm text-neutral-400">No transactions on this account yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {transactions.items.map((tx) => (
                <TransactionListItem key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
