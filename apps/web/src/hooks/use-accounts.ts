import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateAccountInput, UpdateAccountInput, ReconcileAccountInput, ReorderAccountsInput } from "@/lib/shared";
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

export function useReorderAccounts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ReorderAccountsInput) => api.patch<void>("/accounts/reorder", input),
    // Optimistic: the drag already shows the new order in the UI, so write it
    // straight into the cache instead of waiting on a round-trip + refetch,
    // which would otherwise show a flash back to the old order mid-drag-end.
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["accounts"] });
      const previous = queryClient.getQueryData<AccountWithBalance[]>(["accounts"]);
      if (previous) {
        const byId = new Map(previous.map((a) => [a.id, a]));
        const reordered = input.orderedIds.map((id) => byId.get(id)).filter((a): a is AccountWithBalance => Boolean(a));
        queryClient.setQueryData(["accounts"], reordered);
      }
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(["accounts"], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
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
