import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTransactionInput, UpdateTransactionInput, TransactionFiltersInput } from "@/lib/shared";
import { api } from "@/lib/api-client";
import type { Transaction, TransactionListResponse } from "@/lib/types";
import { toQueryString } from "@/lib/query-string";

const RECENT_PAGE_SIZE = 30;

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: ["accounts"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["reports"] });
}

export function useTransactions(filters: Partial<TransactionFiltersInput>) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => api.get<TransactionListResponse>(`/transactions${toQueryString(filters)}`),
  });
}

export function useRecentTransactions(filters: { dateFrom?: Date; dateTo?: Date } = {}) {
  return useInfiniteQuery({
    queryKey: ["transactions", "recent", filters.dateFrom?.toISOString(), filters.dateTo?.toISOString()],
    queryFn: ({ pageParam }) =>
      api.get<TransactionListResponse>(
        `/transactions${toQueryString({
          page: pageParam,
          pageSize: RECENT_PAGE_SIZE,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        })}`
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => api.get<Transaction>(`/transactions/${id}`),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) => api.post<Transaction>("/transactions", input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateTransaction(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTransactionInput) => api.patch<Transaction>(`/transactions/${id}`, input),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDuplicateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Transaction>(`/transactions/${id}/duplicate`),
    onSuccess: () => invalidateAll(queryClient),
  });
}
