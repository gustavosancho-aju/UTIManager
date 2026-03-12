import { cn } from "@/lib/utils";

interface GenderBadgeProps {
  gender: "M" | "F";
}

export function GenderBadge({ gender }: GenderBadgeProps) {
  const isF = gender === "F";
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border",
      isF
        ? "bg-pink-500/10 text-pink-400 border-pink-500/15"
        : "bg-blue-500/10 text-blue-400 border-blue-500/15"
    )}>
      {isF ? "F" : "M"}
    </span>
  );
}
