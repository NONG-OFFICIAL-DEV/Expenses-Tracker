"use client";

import { useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { TransactionFilters, type TransactionFilterState } from "@/components/transactions/transaction-filters";
import { TransactionListItem } from "@/components/transactions/transaction-list-item";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { useTransactions } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import type { TransactionType } from "@expense-tracker/shared";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilterState>({ search: "" });
  const [page, setPage] = useState(1);
  const { data: accounts } = useAccounts();

  const queryFilters = useMemo(
    () => ({
      search: filters.search || undefined,
      type: filters.type as TransactionType | undefined,
      categoryId: filters.categoryId,
      accountId: filters.accountId,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      minAmount: filters.minAmount ? Number(filters.minAmount) : undefined,
      maxAmount: filters.maxAmount ? Number(filters.maxAmount) : undefined,
      page,
      pageSize: 20,
    }),
    [filters, page]
  );

  const { data, isLoading } = useTransactions(queryFilters);
  const hasAccounts = accounts && accounts.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Transactions</h1>

      {hasAccounts && (
        <TransactionFilters
          value={filters}
          onChange={(v) => {
            setFilters(v);
            setPage(1);
          }}
        />
      )}

      {isLoading ? (
        <p className="py-12 text-center text-sm text-neutral-500">Loading transactions...</p>
      ) : !hasAccounts ? (
        <EmptyState
          icon={Receipt}
          title="Add an account first"
          description="You need at least one account before you can record a transaction."
        />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Log your first income or expense using the + button below."
          action={<TransactionFormDialog trigger={<Button>Add a transaction</Button>} />}
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {data.items.map((tx) => (
              <TransactionListItem key={tx.id} transaction={tx} />
            ))}
          </div>
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <p className="text-xs text-neutral-500">
              Page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={page * data.pageSize >= data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
