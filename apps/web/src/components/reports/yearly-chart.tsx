"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatAmount } from "@/lib/shared";
import { CATEGORICAL_LIGHT, CHART_AXIS_LINE_COLOR, CHART_AXIS_TEXT_COLOR, CHART_GRID_COLOR } from "@/lib/chart-colors";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function YearlyChart({ totalsByMonth, currency }: { totalsByMonth: number[]; currency: string }) {
  const data = totalsByMonth.map((total, index) => ({ label: MONTH_LABELS[index], total }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART_GRID_COLOR} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: CHART_AXIS_LINE_COLOR }}
          tick={{ fontSize: 10, fill: CHART_AXIS_TEXT_COLOR }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={44}
        />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: CHART_AXIS_TEXT_COLOR }} width={40} />
        <Tooltip formatter={(value: number) => formatAmount(value, currency)} contentStyle={{ borderRadius: 8, borderColor: CHART_GRID_COLOR, fontSize: 12 }} />
        <Bar dataKey="total" name="Expenses" fill={CATEGORICAL_LIGHT[0]} radius={[4, 4, 0, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
