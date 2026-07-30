import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "navy" | "teal" | "gold" | "success" | "warning" | "error" | "outline";
  size?: "sm" | "md" | "lg";
}

const badgeVariants = {
  default: "bg-gray-100 text-gray-700",
  navy: "bg-navy text-white",
  teal: "bg-teal text-white",
  gold: "bg-gold text-navy",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  outline: "bg-transparent border-2 border-navy text-navy",
};

const badgeSizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm",
};

function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center font-montserrat font-semibold uppercase tracking-wide rounded-full",
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
