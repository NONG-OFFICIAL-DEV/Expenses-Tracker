"use client";

import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAccounts } from "@/hooks/use-accounts";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { AccountCard } from "@/components/accounts/account-card";

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();

  return (
    <div className="flex flex-col gap-4">
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
        <p className="py-12 text-center text-sm text-neutral-500">Loading accounts...</p>
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
        <div className="grid gap-3 sm:grid-cols-2">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}
