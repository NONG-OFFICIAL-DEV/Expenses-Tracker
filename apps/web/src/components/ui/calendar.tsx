"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, getDefaultClassNames, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = DayPickerProps;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: cn(defaultClassNames.months, "relative"),
        month: cn(defaultClassNames.month, "flex flex-col gap-3"),
        nav: cn(defaultClassNames.nav, "absolute inset-x-0 top-0 z-10 flex items-center justify-between px-1"),
        button_previous: cn(
          defaultClassNames.button_previous,
          "flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-neutral-100 disabled:opacity-50"
        ),
        button_next: cn(
          defaultClassNames.button_next,
          "flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-neutral-100 disabled:opacity-50"
        ),
        month_caption: cn(defaultClassNames.month_caption, "flex h-8 items-center justify-center text-sm font-medium"),
        dropdowns: cn(defaultClassNames.dropdowns, "flex items-center gap-1"),
        dropdown_root: cn(defaultClassNames.dropdown_root, "relative inline-flex"),
        dropdown: cn(defaultClassNames.dropdown, "absolute inset-0 z-10 cursor-pointer opacity-0"),
        caption_label: cn(
          defaultClassNames.caption_label,
          "inline-flex items-center gap-0.5 rounded-md px-1.5 py-1 font-medium [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-neutral-400"
        ),
        weekdays: cn(defaultClassNames.weekdays, "flex"),
        weekday: cn(defaultClassNames.weekday, "w-9 text-xs font-normal text-neutral-500"),
        week: cn(defaultClassNames.week, "mt-1 flex w-full"),
        day: cn(defaultClassNames.day, "relative h-9 w-9 p-0 text-center text-sm [&>button]:h-9 [&>button]:w-9"),
        day_button: cn(
          defaultClassNames.day_button,
          "flex h-9 w-9 items-center justify-center rounded-md font-normal hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
        ),
        selected: cn(defaultClassNames.selected, "[&>button]:bg-indigo-600 [&>button]:text-white [&>button]:hover:bg-indigo-600"),
        today: cn(defaultClassNames.today, "[&>button]:font-semibold [&>button]:text-indigo-600"),
        outside: cn(defaultClassNames.outside, "text-neutral-400"),
        disabled: cn(defaultClassNames.disabled, "text-neutral-300 opacity-50"),
        hidden: cn(defaultClassNames.hidden, "invisible"),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClassName, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", chevronClassName)} {...chevronProps} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", chevronClassName)} {...chevronProps} />
          ),
      }}
      {...props}
    />
  );
}
