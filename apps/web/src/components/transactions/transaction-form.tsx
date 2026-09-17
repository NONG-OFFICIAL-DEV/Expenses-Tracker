"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isToday } from "date-fns";
import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  Banknote,
  Bitcoin,
  CalendarIcon,
  ChevronRight,
  CreditCard,
  Landmark,
  PiggyBank,
  Plus,
  Smartphone,
  Tag,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { createTransactionSchema, type AccountType, type CreateTransactionInput } from "@/lib/shared";
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

const ACCOUNT_TYPE_ICONS: Record<AccountType, LucideIcon> = {
  BANK: Landmark,
  SAVINGS: PiggyBank,
  CASH: Wallet,
  MOBILE_WALLET: Smartphone,
  CRYPTO: Bitcoin,
  INVESTMENT: TrendingUp,
  CREDIT_CARD: CreditCard,
  OTHER: Banknote,
};

const TYPE_LABEL: Record<CreateTransactionInput["type"], string> = {
  EXPENSE: "expense",
  INCOME: "income",
  TRANSFER: "transfer",
};

const rowTriggerClass =
  "h-auto w-full items-center justify-between rounded-none border-0 border-b border-neutral-200 bg-transparent px-0 py-2 text-base font-medium text-neutral-900 focus:outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-50";

export function TransactionForm({ defaultValues, onSubmit, submitLabel, isSubmitting }: TransactionFormProps) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(() => Boolean(defaultValues?.merchant || defaultValues?.note));
  const amountRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    amountRef.current?.focus();
    amountRef.current?.select();
  }, []);

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

  const { ref: amountRegisterRef, ...amountRegisterRest } = register("amount");
  const buttonLabel = isSubmitting ? "Saving..." : (submitLabel ?? `Add ${TYPE_LABEL[type]}`);

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

      <div className="flex flex-col items-center gap-1 py-2">
        <Label htmlFor="amount" className="text-sm text-neutral-500">
          Amount
        </Label>
        <div className="flex items-center gap-1">
          <span className="text-3xl font-semibold text-neutral-400">$</span>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0"
            className="w-40 border-0 bg-transparent text-center text-4xl font-semibold text-neutral-900 outline-none placeholder:text-neutral-300 [appearance:textfield] focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            ref={(el) => {
              amountRegisterRef(el);
              amountRef.current = el;
            }}
            {...amountRegisterRest}
          />
        </div>
        {errors.amount && <p className="text-xs text-red-600">{errors.amount.message}</p>}
      </div>

      {type !== "TRANSFER" && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-medium text-neutral-500">Category</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                <SelectTrigger hideIcon className={rowTriggerClass}>
                  <span className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-neutral-400" />
                    <SelectValue placeholder="Select category" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
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

      <div className="flex flex-col gap-1">
        <Label className="text-xs font-medium text-neutral-500">{type === "TRANSFER" ? "From account" : "Account"}</Label>
        <Controller
          control={control}
          name="accountId"
          render={({ field }) => {
            const selected = accounts.find((a) => a.id === field.value);
            const Icon = selected ? ACCOUNT_TYPE_ICONS[selected.type] : Wallet;
            return (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger hideIcon className={rowTriggerClass}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-neutral-400" />
                    <SelectValue placeholder="Select account" />
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }}
        />
        {errors.accountId && <p className="text-xs text-red-600">{errors.accountId.message}</p>}
      </div>

      {type === "TRANSFER" && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-medium text-neutral-500">To account</Label>
          <Controller
            control={control}
            name="toAccountId"
            render={({ field }) => {
              const selected = accounts.find((a) => a.id === field.value);
              const Icon = selected ? ACCOUNT_TYPE_ICONS[selected.type] : Wallet;
              return (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger hideIcon className={rowTriggerClass}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-neutral-400" />
                      <SelectValue placeholder="Select destination account" />
                    </span>
                    <ChevronRight className="h-4 w-4 text-neutral-300" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          />
          {errors.toAccountId && <p className="text-xs text-red-600">{errors.toAccountId.message}</p>}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <Label className="text-xs font-medium text-neutral-500">Date</Label>
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className={rowTriggerClass + " flex"}>
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-neutral-400" />
                    {field.value && isToday(field.value) ? `Today · ${format(field.value, "MMM d")}` : field.value ? format(field.value, "MMM d, yyyy") : "Pick a date"}
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </button>
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

      {showDetails ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="merchant">Merchant (optional)</Label>
            <Input id="merchant" {...register("merchant")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" {...register("note")} />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="flex items-center gap-1.5 self-start text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add details
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {buttonLabel}
      </Button>
    </form>
  );
}
