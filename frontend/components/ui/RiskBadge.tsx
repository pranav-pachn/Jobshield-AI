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
          className: "border",
          icon: <AlertTriangle className="h-4 w-4" />,
          style: { 
            backgroundColor: "rgba(255, 77, 79, 0.15)", 
            color: "#ff4d4f",
            borderColor: "rgba(255, 77, 79, 0.4)"
          },
        };
      case "Medium":
        return {
          className: "border",
          icon: <AlertCircle className="h-4 w-4" />,
          style: {
            backgroundColor: "rgba(247, 181, 0, 0.15)",
            color: "#f7b500",
            borderColor: "rgba(247, 181, 0, 0.4)"
          },
        };
      case "Low":
        return {
          className: "border",
          icon: <ShieldCheck className="h-4 w-4" />,
          style: {
            backgroundColor: "rgba(46, 204, 113, 0.15)",
            color: "#2ecc71",
            borderColor: "rgba(46, 204, 113, 0.4)"
          },
        };
      default:
        return {
          className: "bg-muted text-muted-foreground",
          icon: null,
          style: {},
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
    <div className="group/tooltip relative inline-block">
      <Badge
        className={cn(
          "flex items-center font-semibold tracking-wide",
          style.className,
          sizeClasses[size]
        )}
        style={style.style}
        variant="outline"
      >
        {showIcon && style.icon}
        <span>{level} Risk</span>
      </Badge>
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover/tooltip:block z-50 w-48 p-2 bg-card/95 backdrop-blur-sm border border-primary/30 rounded-lg shadow-lg whitespace-normal">
        <p className="text-xs text-muted-foreground text-center">
          {level === 'High' && 'High-risk jobs matching 3+ scam indicators'}
          {level === 'Medium' && 'Moderate risk requiring human review'}
          {level === 'Low' && 'Legitimate jobs with minimal red flags'}
        </p>
      </div>
    </div>
  );
}
