"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ active = false, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "bg-black text-white shadow-[0_15px_40px_-20px_rgba(0,0,0,0.8)]"
          : "bg-white text-black border border-black/20 hover:bg-gray-100",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

Chip.displayName = "Chip";