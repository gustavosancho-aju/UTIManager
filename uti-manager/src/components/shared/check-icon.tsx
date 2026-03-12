import { Check, X } from "lucide-react";

interface CheckIconProps {
  value: boolean | null;
}

export function CheckIcon({ value }: CheckIconProps) {
  if (value === true) return <Check className="w-4 h-4 text-green-600" strokeWidth={3} />;
  if (value === false) return <X className="w-4 h-4 text-red-600" strokeWidth={3} />;
  return <span className="text-xs text-muted-foreground font-medium">N/A</span>;
}
