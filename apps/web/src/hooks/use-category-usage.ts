"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

type UsageMap = Record<string, number>;

function storageKey(userId: string) {
  return `expense-tracker:category-usage:${userId}`;
}

function readUsage(userId: string): UsageMap {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeUsage(userId: string, usage: UsageMap) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(usage));
  } catch {
    // localStorage unavailable (private browsing, storage disabled) - usage just won't persist
  }
}

/** Tracks how often each category is used per browser, to surface quick-pick chips. */
export function useCategoryUsage() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageMap>({});

  useEffect(() => {
    if (user) setUsage(readUsage(user.id));
  }, [user]);

  const recordUse = useCallback(
    (categoryId: string) => {
      if (!user) return;
      setUsage((prev) => {
        const next = { ...prev, [categoryId]: (prev[categoryId] ?? 0) + 1 };
        writeUsage(user.id, next);
        return next;
      });
    },
    [user]
  );

  const getTopCategoryIds = useCallback(
    (categoryIds: string[], limit: number) =>
      categoryIds
        .filter((id) => usage[id] > 0)
        .sort((a, b) => usage[b] - usage[a])
        .slice(0, limit),
    [usage]
  );

  return { recordUse, getTopCategoryIds };
}
