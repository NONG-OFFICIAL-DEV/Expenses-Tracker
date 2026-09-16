"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatAmount } from "@/lib/shared";
import { CATEGORICAL_LIGHT, CHART_AXIS_TEXT_COLOR, CHART_GRID_COLOR, CHART_LABEL_TEXT_COLOR } from "@/lib/chart-colors";
import type { CategoryBreakdownEntry } from "@/lib/types";

interface CategoryChartProps {
  data: CategoryBreakdownEntry[];
  currency: string;
}

export function CategoryChart({ data, currency }: CategoryChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-neutral-500">No expenses recorded this month yet.</p>;
  }

  const top = data.slice(0, 8);
  const chartData = top.map((entry, index) => ({ ...entry, fill: CATEGORICAL_LIGHT[index % CATEGORICAL_LIGHT.length] }));
  const height = Math.max(chartData.length * 42, 120);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: CHART_AXIS_TEXT_COLOR }}
        />
        <Tooltip
          formatter={(value: number) => formatAmount(value, currency)}
          contentStyle={{ borderRadius: 8, borderColor: CHART_GRID_COLOR, fontSize: 12 }}
        />
        <Bar dataKey="total" radius={[4, 4, 4, 4]} barSize={20}>
          {chartData.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.fill} />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            formatter={(value: number) => formatAmount(value, currency)}
            style={{ fontSize: 12, fill: CHART_LABEL_TEXT_COLOR }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
