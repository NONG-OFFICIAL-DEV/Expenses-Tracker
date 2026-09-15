import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateAccountInput, UpdateAccountInput, ReconcileAccountInput } from "@expense-tracker/shared";
import { api } from "@/lib/api-client";
import type { AccountWithBalance, BalanceAdjustment } from "@/lib/types";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.get<AccountWithBalance[]>("/accounts"),
  });
}

export function useAccount(id: string | undefined) {
  return useQuery({
    queryKey: ["accounts", id],
    queryFn: () => api.get<AccountWithBalance>(`/accounts/${id}`),
    enabled: !!id,
  });
}

export function useAccountAdjustments(id: string | undefined) {
  return useQuery({
    queryKey: ["accounts", id, "adjustments"],
    queryFn: () => api.get<BalanceAdjustment[]>(`/accounts/${id}/adjustments`),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccountInput) => api.post<AccountWithBalance>("/accounts", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateAccountInput) => api.patch<AccountWithBalance>(`/accounts/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useReconcileAccount(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReconcileAccountInput) => api.post<BalanceAdjustment>(`/accounts/${id}/reconcile`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accounts", id] });
      queryClient.invalidateQueries({ queryKey: ["accounts", id, "adjustments"] });
    },
  });
}
