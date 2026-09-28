"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, isToday } from "date-fns";
import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpCircle,
  CalendarIcon,
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Star,
  Tag,
  Wallet,
} from "lucide-react";
import { createTransactionSchema, type CreateTransactionInput } from "@/lib/shared";
import { resolveAccountIcon } from "@/lib/account-icons";
import { resolveAccountColor } from "@/lib/account-colors";
import { ACCOUNT_TYPE_LABELS } from "@/lib/account-type-labels";
import { BadgeButton } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useCategoryUsage } from "@/hooks/use-category-usage";
import { ApiError } from "@/lib/api-client";
import type { AccountWithBalance } from "@/lib/types";
import type { Transaction } from "@/lib/types";

const QUICK_CATEGORY_LIMIT = 6;

export type TransactionFormValues = CreateTransactionInput;

interface TransactionFormProps {
  defaultValues?: Transaction;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

const TYPE_LABEL: Record<CreateTransactionInput["type"], string> = {
  EXPENSE: "expense",
  INCOME: "income",
  TRANSFER: "transfer",
};

const rowTriggerClass =
  "h-auto w-full items-center justify-between rounded-none border-0 border-b border-neutral-200 bg-transparent px-0 py-2 text-base font-medium text-neutral-900 focus:outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-50";

// Compact "switcher" pill used for picking an account right under the amount,
// instead of a full labeled row further down the form - opens a bottom sheet
// (the same Dialog primitive that already renders as a bottom sheet on mobile)
// listing every account to pick from.
function AccountSwitcher({
  accounts,
  value,
  onChange,
  placeholder,
  dialogTitle,
}: {
  accounts: AccountWithBalance[];
  value?: string;
  onChange: (id: string) => void;
  placeholder: string;
  dialogTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = accounts.find((a) => a.id === value);
  const Icon = selected ? resolveAccountIcon(selected) : Wallet;
  const iconColor = selected ? resolveAccountColor(selected) : undefined;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
      >
        {/* resolveAccountIcon only ever picks from a fixed, stateless set of lucide
            icon components, so a different pick between renders is safe to swap in place. */}
        {/* eslint-disable-next-line react-hooks/static-components */}
        <Icon className="h-3.5 w-3.5" style={iconColor ? { color: iconColor } : undefined} />
        <span className="max-w-[7rem] truncate">{selected ? selected.name : placeholder}</span>
        <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={dialogTitle}>
          <div className="flex flex-col gap-2 mb-6">
            {accounts.map((account) => {
              const OptionIcon = resolveAccountIcon(account);
              const optionColor = resolveAccountColor(account);
              const isSelected = value === account.id;
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => {
                    onChange(account.id);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-neutral-50 ${
                    isSelected ? "border-indigo-200 bg-indigo-50" : "border-neutral-200 bg-white"
                  }`}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${optionColor}26`, color: optionColor }}
                  >
                    <OptionIcon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 overflow-hidden">
                    <span className="flex items-center gap-1 truncate text-sm font-medium text-neutral-900">
                      {account.name}
                      {account.isPrimary && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />}
                    </span>
                    <span className="block text-xs text-neutral-500">{ACCOUNT_TYPE_LABELS[account.type]}</span>
                  </span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function TransactionForm({ defaultValues, onSubmit, submitLabel, isSubmitting }: TransactionFormProps) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();
  const { recordUse, getTopCategoryIds } = useCategoryUsage();
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(() => Boolean(defaultValues?.merchant || defaultValues?.note));
  const amountRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const didDefaultAccount = useRef(false);
  useEffect(() => {
    // Only for a brand-new transaction (editing already has its own account),
    // and only once - accounts load in asynchronously after the form's own
    // defaultValues are already set, so this fills the gap once they arrive.
    if (defaultValues || didDefaultAccount.current || accounts.length === 0) return;
    const primary = accounts.find((a) => a.isPrimary) ?? accounts[0];
    if (primary) {
      setValue("accountId", primary.id);
      didDefaultAccount.current = true;
    }
  }, [accounts, defaultValues, setValue]);

  const filteredCategories = useMemo(() => {
    const parentIds = new Set(categories.map((c) => c.parentId).filter(Boolean));
    // Inactive categories are hidden from new picks, but an existing transaction that already
    // used one keeps showing it so editing doesn't silently blank out its category.
    return categories.filter(
      (c) => c.kind === type && !parentIds.has(c.id) && (c.isActive || c.id === defaultValues?.categoryId)
    );
  }, [categories, type, defaultValues?.categoryId]);

  const quickCategories = useMemo(() => {
    const topIds = getTopCategoryIds(
      filteredCategories.map((c) => c.id),
      QUICK_CATEGORY_LIMIT
    );
    const ids = topIds.length > 0 ? topIds : filteredCategories.slice(0, QUICK_CATEGORY_LIMIT).map((c) => c.id);
    return ids.map((id) => filteredCategories.find((c) => c.id === id)!).filter(Boolean);
  }, [filteredCategories, getTopCategoryIds]);

  const submit = handleSubmit(async (values) => {
    setError(null);
    try {
      await onSubmit(values);
      if (values.categoryId) recordUse(values.categoryId);
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

      <div className="flex flex-col items-center gap-1">
        {type === "TRANSFER" ? (
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="accountId"
              render={({ field }) => (
                <AccountSwitcher
                  accounts={accounts}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="From account"
                  dialogTitle="From account"
                />
              )}
            />
            <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300" />
            <Controller
              control={control}
              name="toAccountId"
              render={({ field }) => (
                <AccountSwitcher
                  accounts={accounts}
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  placeholder="To account"
                  dialogTitle="To account"
                />
              )}
            />
          </div>
        ) : (
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <AccountSwitcher
                accounts={accounts}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select account"
                dialogTitle="Select account"
              />
            )}
          />
        )}
        {errors.accountId && <p className="text-xs text-red-600">{errors.accountId.message}</p>}
        {errors.toAccountId && <p className="text-xs text-red-600">{errors.toAccountId.message}</p>}
      </div>

      {type !== "TRANSFER" && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs font-medium text-neutral-500">Category</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <>
                {quickCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {quickCategories.map((category) => (
                      <BadgeButton
                        key={category.id}
                        variant={field.value === category.id ? "default" : "secondary"}
                        onClick={() => field.onChange(category.id)}
                      >
                        {category.name}
                      </BadgeButton>
                    ))}
                  </div>
                )}
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
              </>
            )}
          />
          {errors.categoryId && <p className="text-xs text-red-600">{errors.categoryId.message}</p>}
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
                  captionLayout="dropdown"
                  startMonth={new Date(new Date().getFullYear() - 10, 0)}
                  endMonth={new Date(new Date().getFullYear(), 11)}
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
