import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const baseStyles =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black focus-visible:ring-offset-white";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-black text-white shadow-[0_18px_45px_-20px_rgba(0,0,0,0.8)] hover:scale-[1.02]",
  secondary:
    "bg-black text-white border border-black/20 hover:bg-gray-900 shadow-[0_15px_35px_-18px_rgba(0,0,0,0.2)] hover:scale-[1.02]",
  ghost:
    "bg-black text-white border border-white/30 hover:border-white/60 hover:bg-black/80",
  destructive:
    "bg-red-600 text-white shadow-md hover:bg-red-700 hover:scale-[1.02]",
};

export const buttonVariants = ({ variant = "primary" }: { variant?: Variant }) =>
  cn(baseStyles, variantStyles[variant]);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  ),
);

Button.displayName = "Button";