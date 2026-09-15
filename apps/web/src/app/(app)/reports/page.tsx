"use client";

import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/lib/auth-context";
import { useMonthlyReport } from "@/hooks/use-reports";
import { MonthlyGrid } from "@/components/reports/monthly-grid";
import { YearlyChart } from "@/components/reports/yearly-chart";

export default function ReportsPage() {
  const { user } = useAuth();
  const { data: report, isLoading } = useMonthlyReport();
  const currency = user?.currency ?? "USD";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-neutral-500">Loading report...</p>
      ) : !report || report.categories.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No expense data yet"
          description="Once you log some expenses, you'll see a category-by-month breakdown here."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Total expenses by month ({report.year})</CardTitle>
            </CardHeader>
            <CardContent>
              <YearlyChart totalsByMonth={report.totalsByMonth} currency={currency} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyGrid report={report} currency={currency} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
