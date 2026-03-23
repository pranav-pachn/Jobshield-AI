"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, AlertTriangle, ShieldCheck, Activity, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatsData {
  total_analyses: number;
  high_risk_jobs: number;
  medium_risk_jobs: number;
  low_risk_jobs: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [justUpdated, setJustUpdated] = useState(false);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${backendBaseUrl}/api/jobs/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const payload = await res.json();
      
      setStats({
        total_analyses: payload.total ?? 0,
        high_risk_jobs: payload.high_risk ?? 0,
        medium_risk_jobs: payload.medium_risk ?? 0,
        low_risk_jobs: payload.low_risk ?? 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [backendBaseUrl]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Listen for real-time updates
  useEffect(() => {
    const handleRealTimeUpdate = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      if (type === 'new_analysis') {
        // Increment total analyses counter
        setStats(prev => prev ? {
          ...prev,
          total_analyses: prev.total_analyses + 1
        } : null);
        
        // Show animation
        setJustUpdated(true);
        setTimeout(() => setJustUpdated(false), 2000);
        
        // Refresh stats after a short delay
        setTimeout(fetchStats, 1000);
      } else if (type === 'stats_update') {
        fetchStats();
      }
    };

    // Add event listener
    window.addEventListener('realtime-update', handleRealTimeUpdate as EventListener);
    
    return () => {
      window.removeEventListener('realtime-update', handleRealTimeUpdate as EventListener);
    };
  }, [fetchStats]);

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card flex h-32 items-center justify-center rounded-xl">
            <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Jobs Analyzed",
      value: stats.total_analyses,
      trend: "+12.5%",
      trendUp: true,
      icon: Activity,
      colorClass: "text-primary",
      bgClass: "bg-primary/10 border-primary/20",
      animate: justUpdated,
    },
    {
      title: "High Risk Jobs",
      value: stats.high_risk_jobs,
      trend: "+4.2%",
      trendUp: true,
      icon: AlertTriangle,
      colorClass: "text-destructive",
      bgClass: "bg-destructive/10 border-destructive/20",
    },
    {
      title: "Medium Risk Jobs",
      value: stats.medium_risk_jobs,
      trend: "-2.1%",
      trendUp: false,
      icon: AlertTriangle,
      colorClass: "text-yellow-500",
      bgClass: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      title: "Low Risk Jobs",
      value: stats.low_risk_jobs,
      trend: "+8.4%",
      trendUp: true,
      icon: ShieldCheck,
      colorClass: "text-green-500",
      bgClass: "bg-green-500/10 border-green-500/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div 
            key={idx} 
            className={cn(
              "glass-card relative overflow-hidden rounded-xl p-6 transition-all duration-500",
              metric.animate && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <div className="flex items-baseline gap-2">
                  <h2 className={cn(
                    "text-3xl font-bold tracking-tight text-foreground transition-all duration-500",
                    metric.animate && "scale-110 text-primary"
                  )}>
                    {metric.value}
                  </h2>
                  <span
                    className={cn(
                      "flex items-center text-xs font-medium",
                      metric.trendUp ? "text-red-400" : "text-green-400",
                      // Reverse logic for total jobs where up is good
                      idx === 0 && (metric.trendUp ? "text-green-400" : "text-red-400"),
                      idx === 3 && (metric.trendUp ? "text-green-400" : "text-red-400")
                    )}
                  >
                    {metric.trendUp ? (
                      <ArrowUpRight className="mr-0.5 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-0.5 h-3 w-3" />
                    )}
                    {metric.trend}
                  </span>
                </div>
              </div>
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-full border", metric.bgClass)}>
                <Icon className={cn("h-5 w-5", metric.colorClass)} />
              </div>
            </div>
            
            {/* Subtle background glow */}
            <div 
              className={cn(
                "absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-20 pointer-events-none",
                metric.bgClass.split(' ')[0] // getting the bg color
              )} 
            />

            {/* Update animation indicator */}
            {metric.animate && (
              <div className="absolute top-2 right-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}