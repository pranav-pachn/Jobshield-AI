"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BarChart3, TrendingUp, Shield } from "lucide-react";
import { MetricCard } from "@/components/security/MetricCard";
import { fetchStats } from "@/lib/dashboardApi";
import { StatsResponse } from "@/lib/dashboardTypes";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { logger } from "@/lib/logger";
import { formatScamScore, getConfidenceContext, isValidStatsResponse } from "@/lib/dashboardUtils";

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
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#090d16] p-6 text-center">
        <p className="text-xs text-slate-400 font-mono">
          {error ? "Unable to load summary statistics. Please refresh or check connection." : "No statistics available yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Jobs Analyzed"
        value={stats.total_analyses ?? 0}
        description="Total scans processed"
        icon={BarChart3}
        accentColor="primary"
      />

      <MetricCard
        title="High Risk Flagged"
        value={stats.high_risk ?? 0}
        description="Scam probability >= 70%"
        icon={AlertTriangle}
        accentColor="danger"
      />

      <MetricCard
        title="Medium Suspicion"
        value={stats.medium_risk ?? 0}
        description="Requires verification"
        icon={Shield}
        accentColor="warning"
      />

      <MetricCard
        title="Safe Opportunities"
        value={stats.low_risk ?? 0}
        description="Verified clean signals"
        icon={TrendingUp}
        accentColor="success"
      />
    </div>
  );
}

