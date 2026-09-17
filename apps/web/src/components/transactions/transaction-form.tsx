"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, CalendarIcon } from "lucide-react";
import { createTransactionSchema, type CreateTransactionInput } from "@/lib/shared";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <Tabs value={field.value} onValueChange={field.onChange}>
            <TabsList>
              <TabsTrigger value="EXPENSE">
                <ArrowDownCircle />
                Expense
              </TabsTrigger>
              <TabsTrigger value="INCOME">
                <ArrowUpCircle />
                Income
              </TabsTrigger>
              <TabsTrigger value="TRANSFER">
                <ArrowLeftRight />
                Transfer
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      />

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
        <Label>Date</Label>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="h-4 w-4" />
                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => date && field.onChange(date)}
                  defaultMonth={field.value}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.date && <p className="text-xs text-red-600">{errors.date.message}</p>}
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
