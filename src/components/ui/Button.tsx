"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "destructive";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
const buttonVariants = {
  primary:
    "bg-teal text-white hover:bg-teal-600 focus:ring-teal shadow-sm hover:shadow-md",
  secondary:
    "bg-navy text-white hover:bg-navy-700 focus:ring-navy shadow-sm hover:shadow-md",
  outline:
    "bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white focus:ring-navy",
  ghost:
    "bg-transparent text-navy hover:bg-navy/5 focus:ring-navy",
  gold:
    "bg-gold text-navy font-bold hover:bg-gold-600 focus:ring-gold shadow-sm hover:shadow-md",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
};
const buttonSizes = {
  sm: "px-4 py-2 text-xs gap-1.5",
  md: "px-6 py-3 text-sm gap-2",
  lg: "px-8 py-4 text-base gap-2",
  xl: "px-10 py-5 text-lg gap-3",
  icon: "p-2.5",
};
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const computedClassName = cn(
      "inline-flex items-center justify-center font-montserrat font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
      buttonVariants[variant],
      buttonSizes[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
        className: cn(computedClassName, (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.className),
        ref,
      } as React.HTMLAttributes<HTMLElement>);
    }

    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={computedClassName}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";
export { Button };
