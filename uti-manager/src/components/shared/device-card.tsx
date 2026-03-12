import { StatusBadge } from "./status-badge";
import type { LucideIcon } from "lucide-react";

interface DeviceCardProps {
  icon: LucideIcon;
  name: string;
  active: boolean;
  details?: string;
}

export function DeviceCard({ icon: Icon, name, active, details }: DeviceCardProps) {
  return (
    <div className={`glass-card rounded-xl p-3.5 flex flex-col gap-2 min-w-[170px] transition-all duration-200 ${
      active ? "hover:border-red-500/20" : "hover:border-emerald-500/20"
    }`}>
      <div className="flex items-center justify-between">
        <Icon className={`w-4.5 h-4.5 ${active ? "text-red-400" : "text-emerald-400"}`} />
        <StatusBadge active={active} label={active ? "Em uso" : "Removido"} />
      </div>
      <div className="font-semibold text-xs text-foreground">{name}</div>
      {details && <div className="text-[11px] text-muted-foreground leading-snug">{details}</div>}
    </div>
  );
}
