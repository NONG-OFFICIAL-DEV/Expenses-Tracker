import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { CategoryKind } from "@/lib/shared";
import type { MonthlyReport } from "@/lib/types";
import { toQueryString } from "@/lib/query-string";

export function useMonthlyReport({ year, kind = "EXPENSE" }: { year?: number; kind?: CategoryKind } = {}) {
  return useQuery({
    queryKey: ["reports", "monthly", year, kind],
    queryFn: () => api.get<MonthlyReport>(`/reports/monthly${toQueryString({ year, kind })}`),
  });
}
