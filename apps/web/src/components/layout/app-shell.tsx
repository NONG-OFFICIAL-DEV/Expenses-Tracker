"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { FloatingAddButton } from "./floating-add-button";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-sm text-neutral-500">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
        Loading...
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-5xl min-w-0 overflow-x-hidden px-4 py-6 pb-24 sm:px-6 sm:pb-6 lg:px-8">{children}</main>
      </div>
      <BottomNav />
      <FloatingAddButton />
    </div>
  );
}
