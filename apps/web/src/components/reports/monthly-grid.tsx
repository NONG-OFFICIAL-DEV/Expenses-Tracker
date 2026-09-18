"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { formatAmount } from "@/lib/shared";
import { BadgeButton } from "@/components/ui/badge";
import type { MonthlyReport, MonthlyReportRow } from "@/lib/types";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface CategoryGroup {
  key: string;
  label: string;
  isGroup: boolean;
  rows: MonthlyReportRow[];
}

function groupByParent(categories: MonthlyReportRow[]): CategoryGroup[] {
  const map = new Map<string, { label: string; rows: MonthlyReportRow[] }>();
  for (const row of categories) {
    const key = row.parentId ?? row.categoryId;
    const label = row.parentId ? (row.parentName ?? row.name) : row.name;
    if (!map.has(key)) map.set(key, { label, rows: [] });
    map.get(key)!.rows.push(row);
  }
  return [...map.entries()]
    .map(([key, group]) => ({ key, label: group.label, rows: group.rows, isGroup: group.rows.some((r) => r.parentId) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function MonthlyGrid({ report, currency }: { report: MonthlyReport; currency: string }) {
  const defaultMonth = report.year === new Date().getFullYear() ? new Date().getMonth() : 0;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const selectedChipRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    selectedChipRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  const groups = useMemo(() => groupByParent(report.categories), [report.categories]);

  const monthGroups = useMemo(
    () =>
      groups
        .map((group) => {
          const rows = group.rows
            .map((row) => ({ categoryId: row.categoryId, name: row.name, value: row.months[selectedMonth] ?? 0 }))
            .filter((row) => row.value > 0);
          const total = rows.reduce((sum, row) => sum + row.value, 0);
          return { key: group.key, label: group.label, isGroup: group.isGroup, rows, total };
        })
        .filter((group) => group.total > 0)
        .sort((a, b) => b.total - a.total),
    [groups, selectedMonth]
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

        {monthGroups.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">No expenses in {MONTH_LABELS[selectedMonth]}.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {monthGroups.map((group) =>
              group.isGroup ? (
                <div key={group.key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                    <span className="text-sm font-semibold text-neutral-900">{group.label}</span>
                    <span className="text-sm font-semibold tabular-nums text-neutral-900">{formatAmount(group.total, currency)}</span>
                  </div>
                  <div className="ml-3 flex flex-col gap-1.5 border-l border-neutral-100 pl-3">
                    {group.rows.map((row) => (
                      <div
                        key={row.categoryId}
                        className="flex items-center justify-between rounded-lg border border-neutral-100 bg-white px-3 py-2"
                      >
                        <span className="text-sm text-neutral-700">{row.name}</span>
                        <span className="text-sm tabular-nums text-neutral-700">{formatAmount(row.value, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  key={group.key}
                  className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-neutral-900">{group.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-neutral-900">{formatAmount(group.total, currency)}</span>
                </div>
              )
            )}
            <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5">
              <span className="text-sm font-semibold text-neutral-700">Total</span>
              <span className="text-sm font-semibold tabular-nums text-neutral-900">{formatAmount(monthTotal, currency)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tablet and up: full year-by-category table, subcategories indented under their parent */}
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
              {groups.map((group) => {
                if (!group.isGroup) {
                  const row = group.rows[0];
                  return (
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
                  );
                }

                const groupTotals = new Array(12).fill(0);
                group.rows.forEach((row) => row.months.forEach((value, index) => (groupTotals[index] += value)));

                return (
                  <Fragment key={group.key}>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <td className="sticky left-0 min-w-[140px] whitespace-nowrap bg-neutral-50 px-3 py-2 font-semibold text-neutral-900">
                        {group.label}
                      </td>
                      {groupTotals.map((value, index) => (
                        <td
                          key={index}
                          className="px-3 py-2 text-right font-semibold text-neutral-700 [font-variant-numeric:tabular-nums]"
                        >
                          {value === 0 ? "-" : formatAmount(value, currency)}
                        </td>
                      ))}
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.categoryId} className="border-b border-neutral-100 last:border-0">
                        <td className="sticky left-0 min-w-[140px] whitespace-nowrap bg-white py-2 pl-6 pr-3 text-neutral-600">
                          {row.name}
                        </td>
                        {row.months.map((value, index) => (
                          <td key={index} className="px-3 py-2 text-right text-neutral-500 [font-variant-numeric:tabular-nums]">
                            {value === 0 ? "-" : formatAmount(value, currency)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
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
