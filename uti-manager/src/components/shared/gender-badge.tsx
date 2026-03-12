import { cn } from "@/lib/utils";

interface GenderBadgeProps {
  gender: "M" | "F";
}

export function GenderBadge({ gender }: GenderBadgeProps) {
  const isF = gender === "F";
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border",
      isF
        ? "bg-pink-500/10 text-pink-600 border-pink-500/20"
        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
    )}>
      {isF ? "♀" : "♂"} {isF ? "Fem" : "Masc"}
    </span>
  );
}
