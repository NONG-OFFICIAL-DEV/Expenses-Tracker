"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTransactionSchema, type CreateTransactionInput } from "@/lib/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { ApiError } from "@/lib/api-client";
import type { Transaction } from "@/lib/types";

export type TransactionFormValues = CreateTransactionInput;

interface TransactionFormProps {
  defaultValues?: Transaction;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

function toDateInputValue(date: Date | string | undefined) {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().slice(0, 10);
}

export function TransactionForm({ defaultValues, onSubmit, submitLabel = "Save", isSubmitting }: TransactionFormProps) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: defaultValues
      ? {
          type: defaultValues.type,
          accountId: defaultValues.accountId,
          toAccountId: defaultValues.toAccountId ?? undefined,
          categoryId: defaultValues.categoryId ?? undefined,
          amount: Number(defaultValues.amount),
          date: new Date(defaultValues.date),
          merchant: defaultValues.merchant ?? undefined,
          note: defaultValues.note ?? undefined,
        }
      : {
          type: "EXPENSE",
          amount: 0,
          date: new Date(),
        },
  });

  const type = watch("type");

  const filteredCategories = useMemo(() => {
    const parentIds = new Set(categories.map((c) => c.parentId).filter(Boolean));
    return categories.filter((c) => c.kind === type && !parentIds.has(c.id));
  }, [categories, type]);

  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <>
              {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => field.onChange(t)}
                  className={`h-11 rounded-lg border px-3 text-sm font-medium transition-colors ${
                    field.value === t
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {t === "EXPENSE" ? "Expense" : t === "INCOME" ? "Income" : "Transfer"}
                </button>
              ))}
            </>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" step="0.01" min="0" {...register("amount")} />
        {errors.amount && <p className="text-xs text-red-600">{errors.amount.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Account</Label>
        <Controller
          control={control}
          name="accountId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.accountId && <p className="text-xs text-red-600">{errors.accountId.message}</p>}
      </div>

      {type === "TRANSFER" ? (
        <div className="flex flex-col gap-1.5">
          <Label>To account</Label>
          <Controller
            control={control}
            name="toAccountId"
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.toAccountId && <p className="text-xs text-red-600">{errors.toAccountId.message}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label>Category</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && <p className="text-xs text-red-600">{errors.categoryId.message}</p>}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          defaultValue={toDateInputValue(defaultValues?.date)}
          {...register("date")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="merchant">Merchant (optional)</Label>
        <Input id="merchant" {...register("merchant")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" {...register("note")} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
