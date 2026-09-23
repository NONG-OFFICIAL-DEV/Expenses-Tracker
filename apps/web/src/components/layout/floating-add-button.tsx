"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";

export function FloatingAddButton() {
  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-7 z-30 sm:bottom-6 sm:right-6">
      <TransactionFormDialog
        trigger={
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        }
      />
    </div>
  );
}
