"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatAmount } from "@/lib/shared";
import { BadgeButton } from "@/components/ui/badge";
import type { MonthlyReport } from "@/lib/types";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthlyGrid({ report, currency }: { report: MonthlyReport; currency: string }) {
  const defaultMonth = report.year === new Date().getFullYear() ? new Date().getMonth() : 0;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const selectedChipRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    selectedChipRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  const monthRows = useMemo(
    () =>
      report.categories
        .map((row) => ({ categoryId: row.categoryId, name: row.name, value: row.months[selectedMonth] ?? 0 }))
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value),
    [report.categories, selectedMonth]
  );

  const monthTotal = report.totalsByMonth[selectedMonth] ?? 0;

  return (
    <div>
      {/* Mobile: pick a month, see a scannable vertical list - a 12-column table doesn't fit a phone screen */}
      <div className="sm:hidden">
        <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto pb-1">
          {MONTH_LABELS.map((label, index) => (
            <BadgeButton
              key={label}
              ref={selectedMonth === index ? selectedChipRef : undefined}
              variant={selectedMonth === index ? "default" : "secondary"}
              className="shrink-0"
              onClick={() => setSelectedMonth(index)}
            >
              {label}
            </BadgeButton>
          ))}
        </div>

        {monthRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">No expenses in {MONTH_LABELS[selectedMonth]}.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {monthRows.map((row) => (
              <div
                key={row.categoryId}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
              >
                <span className="text-sm font-medium text-neutral-900">{row.name}</span>
                <span className="text-sm font-semibold tabular-nums text-neutral-900">{formatAmount(row.value, currency)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5">
              <span className="text-sm font-semibold text-neutral-700">Total</span>
              <span className="text-sm font-semibold tabular-nums text-neutral-900">{formatAmount(monthTotal, currency)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tablet and up: full year-by-category table */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto rounded-xl border border-neutral-200">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="sticky left-0 min-w-[140px] whitespace-nowrap bg-neutral-50 px-3 py-2 text-left font-medium text-neutral-500">
                  Category
                </th>
                {MONTH_LABELS.map((m) => (
                  <th key={m} className="px-3 py-2 text-right font-medium text-neutral-500 [font-variant-numeric:tabular-nums]">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.categories.map((row) => (
                <tr key={row.categoryId} className="border-b border-neutral-100 last:border-0">
                  <td className="sticky left-0 min-w-[140px] whitespace-nowrap bg-white px-3 py-2 font-medium text-neutral-900">
                    {row.name}
                  </td>
                  {row.months.map((value, index) => (
                    <td key={index} className="px-3 py-2 text-right text-neutral-700 [font-variant-numeric:tabular-nums]">
                      {value === 0 ? "-" : formatAmount(value, currency)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-200 bg-neutral-50 font-semibold">
                <td className="sticky left-0 min-w-[140px] whitespace-nowrap bg-neutral-50 px-3 py-2">Total</td>
                {report.totalsByMonth.map((value, index) => (
                  <td key={index} className="px-3 py-2 text-right [font-variant-numeric:tabular-nums]">
                    {formatAmount(value, currency)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
