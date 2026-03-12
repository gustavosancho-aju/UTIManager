interface MiniInfoProps {
  label: string;
  value: string;
  color: string;
}

export function MiniInfo({ label, value, color }: MiniInfoProps) {
  return (
    <div className="rounded-lg p-2.5 border" style={{ background: `${color}08`, borderColor: `${color}18` }}>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color }}>{label}</div>
      <div className="text-xs text-slate-700 font-medium">{value}</div>
    </div>
  );
}
