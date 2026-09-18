"use client";

import { useState } from "react";
import { BarChart3, Loader2, Table2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useMonthlyReport } from "@/hooks/use-reports";
import { MonthlyGrid } from "@/components/reports/monthly-grid";
import { YearlyChart } from "@/components/reports/yearly-chart";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ReportsPage() {
  const { user } = useAuth();
  const { data: report, isLoading } = useMonthlyReport({ kind: "EXPENSE" });
  const { data: incomeReport } = useMonthlyReport({ kind: "INCOME" });
  const currency = user?.currency ?? "USD";

  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
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
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-1.5">
                  <Table2 className="h-4 w-4 text-neutral-400" />
                  Category breakdown
                </CardTitle>
                <div className="sm:hidden">
                  <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
                    <SelectTrigger className="h-8 w-auto gap-1 rounded-full border-0 bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200 focus:ring-0 focus:ring-offset-0">
                      <SelectValue>{MONTH_LABELS[selectedMonth]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {MONTH_LABELS.map((label, index) => (
                        <SelectItem key={label} value={String(index)}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <MonthlyGrid
                  expenseReport={report}
                  incomeReport={incomeReport}
                  selectedMonth={selectedMonth}
                  currency={currency}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
