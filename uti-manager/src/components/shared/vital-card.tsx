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
      "glass-card rounded-xl p-4 relative overflow-hidden transition-all duration-300",
      alert && "pulse-alert"
    )} style={alert ? { borderColor: `${color}25` } : undefined}>
      {alert && (
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      )}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold mb-1.5">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        {label}
      </div>
      <div className="font-display text-2xl font-extrabold text-foreground leading-tight">
        {value}
        <span className="text-xs font-medium text-muted-foreground ml-1">{unit}</span>
      </div>
    </div>
  );
}
