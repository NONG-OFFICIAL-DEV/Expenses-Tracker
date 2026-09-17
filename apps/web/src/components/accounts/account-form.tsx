"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { createAccountSchema, ACCOUNT_TYPES, type CreateAccountInput } from "@/lib/shared";
import { ACCOUNT_ICONS, ACCOUNT_ICON_KEYS, defaultAccountIcon, resolveAccountIcon } from "@/lib/account-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACCOUNT_TYPE_LABELS } from "@/lib/account-type-labels";
import type { AccountWithBalance } from "@/lib/types";

interface AccountFormProps {
  defaultValues?: AccountWithBalance;
  onSubmit: (values: CreateAccountInput) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

const rowTriggerClass =
  "h-auto w-full items-center justify-between rounded-none border-0 border-b border-neutral-200 bg-transparent px-0 py-2 text-base font-medium text-neutral-900 focus:outline-none focus:ring-0 focus-visible:ring-0 disabled:opacity-50";

export function AccountForm({ defaultValues, onSubmit, submitLabel = "Save", isSubmitting }: AccountFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          type: defaultValues.type,
          icon: defaultValues.icon ?? undefined,
          currency: defaultValues.currency,
          openingBalance: Number(defaultValues.openingBalance),
        }
      : { type: "BANK", currency: "USD", openingBalance: 0 },
  });

  const type = watch("type");
  const submit = handleSubmit(onSubmit);

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Controller
        control={control}
        name="icon"
        render={({ field }) => {
          const PreviewIcon = resolveAccountIcon({ icon: field.value, type });
          return (
            <div className="flex flex-col items-center gap-3 py-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <PreviewIcon className="h-7 w-7" />
              </div>
              <div className="flex max-w-xs flex-wrap justify-center gap-2">
                {ACCOUNT_ICON_KEYS.map((key) => {
                  const OptionIcon = ACCOUNT_ICONS[key];
                  const isSelected = (field.value ?? defaultAccountIcon(type)) === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => field.onChange(key)}
                      aria-label={key}
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      }`}
                    >
                      <OptionIcon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Account name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs font-medium text-neutral-500">Type</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger hideIcon className={rowTriggerClass}>
                <SelectValue placeholder="Select type" />
                <ChevronRight className="h-4 w-4 text-neutral-300" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((accountType) => (
                  <SelectItem key={accountType} value={accountType}>
                    {ACCOUNT_TYPE_LABELS[accountType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Input id="currency" maxLength={3} className="uppercase" {...register("currency")} />
          {errors.currency && <p className="text-xs text-red-600">{errors.currency.message}</p>}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="openingBalance">Opening balance</Label>
          <Input id="openingBalance" type="number" step="0.00000001" {...register("openingBalance")} />
          {errors.openingBalance && <p className="text-xs text-red-600">{errors.openingBalance.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
