"use client";

import { Loader2, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAccounts } from "@/hooks/use-accounts";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { AccountCard } from "@/components/accounts/account-card";

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <AccountFormDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add account
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          Loading accounts...
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Add a bank, cash, or crypto account to start tracking your balances and transactions."
          action={
            <AccountFormDialog
              trigger={
                <Button>
                  <Plus className="h-4 w-4" />
                  Add your first account
                </Button>
              }
            />
          }
        />
      ) : (
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
