"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTelegramSafeArea } from "@/hooks/use-telegram-safe-area";
import { TelegramDebugBadge } from "@/components/telegram-debug-badge";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { FloatingAddButton } from "./floating-add-button";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  useTelegramSafeArea();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-2 text-sm text-neutral-500">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main
          className="mx-auto flex h-full w-full min-h-0 max-w-5xl min-w-0 flex-col overflow-x-hidden overflow-y-visible px-4 pb-20 sm:px-6 sm:pb-6 lg:px-8"
          style={{ paddingTop: "calc(1.5rem + max(env(safe-area-inset-top, 0px), var(--tg-header-offset, 0px)))" }}
        >
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </main>
      </div>
      <BottomNav />
      <FloatingAddButton />
      <TelegramDebugBadge />
    </div>
  );
}
