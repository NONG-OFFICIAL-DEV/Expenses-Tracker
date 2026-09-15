import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { MonthlyReport } from "@/lib/types";
import { toQueryString } from "@/lib/query-string";

export function useMonthlyReport(year?: number) {
  return useQuery({
    queryKey: ["reports", "monthly", year],
    queryFn: () => api.get<MonthlyReport>(`/reports/monthly${toQueryString({ year })}`),
  });
}
