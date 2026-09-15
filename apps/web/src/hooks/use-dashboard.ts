import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { DashboardSummary } from "@/lib/types";
import { toQueryString } from "@/lib/query-string";

export function useDashboardSummary(year?: number, month?: number) {
  return useQuery({
    queryKey: ["dashboard", "summary", year, month],
    queryFn: () => api.get<DashboardSummary>(`/dashboard/summary${toQueryString({ year, month })}`),
  });
}
