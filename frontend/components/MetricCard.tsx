"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: {
    percentage: string;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  colorClass?: string;
  bgClass?: string;
  sparklineData?: number[];
  riskLevel?: "high" | "medium" | "low" | "neutral";
  glowEffect?: boolean;
}

export function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  colorClass = "text-primary",
  bgClass = "bg-primary/10 border-primary/20",
  sparklineData = [],
  riskLevel = "neutral",
  glowEffect = false,
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
    <div className={`metric-card group relative ${glowEffect ? 'animate-pulse-slow' : ''}`}>
      {/* Risk-based glow effect */}
      {glowEffect && (
        <div 
          className="absolute inset-0 rounded-xl opacity-60 pointer-events-none"
          style={{
            boxShadow: `0 0 20px ${riskGlow.glowColor}, inset 0 0 20px ${riskGlow.shadowColor}`,
            background: `linear-gradient(135deg, ${riskGlow.shadowColor} 0%, transparent 100%)`,
          }}
        />
      )}
      
      {/* Gradient border effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 pointer-events-none border ${riskGlow.borderColor}`}
           style={{
             background: `linear-gradient(135deg, ${riskGlow.glowColor} 0%, ${riskGlow.shadowColor} 100%)`,
           }}
      />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest letter-spacing-wide">{title}</p>
          <div className="flex items-baseline gap-3">
            <h2 className="text-4xl font-bold tracking-tighter text-foreground font-mono">{value}</h2>
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border",
                  trend.isPositive 
                    ? "bg-green-500/15 border-green-500/30 text-green-300" 
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
            "flex h-14 w-14 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300 group-hover:scale-110",
            bgClass
          )}>
            <Icon className={cn("h-6 w-6", colorClass)} />
          </div>
        )}
      </div>

      {/* Risk-based background glow that activates on hover */}
      <div
        className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
        style={{
          background: riskGlow.glowColor,
        }}
      />

      {/* Optional sparkline visualization */}
      {sparklineData.length > 0 && (
        <div className="relative z-10 mt-6 flex h-10 items-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          {sparklineData.map((val, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-t bg-gradient-to-t from-primary to-primary/40 transition-all duration-300 hover:from-primary/80"
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
