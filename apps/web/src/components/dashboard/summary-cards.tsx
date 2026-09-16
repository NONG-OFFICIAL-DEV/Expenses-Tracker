import { formatAmount } from "@/lib/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummary } from "@/lib/types";

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function Delta({ current, previous, higherIsGood }: { current: number; previous: number; higherIsGood: boolean }) {
  const change = percentChange(current, previous);
  if (change === null) return null;
  const isIncrease = change > 0;
  const isGood = isIncrease === higherIsGood;
  const color = change === 0 ? "text-neutral-400" : isGood ? "text-emerald-600" : "text-red-600";
  const sign = change > 0 ? "+" : "";
  return (
    <span className={`text-xs font-medium ${color}`}>
      {sign}
      {change.toFixed(1)}% vs last month
    </span>
  );
}

interface SummaryCardsProps {
  summary: DashboardSummary;
  currency: string;
}

export function SummaryCards({ summary, currency }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Card>
        <CardHeader>
          <CardTitle>Income</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xl font-semibold tabular-nums text-neutral-900">{formatAmount(summary.income, currency)}</p>
          <Delta current={summary.income} previous={summary.previousMonth.income} higherIsGood />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xl font-semibold tabular-nums text-neutral-900">{formatAmount(summary.expenses, currency)}</p>
          <Delta current={summary.expenses} previous={summary.previousMonth.expenses} higherIsGood={false} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Net</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xl font-semibold tabular-nums text-neutral-900">{formatAmount(summary.net, currency)}</p>
          <Delta current={summary.net} previous={summary.previousMonth.net} higherIsGood />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Savings this month</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xl font-semibold tabular-nums text-neutral-900">{formatAmount(summary.savings, currency)}</p>
        </CardContent>
      </Card>
      <Card className="col-span-2 lg:col-span-1 border-indigo-200 bg-indigo-50/40">
        <CardHeader>
          <CardTitle>Total balance</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-2xl font-bold tabular-nums text-indigo-700">{formatAmount(summary.totalBalance, currency)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
