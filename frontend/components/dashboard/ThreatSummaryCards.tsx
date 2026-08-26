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
      <div className="text-center py-8 text-muted-foreground">
        {error || "No data available"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Jobs Analyzed"
        value={stats.total_analyses}
        description="Total number of job postings analyzed by the AI engine"
        icon={BarChart3}
        accentColor="primary"
      />

      <MetricCard
        title="High Risk Jobs"
        value={stats.high_risk}
        description="Job postings flagged as high-risk threats with multiple scam indicators"
        icon={AlertTriangle}
        accentColor="danger"
      />

      <MetricCard
        title="Medium Risk Jobs"
        value={stats.medium_risk}
        description="Job postings with moderate risk indicators requiring review"
        icon={TrendingUp}
        accentColor="warning"
      />

      <MetricCard
        title="Average Scam Score"
        value={formatScamScore(stats.average_scam_score)}
        description={getConfidenceContext(stats.total_analyses)}
        icon={Shield}
        accentColor="success"
      />
    </div>
  );
}
