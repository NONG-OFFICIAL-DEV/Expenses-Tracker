"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatAmount } from "@/lib/shared";
import { CATEGORICAL_LIGHT } from "@/lib/chart-colors";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function YearlyChart({ totalsByMonth, currency }: { totalsByMonth: number[]; currency: string }) {
  const data = totalsByMonth.map((total, index) => ({ label: MONTH_LABELS[index], total }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "#c3c2b7" }} tick={{ fontSize: 12, fill: "#898781" }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#898781" }} width={48} />
        <Tooltip formatter={(value: number) => formatAmount(value, currency)} contentStyle={{ borderRadius: 8, borderColor: "#e1e0d9", fontSize: 12 }} />
        <Bar dataKey="total" name="Expenses" fill={CATEGORICAL_LIGHT[0]} radius={[4, 4, 0, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
