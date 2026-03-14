"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: "High" | "Medium" | "Low";
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RiskBadge({ level, showIcon = true, size = "md" }: RiskBadgeProps) {
  const getRiskStyle = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return {
          className:
            "bg-destructive/20 text-destructive border-destructive/40 hover:bg-destructive/30",
          icon: <AlertTriangle className="h-4 w-4" />,
        };
      case "Medium":
        return {
          className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40 hover:bg-yellow-500/30",
          icon: <AlertCircle className="h-4 w-4" />,
        };
      case "Low":
        return {
          className: "bg-green-500/20 text-green-400 border-green-500/40 hover:bg-green-500/30",
          icon: <ShieldCheck className="h-4 w-4" />,
        };
      default:
        return {
          className: "bg-muted text-muted-foreground",
          icon: null,
        };
    }
  };

  const style = getRiskStyle(level);

  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-base px-4 py-2 gap-2",
  };

  return (
    <Badge
      className={cn(
        "flex items-center font-semibold tracking-wide border",
        style.className,
        sizeClasses[size]
      )}
      variant="outline"
    >
      {showIcon && style.icon}
      <span>{level} Risk</span>
    </Badge>
  );
}
