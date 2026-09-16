"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatAmount } from "@/lib/shared";
import { INCOME_COLOR, EXPENSE_COLOR } from "@/lib/chart-colors";
import type { DashboardSummary } from "@/lib/types";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface MonthComparisonProps {
  summary: DashboardSummary;
  currency: string;
}

export function MonthComparison({ summary, currency }: MonthComparisonProps) {
  const data = [
    {
      label: MONTH_NAMES[summary.previousMonth.month - 1],
      income: summary.previousMonth.income,
      expenses: summary.previousMonth.expenses,
    },
    {
      label: MONTH_NAMES[summary.month - 1],
      income: summary.income,
      expenses: summary.expenses,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#c3c2b7" }} tick={{ fontSize: 12, fill: "#898781" }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#898781" }} width={48} />
        <Tooltip formatter={(value: number) => formatAmount(value, currency)} contentStyle={{ borderRadius: 8, borderColor: "#e1e0d9", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" name="Income" fill={INCOME_COLOR.light} radius={[4, 4, 0, 0]} barSize={28} />
        <Bar dataKey="expenses" name="Expenses" fill={EXPENSE_COLOR.light} radius={[4, 4, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
