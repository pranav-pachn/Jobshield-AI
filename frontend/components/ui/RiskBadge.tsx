"use client";

import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE" | "INFO" | "High" | "Medium" | "Low";
  showIcon?: boolean;
  className?: string;
}

export function RiskBadge({ level, showIcon = true, className }: RiskBadgeProps) {
  const normalizedLevel = level.toUpperCase() as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE" | "INFO";
  
  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case "CRITICAL": return "badge-critical";
      case "HIGH": return "badge-high";
      case "MEDIUM": return "badge-medium";
      case "LOW": return "badge-low";
      case "SAFE": return "badge-safe";
      default: return "badge-info";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "CRITICAL": return <AlertTriangle className="h-3 w-3" />;
      case "HIGH": return <AlertTriangle className="h-3 w-3" />;
      case "MEDIUM": return <AlertCircle className="h-3 w-3" />;
      case "LOW": return <ShieldCheck className="h-3 w-3" />;
      case "SAFE": return <ShieldCheck className="h-3 w-3" />;
      default: return null;
    }
  };

  const badgeClass = getRiskBadgeClass(normalizedLevel);
  const icon = getRiskIcon(normalizedLevel);

  return (
    <div className={cn("inline-flex items-center gap-1.5", badgeClass, className)}>
      {showIcon && icon}
      <span>{normalizedLevel}</span>
    </div>
  );
}
