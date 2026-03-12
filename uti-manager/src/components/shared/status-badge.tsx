"use client";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  active: boolean;
  label: string;
}

export function StatusBadge({ active, label }: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors",
      active
        ? "bg-red-500/10 text-red-400 border-red-500/20"
        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        active ? "bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.4)]" : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
      )} />
      {label}
    </span>
  );
}
