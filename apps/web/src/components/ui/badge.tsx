import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600",
  {
    variants: {
      variant: {
        default: "border-transparent bg-indigo-600 text-white",
        secondary: "border-transparent bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        destructive: "border-transparent bg-red-600 text-white",
        outline: "border-neutral-300 text-neutral-700 hover:bg-neutral-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export interface BadgeButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof badgeVariants> {}

export const BadgeButton = forwardRef<HTMLButtonElement, BadgeButtonProps>(
  ({ className, variant, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(badgeVariants({ variant }), "cursor-pointer disabled:pointer-events-none disabled:opacity-50", className)}
      {...props}
    />
  )
);
BadgeButton.displayName = "BadgeButton";
