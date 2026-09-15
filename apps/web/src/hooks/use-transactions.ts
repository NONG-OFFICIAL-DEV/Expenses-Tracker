import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTransactionInput, UpdateTransactionInput, TransactionFiltersInput } from "@expense-tracker/shared";
import { api } from "@/lib/api-client";
import type { Transaction, TransactionListResponse } from "@/lib/types";
import { toQueryString } from "@/lib/query-string";

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
