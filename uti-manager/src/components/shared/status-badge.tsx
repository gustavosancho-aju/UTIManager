"use client";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  active: boolean;
  label: string;
}

export function StatusBadge({ active, label }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border",
      active
        ? "bg-red-500/10 text-red-600 border-red-500/20"
        : "bg-green-500/10 text-green-600 border-green-500/20"
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        active ? "bg-red-600 shadow-[0_0_6px_rgba(239,68,68,0.5)]" : "bg-green-600 shadow-[0_0_6px_rgba(34,197,94,0.4)]"
      )} />
      {label}
    </span>
  );
}
