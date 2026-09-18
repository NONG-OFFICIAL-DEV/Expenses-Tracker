"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MoreVertical, Receipt, Tag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ManageCategoriesDialog } from "@/components/categories/manage-categories-dialog";
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
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);

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
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Transaction options">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setManageCategoriesOpen(true)}>
              <Tag className="h-4 w-4" />
              Manage categories
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ManageCategoriesDialog open={manageCategoriesOpen} onOpenChange={setManageCategoriesOpen} />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          Loading transactions...
        </div>
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
        <div ref={scrollRef} className="no-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.key} className="flex flex-col gap-2">
              <p className="sticky top-0 bg-white py-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {group.label}
              </p>
              {group.items.map((tx) => (
                <TransactionListItem key={tx.id} transaction={tx} />
              ))}
            </div>
          ))}
          <div ref={sentinelRef} />
          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-neutral-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
