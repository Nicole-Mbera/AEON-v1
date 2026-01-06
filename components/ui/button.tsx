import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "outline";

type Size = "default" | "sm" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const baseStyles =
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black focus-visible:ring-offset-white";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-black text-white shadow-[0_18px_45px_-20px_rgba(0,0,0,0.8)] hover:scale-[1.02]",
  secondary:
    "bg-black text-white border border-black/20 hover:bg-gray-900 shadow-[0_15px_35px_-18px_rgba(0,0,0,0.2)] hover:scale-[1.02]",
  ghost:
    "bg-black text-white border border-white/30 hover:border-white/60 hover:bg-black/80",
  destructive:
    "bg-red-600 text-white shadow-md hover:bg-red-700 hover:scale-[1.02]",
  outline:
    "bg-transparent border border-gray-200 text-black hover:bg-gray-50",
};

const sizeStyles: Record<Size, string> = {
  default: "px-6 py-3",
  sm: "px-4 py-2 text-xs",
  lg: "px-8 py-4 text-base",
  icon: "h-9 w-9 p-0",
};

export const buttonVariants = ({ variant = "primary", size = "default" }: { variant?: Variant, size?: Size }) =>
  cn(baseStyles, variantStyles[variant], sizeStyles[size]);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  ),
);

Button.displayName = "Button";