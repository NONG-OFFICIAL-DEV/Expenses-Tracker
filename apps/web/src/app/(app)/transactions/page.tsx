"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { TransactionListItem } from "@/components/transactions/transaction-list-item";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { useRecentTransactions } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { groupTransactionsByDate } from "@/lib/group-by-date";

export default function TransactionsPage() {
  const { data: accounts } = useAccounts();
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRecentTransactions();

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const groups = useMemo(() => groupTransactionsByDate(items), [items]);
  const hasAccounts = accounts && accounts.length > 0;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    }, { root, rootMargin: "200px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Transactions</h1>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-neutral-500">Loading transactions...</p>
      ) : !hasAccounts ? (
        <EmptyState
          icon={Receipt}
          title="Add an account first"
          description="You need at least one account before you can record a transaction."
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Log your first income or expense using the + button below."
          action={<TransactionFormDialog trigger={<Button>Add a transaction</Button>} />}
        />
      ) : (
        <div ref={scrollRef} className="flex max-h-[calc(100vh-220px)] flex-col gap-4 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-2">
              <p className="sticky top-0 bg-neutral-50 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {group.label}
              </p>
              {group.items.map((tx) => (
                <TransactionListItem key={tx.id} transaction={tx} />
              ))}
            </div>
          ))}
          <div ref={sentinelRef} />
          {isFetchingNextPage && (
            <p className="py-2 text-center text-xs text-neutral-400">Loading more...</p>
          )}
        </div>
      )}
    </div>
  );
}
