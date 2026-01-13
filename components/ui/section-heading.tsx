import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
  variant?: "default" | "light"; // default = for dark bg (white text), light = for light bg (black text)
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  children,
  variant = "default",
}: SectionHeadingProps) {
  const isLight = variant === "light";

  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" && "text-center max-w-3xl mx-auto",
        align === "left" && "text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
            isLight ? "bg-black text-white" : "bg-white text-black"
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      <div className="space-y-3">
        <h2
          className={cn(
            "text-3xl font-semibold tracking-tight sm:text-4xl",
            isLight ? "text-black" : "text-white"
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              "text-base sm:text-lg",
              isLight ? "text-black/70" : "text-white"
            )}
          >
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}