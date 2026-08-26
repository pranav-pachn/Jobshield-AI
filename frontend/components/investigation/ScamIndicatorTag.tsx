"use client";

import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScamIndicatorTagProps {
  label: string;
  type?: "registration-fee" | "training-fee" | "telegram" | "earnings-promise" | "urgency" | "unknown";
  onRemove?: () => void;
  count?: number;
}

const tagTypeStyles = {
  "registration-fee": {
    bg: "bg-red-500/20 hover:bg-red-500/30",
    text: "text-red-400",
    border: "border-red-500/40",
  },
  "training-fee": {
    bg: "bg-orange-500/20 hover:bg-orange-500/30",
    text: "text-orange-400",
    border: "border-orange-500/40",
  },
  telegram: {
    bg: "bg-cyan-500/20 hover:bg-cyan-500/30",
    text: "text-cyan-400",
    border: "border-cyan-500/40",
  },
  "earnings-promise": {
    bg: "bg-yellow-500/20 hover:bg-yellow-500/30",
    text: "text-yellow-400",
    border: "border-yellow-500/40",
  },
  urgency: {
    bg: "bg-purple-500/20 hover:bg-purple-500/30",
    text: "text-purple-400",
    border: "border-purple-500/40",
  },
  unknown: {
    bg: "bg-gray-500/20 hover:bg-gray-500/30",
    text: "text-gray-400",
    border: "border-gray-500/40",
  },
};

export function ScamIndicatorTag({ label, type = "unknown", onRemove, count }: ScamIndicatorTagProps) {
  const style = tagTypeStyles[type];

  return (
    <Badge
      className={cn(
        "flex items-center gap-2 border px-3 py-2 transition-colors cursor-default",
        style.bg,
        style.text,
        style.border,
        "font-medium text-sm"
      )}
    >
      <span>{label}</span>
      {count && <span className="text-xs opacity-75">({count})</span>}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}
