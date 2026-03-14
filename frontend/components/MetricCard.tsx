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
}

export function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  colorClass = "text-primary",
  bgClass = "bg-primary/10 border-primary/20",
  sparklineData = [],
}: MetricCardProps) {
  return (
    <div className="glass-card relative overflow-hidden rounded-xl border border-border p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{value}</h2>
            {trend && (
              <span
                className={cn(
                  "flex items-center text-xs font-medium gap-0.5",
                  trend.isPositive ? "text-green-400" : "text-red-400"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.percentage}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-full border", bgClass)}>
            <Icon className={cn("h-5 w-5", colorClass)} />
          </div>
        )}
      </div>

      {/* Subtle background glow */}
      <div
        className={cn(
          "absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-20 pointer-events-none",
          bgClass.split(" ")[0] // getting the bg color
        )}
      />

      {/* Optional sparkline visualization */}
      {sparklineData.length > 0 && (
        <div className="mt-4 flex h-8 items-end gap-1">
          {sparklineData.map((val, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-t bg-primary/40"
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
