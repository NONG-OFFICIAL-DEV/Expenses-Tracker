"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
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
    return <p className="py-12 text-center text-sm text-neutral-500">Loading dashboard...</p>;
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Hi, {user?.name}</h1>
        <p className="text-sm text-neutral-500">Here&apos;s how your money looks this month.</p>
      </div>

      {summary && <SummaryCards summary={summary} currency={currency} />}

      <Card>
        <CardHeader>
          <CardTitle>Expenses by category</CardTitle>
        </CardHeader>
        <CardContent>{summary && <CategoryChart data={summary.categoryBreakdown} currency={currency} />}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income vs expenses</CardTitle>
        </CardHeader>
        <CardContent>{summary && <MonthComparison summary={summary} currency={currency} />}</CardContent>
      </Card>
    </div>
  );
}
