import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Scale, Wallet, type LucideIcon } from "lucide-react";
import { formatAmount } from "@/lib/shared";
import { Card } from "@/components/ui/card";
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

interface StatTileProps {
  icon: LucideIcon;
  label: string;
  amount: number;
  currency: string;
  iconClassName: string;
  delta?: { previous: number; higherIsGood: boolean };
}

function StatTile({ icon: Icon, label, amount, currency, iconClassName, delta }: StatTileProps) {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${iconClassName}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-lg font-semibold tabular-nums text-neutral-900">{formatAmount(amount, currency)}</p>
      </div>
      {delta && <Delta current={amount} previous={delta.previous} higherIsGood={delta.higherIsGood} />}
    </Card>
  );
}

interface SummaryCardsProps {
  summary: DashboardSummary;
  currency: string;
}

export function SummaryCards({ summary, currency }: SummaryCardsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 rounded-xl bg-indigo-600 p-5 text-white">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-indigo-100">Total balance</p>
          <p className="text-3xl font-bold tabular-nums">{formatAmount(summary.totalBalance, currency)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={ArrowUpCircle}
          label="Income"
          amount={summary.income}
          currency={currency}
          iconClassName="bg-emerald-100 text-emerald-600"
          delta={{ previous: summary.previousMonth.income, higherIsGood: true }}
        />
        <StatTile
          icon={ArrowDownCircle}
          label="Expenses"
          amount={summary.expenses}
          currency={currency}
          iconClassName="bg-red-100 text-red-600"
          delta={{ previous: summary.previousMonth.expenses, higherIsGood: false }}
        />
        <StatTile
          icon={Scale}
          label="Net"
          amount={summary.net}
          currency={currency}
          iconClassName="bg-indigo-100 text-indigo-600"
          delta={{ previous: summary.previousMonth.net, higherIsGood: true }}
        />
        <StatTile
          icon={PiggyBank}
          label="Savings this month"
          amount={summary.savings}
          currency={currency}
          iconClassName="bg-violet-100 text-violet-600"
        />
      </div>
    </div>
  );
}
