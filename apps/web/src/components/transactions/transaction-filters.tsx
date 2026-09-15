"use client";

import { Search } from "lucide-react";
import { TRANSACTION_TYPES } from "@expense-tracker/shared";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";

export interface TransactionFilterState {
  search: string;
  type?: string;
  categoryId?: string;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
}

interface TransactionFiltersProps {
  value: TransactionFilterState;
  onChange: (value: TransactionFilterState) => void;
}

const ALL = "__all__";

export function TransactionFilters({ value, onChange }: TransactionFiltersProps) {
  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategories();

  function set<K extends keyof TransactionFilterState>(key: K, v: TransactionFilterState[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Search merchant or note"
          className="pl-9"
          value={value.search}
          onChange={(e) => set("search", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Select value={value.type ?? ALL} onValueChange={(v) => set("type", v === ALL ? undefined : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {TRANSACTION_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={value.accountId ?? ALL} onValueChange={(v) => set("accountId", v === ALL ? undefined : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={value.categoryId ?? ALL} onValueChange={(v) => set("categoryId", v === ALL ? undefined : v)}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories
              .filter((c) => c.parentId !== null)
              .map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          <Input type="number" placeholder="Min $" value={value.minAmount ?? ""} onChange={(e) => set("minAmount", e.target.value)} />
          <Input type="number" placeholder="Max $" value={value.maxAmount ?? ""} onChange={(e) => set("maxAmount", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input type="date" value={value.dateFrom ?? ""} onChange={(e) => set("dateFrom", e.target.value)} />
        <Input type="date" value={value.dateTo ?? ""} onChange={(e) => set("dateTo", e.target.value)} />
      </div>
    </div>
  );
}
