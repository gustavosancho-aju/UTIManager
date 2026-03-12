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
    <div className={`rounded-xl p-3.5 flex flex-col gap-2 min-w-[170px] border ${
      active
        ? "bg-gradient-to-br from-red-500/5 to-red-500/[0.01] border-red-500/15"
        : "bg-gradient-to-br from-green-500/5 to-green-500/[0.01] border-green-500/15"
    }`}>
      <div className="flex items-center justify-between">
        <Icon className={`w-5 h-5 ${active ? "text-red-600" : "text-green-600"}`} />
        <StatusBadge active={active} label={active ? "Em uso" : "Removido"} />
      </div>
      <div className="font-bold text-xs text-foreground">{name}</div>
      {details && <div className="text-[11px] text-muted-foreground leading-snug">{details}</div>}
    </div>
  );
}
