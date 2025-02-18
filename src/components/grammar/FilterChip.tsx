"use client";

import { cn } from "@/lib/utils";

interface FilterChipProps extends React.HTMLAttributes<HTMLDivElement> {
  onRemove?: () => void;
}

export function FilterChip({
  children,
  className,
  onRemove,
  ...props
}: FilterChipProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full bg-white dark:bg-black border border-[#DADADA] dark:border-[#232323] px-4 py-2 text-sm text-muted-foreground",
        className
      )}
      {...props}
      onClick={onRemove}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}
