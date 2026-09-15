import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Category } from "@/lib/types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<Category[]>("/categories"),
  });
}
