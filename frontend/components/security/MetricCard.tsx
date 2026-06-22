import { ReactNode } from "react";
import { ThreatCard } from "./ThreatCard";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: "primary" | "danger" | "warning" | "success" | "none";
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  accentColor = "none",
  className,
}: MetricCardProps) {
  const iconColors = {
    none: "text-slate-400 bg-slate-800/50",
    primary: "text-blue-400 bg-blue-500/10",
    danger: "text-red-400 bg-red-500/10",
    warning: "text-yellow-400 bg-yellow-500/10",
    success: "text-[#00ff88] bg-[#00ff88]/10",
  };

  return (
    <ThreatCard accentColor={accentColor} className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg", iconColors[accentColor])}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
          </div>
          
          <div>
            <p className="text-3xl font-bold font-mono text-slate-100">{value}</p>
            {description && (
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            )}
          </div>
        </div>

        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.isPositive
                ? "text-[#00ff88] bg-[#00ff88]/10"
                : "text-red-400 bg-red-500/10"
            )}
          >
            {trend.isPositive ? "↑" : "↓"}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </ThreatCard>
  );
}
