"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountingNumber } from "@/components/CountingNumber";

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  tooltip?: string;
  trend?: {
    percentage: string;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  colorClass?: string;
  bgClass?: string;
  sparklineData?: number[];
  riskLevel?: "high" | "medium" | "low" | "neutral";
}

export function MetricCard({
  title,
  value,
  subtitle,
  tooltip,
  trend,
  icon: Icon,
  colorClass = "text-primary",
  bgClass = "bg-primary/10 border-primary/20",
  sparklineData = [],
  riskLevel = "neutral",
}: MetricCardProps) {
  // Risk-based glow colors
  const getRiskGlow = () => {
    switch (riskLevel) {
      case "high":
        return {
          borderColor: "border-red-500/30",
          glowColor: "rgba(239, 68, 68, 0.3)",
          shadowColor: "rgba(239, 68, 68, 0.2)",
        };
      case "medium":
        return {
          borderColor: "border-yellow-500/30",
          glowColor: "rgba(245, 158, 11, 0.3)",
          shadowColor: "rgba(245, 158, 11, 0.2)",
        };
      case "low":
        return {
          borderColor: "border-green-500/30",
          glowColor: "rgba(34, 197, 94, 0.3)",
          shadowColor: "rgba(34, 197, 94, 0.2)",
        };
      default:
        return {
          borderColor: "border-primary/20",
          glowColor: "rgba(59, 130, 246, 0.2)",
          shadowColor: "rgba(59, 130, 246, 0.1)",
        };
    }
  };

  const riskGlow = getRiskGlow();

  return (
    <div className={`relative border rounded-xl bg-slate-800/50 backdrop-blur-sm p-6 border-slate-700/50 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="group/tooltip relative">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              {title}
            </p>
            {tooltip && (
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover/tooltip:block z-50 w-48 p-2 bg-slate-900/95 backdrop-blur-sm border border-slate-600/50 rounded-lg shadow-lg">
                <p className="text-xs text-slate-300">{tooltip}</p>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-normal">{subtitle}</p>
          )}
          <div className="flex items-baseline gap-3">
            <h2 className="text-4xl font-bold tracking-tighter text-white font-mono">
              {typeof value === 'number' ? (
                <CountingNumber target={value} duration={0} />
              ) : (
                value
              )}
            </h2>
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border",
                  trend.isPositive 
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" 
                    : "bg-red-500/15 border-red-500/30 text-red-300"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                <span>{trend.percentage}</span>
              </div>
            )}
          </div>
        </div>
        {Icon && (
          <div className={cn(
            "flex h-14 w-14 items-center justify-center rounded-xl border backdrop-blur-sm",
            bgClass
          )}>
            <Icon className={cn("h-6 w-6", colorClass)} />
          </div>
        )}
      </div>

      {/* Optional sparkline visualization */}
      {sparklineData.length > 0 && (
        <div className="relative z-10 mt-6 flex h-10 items-end gap-1 opacity-70">
          {sparklineData.map((val, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-t bg-gradient-to-t from-cyan-500 to-cyan-400"
              style={{
                height: `${(val / Math.max(...sparklineData)) * 100}%`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
