"use client";

import Link from "next/link";
import { Loader2, PieChart, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth-context";
import { useAccounts } from "@/hooks/use-accounts";
import { useDashboardSummary } from "@/hooks/use-dashboard";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { MonthComparison } from "@/components/dashboard/month-comparison";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const currency = user?.currency ?? "USD";

  if (accountsLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
        Loading dashboard...
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Welcome to your expense tracker"
        description="Add your first account to start tracking income, expenses, and your overall balance."
        action={
          <Button asChild>
            <Link href="/accounts">Add an account</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Hi, {user?.name}</h1>
        <p className="text-sm text-neutral-500">Here&apos;s how your money looks this month.</p>
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
        {summary && <SummaryCards summary={summary} currency={currency} />}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-neutral-400" />
              Expenses by category
            </CardTitle>
          </CardHeader>
          <CardContent>{summary && <CategoryChart data={summary.categoryBreakdown} currency={currency} />}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-neutral-400" />
              Income vs expenses
            </CardTitle>
          </CardHeader>
          <CardContent>{summary && <MonthComparison summary={summary} currency={currency} />}</CardContent>
        </Card>
      </div>
    </div>
  );
}
