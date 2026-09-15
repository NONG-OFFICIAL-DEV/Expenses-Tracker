"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAccountSchema, ACCOUNT_TYPES, type CreateAccountInput } from "@expense-tracker/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AccountWithBalance } from "@/lib/types";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  BANK: "Bank",
  SAVINGS: "Savings",
  CASH: "Cash",
  MOBILE_WALLET: "Mobile wallet",
  CRYPTO: "Crypto",
  INVESTMENT: "Investment",
  CREDIT_CARD: "Credit card",
  OTHER: "Other",
};

interface AccountFormProps {
  defaultValues?: AccountWithBalance;
  onSubmit: (values: CreateAccountInput) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function AccountForm({ defaultValues, onSubmit, submitLabel = "Save", isSubmitting }: AccountFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          type: defaultValues.type,
          currency: defaultValues.currency,
          openingBalance: Number(defaultValues.openingBalance),
        }
      : { type: "BANK", currency: "USD", openingBalance: 0 },
  });

  const submit = handleSubmit(onSubmit);

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Account name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Type</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {ACCOUNT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currency">Currency</Label>
        <Input id="currency" maxLength={3} {...register("currency")} />
        {errors.currency && <p className="text-xs text-red-600">{errors.currency.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="openingBalance">Opening balance</Label>
        <Input id="openingBalance" type="number" step="0.00000001" {...register("openingBalance")} />
        {errors.openingBalance && <p className="text-xs text-red-600">{errors.openingBalance.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
