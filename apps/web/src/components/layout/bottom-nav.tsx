"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:hidden"
    >
      <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-neutral-200/70 bg-white/85 p-2 shadow-lg backdrop-blur-md">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500 hover:text-neutral-700"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
