"use client";

import { Loader2, Plus, Wallet } from "lucide-react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAccounts, useReorderAccounts } from "@/hooks/use-accounts";
import { markDragEnded } from "@/lib/drag-guard";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { AccountCard } from "@/components/accounts/account-card";

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const reorderMutation = useReorderAccounts();
  // A short press-and-hold before a drag starts (rather than any movement),
  // so a plain tap on the card or its "..." menu still resolves as a normal
  // click - the whole card can be a drag surface without needing to block
  // pointer events on the nested Link/button by hand.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    markDragEnded();
    const { active, over } = event;
    if (!accounts || !over || active.id === over.id) return;
    const oldIndex = accounts.findIndex((a) => a.id === active.id);
    const newIndex = accounts.findIndex((a) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(accounts, oldIndex, newIndex);
    reorderMutation.mutate({ orderedIds: reordered.map((a) => a.id) });
  }

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragCancel={markDragEnded}
          >
            <SortableContext items={accounts.map((a) => a.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
