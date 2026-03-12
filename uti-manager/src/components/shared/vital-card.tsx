import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface VitalCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit: string;
  color: string;
  alert?: boolean;
}

export function VitalCard({ icon: Icon, label, value, unit, color, alert }: VitalCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-xl p-4 border relative overflow-hidden",
      alert ? "border-opacity-30 shadow-md" : "border-border shadow-sm"
    )} style={alert ? { borderColor: `${color}30`, boxShadow: `0 0 16px ${color}12` } : undefined}>
      {alert && (
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
      )}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mb-1">
        <Icon className="w-4 h-4" style={{ color }} />
        {label}
      </div>
      <div className="text-2xl font-extrabold text-foreground leading-tight">
        {value}
        <span className="text-sm font-medium text-muted-foreground ml-1">{unit}</span>
      </div>
    </div>
  );
}
