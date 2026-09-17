"use client";

import { BarChart3, Loader2, Table2 } from "lucide-react";
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
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <div className="no-scrollbar flex max-h-[calc(100vh-220px)] flex-col gap-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            Loading report...
          </div>
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
                <CardTitle className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-neutral-400" />
                  Total expenses by month ({report.year})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <YearlyChart totalsByMonth={report.totalsByMonth} currency={currency} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-1.5">
                  <Table2 className="h-4 w-4 text-neutral-400" />
                  Category breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyGrid report={report} currency={currency} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
