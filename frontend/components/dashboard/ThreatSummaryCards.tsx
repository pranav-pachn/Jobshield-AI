"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, TrendingUp, Shield } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { fetchStats } from "@/lib/dashboardApi";
import { StatsResponse } from "@/lib/dashboardTypes";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { logger } from "@/lib/logger";

export function ThreatSummaryCards() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        logger.info("ThreatSummaryCards", "Fetching threat summary statistics");
        const data = await fetchStats();
        
        // Safety check
        if (!data) {
          throw new Error("No stats data received");
        }
        
        setStats(data);
        setError(null);
        logger.info("ThreatSummaryCards", "Threat summary loaded successfully", {
          data: { statsCount: Object.keys(data).length }
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        logger.error("ThreatSummaryCards", "Failed to fetch stats", { 
          data: { error: errorMessage } 
        });
        setError("Failed to load threat summary data");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8 text-muted-foreground animate-fade-in">
        {error || "No data available"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
      <MetricCard
        title="Total Jobs Analyzed"
        value={stats.total_analyses}
        icon={BarChart3}
        colorClass="text-blue-400"
        bgClass="bg-blue-500/10 border-blue-500/20"
      />

      <MetricCard
        title="High Risk Jobs"
        value={stats.high_risk}
        icon={AlertTriangle}
        colorClass="text-red-400"
        bgClass="bg-red-500/10 border-red-500/20"
      />

      <MetricCard
        title="Medium Risk Jobs"
        value={stats.medium_risk}
        icon={TrendingUp}
        colorClass="text-yellow-400"
        bgClass="bg-yellow-500/10 border-yellow-500/20"
      />

      <MetricCard
        title="Average Scam Score"
        value={`${(stats.average_scam_score * 100).toFixed(0)}%`}
        icon={Shield}
        colorClass="text-green-400"
        bgClass="bg-green-500/10 border-green-500/20"
      />
    </div>
  );
}
