import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <input
          type={type}
          className={cn(
            "w-full rounded-2xl border border-black/20 bg-white px-4 py-3 text-sm text-black shadow-[0_12px_40px_-28px_rgba(0,0,0,0.2)] transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/80",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-red-600">{error}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";