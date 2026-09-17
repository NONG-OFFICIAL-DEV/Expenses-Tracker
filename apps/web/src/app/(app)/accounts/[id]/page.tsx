"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Pencil, ScaleIcon, Trash2 } from "lucide-react";
import { formatAmount } from "@/lib/shared";
import { resolveAccountIcon } from "@/lib/account-icons";
import { resolveAccountColor } from "@/lib/account-colors";
import { Button } from "@/components/ui/button";
import { useAccount, useDeleteAccount } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { ReconcileDialog } from "@/components/accounts/reconcile-dialog";
import { TransactionListItem } from "@/components/transactions/transaction-list-item";
import type { AccountWithBalance } from "@/lib/types";

function AccountIcon({ account }: { account: AccountWithBalance }) {
  const Icon = resolveAccountIcon(account);
  const colorHex = resolveAccountColor(account);
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: `${colorHex}26`, color: colorHex }}
    >
      {/* resolveAccountIcon only ever picks from a fixed, stateless set of lucide
          icon components, so a different pick between renders is safe to swap in place. */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon className="h-6 w-6" />
    </div>
  );
}

export default function AccountDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: account, isLoading } = useAccount(params.id);
  const { data: transactions } = useTransactions({ accountId: params.id, page: 1, pageSize: 10 });
  const deleteMutation = useDeleteAccount();

  if (isLoading || !account) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
        Loading account...
      </div>
    );
  }

  async function handleDelete() {
    if (!confirm(`Delete "${account!.name}"? This will also delete its transactions. This cannot be undone.`)) return;
    await deleteMutation.mutateAsync(account!.id);
    router.push("/accounts");
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/accounts" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" />
        Back to accounts
      </Link>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <AccountIcon account={account} />
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">{account.name}</h1>
            <p className="text-sm text-neutral-500">{account.type.replace("_", " ")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <AccountFormDialog
            account={account}
            trigger={
              <Button size="icon" variant="outline">
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <Button size="icon" variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6" style={{ borderColor: `${resolveAccountColor(account)}66` }}>
        <p className="text-sm font-medium text-neutral-500">Current balance</p>
        <p className="text-3xl font-bold tabular-nums text-neutral-900">{formatAmount(account.balance, account.currency, account.type)}</p>
        <div className="mt-4">
          <ReconcileDialog
            accountId={account.id}
            trigger={
              <Button variant="outline" size="sm">
                <ScaleIcon className="h-4 w-4" />
                Reconcile balance
              </Button>
            }
          />
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
  );
}
