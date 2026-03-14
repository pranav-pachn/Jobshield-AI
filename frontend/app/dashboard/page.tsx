"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import { DashboardStats } from "@/components/DashboardStats";
import { MetricCard } from "@/components/MetricCard";
import { RiskPieChart } from "@/components/RiskPieChart";
import { ScamGraph } from "@/components/ScamGraph";
import { RecentAnalysesTable } from "@/components/RecentAnalysesTable";
import { ScamIndicatorsPanel } from "@/components/ScamIndicatorsPanel";
import { EnhancedTable } from "@/components/EnhancedTable";
import { RiskBadge } from "@/components/RiskBadge";
import { AuthGuard } from "@/components/AuthGuard";
import { apiFetch } from "@/lib/apiClient";

interface DashboardData {
  stats: {
    total_analyses: number;
    high_risk_jobs: number;
    medium_risk_jobs: number;
    low_risk_jobs: number;
    trends?: {
      total_change: string;
      high_change: string;
      medium_change: string;
      low_change: string;
    };
  };
  recent_analyses: DashboardAnalysis[];
  common_indicators?: Array<{
    label: string;
    type: "registration-fee" | "training-fee" | "telegram" | "earnings-promise" | "urgency" | "unknown";
    count?: number;
  }>;
}

interface DashboardAnalysis {
  id: string;
  timestamp: string;
  risk_level: string;
  scam_probability: number;
  job_text: string;
  suspicious_phrases: string[];
}

interface RecentAnalysisPayload {
  _id?: string;
  created_at?: string;
  risk_level?: string;
  scam_probability?: number;
  job_text?: string;
  suspicious_phrases?: string[];
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [statsRes, recentRes] = await Promise.all([
          apiFetch(`${backendBaseUrl}/api/jobs/stats`, {
            onUnauthorized: () => router.replace("/login"),
          }),
          apiFetch(`${backendBaseUrl}/api/jobs/recent`, {
            onUnauthorized: () => router.replace("/login"),
          }),
        ]);

        if (!statsRes.ok || !recentRes.ok) return;

        const statsPayload = await statsRes.json();
        const recentPayload = await recentRes.json();

        setDashboardData({
          stats: {
            total_analyses: statsPayload.total ?? 0,
            high_risk_jobs: statsPayload.high_risk ?? 0,
            medium_risk_jobs: statsPayload.medium_risk ?? 0,
            low_risk_jobs: statsPayload.low_risk ?? 0,
            trends: {
              total_change: "+12.5%",
              high_change: "+4.2%",
              medium_change: "-2.1%",
              low_change: "+8.4%",
            },
          },
          recent_analyses: ((recentPayload.analyses ?? []) as RecentAnalysisPayload[]).map(
            (analysis) => ({
              id: analysis._id ?? "",
              timestamp: analysis.created_at ?? "",
              risk_level: analysis.risk_level ?? "Unknown",
              scam_probability: analysis.scam_probability ?? 0,
              job_text: analysis.job_text ?? "",
              suspicious_phrases: analysis.suspicious_phrases ?? [],
            })
          ),
          common_indicators: [
            { label: "Registration Fee", type: "registration-fee", count: 42 },
            { label: "Training Fee Required", type: "training-fee", count: 38 },
            { label: "Telegram Contact", type: "telegram", count: 35 },
            { label: "$3000+ Weekly Earnings", type: "earnings-promise", count: 29 },
            { label: "Urgent Hiring", type: "urgency", count: 22 },
          ],
        });
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [backendBaseUrl, router]);

  return (
    <AuthGuard>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Cyber Threat Intelligence</h1>
          <p className="text-muted-foreground">
            Real-time AI-powered threat monitoring and scam detection analytics across the JobShield AI network.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-96 items-center justify-center rounded-xl border border-border bg-card/30">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading threat intelligence...</p>
            </div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Top Metrics Row - Enhanced Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Total Jobs Analyzed"
                value={dashboardData.stats.total_analyses}
                trend={{
                  percentage: dashboardData.stats.trends?.total_change || "+12.5%",
                  isPositive: true,
                }}
                icon={Activity}
                colorClass="text-primary"
                bgClass="bg-primary/10 border-primary/20"
              />
              <MetricCard
                title="High Risk Jobs"
                value={dashboardData.stats.high_risk_jobs}
                trend={{
                  percentage: dashboardData.stats.trends?.high_change || "+4.2%",
                  isPositive: false,
                }}
                icon={AlertTriangle}
                colorClass="text-destructive"
                bgClass="bg-destructive/10 border-destructive/20"
              />
              <MetricCard
                title="Medium Risk Jobs"
                value={dashboardData.stats.medium_risk_jobs}
                trend={{
                  percentage: dashboardData.stats.trends?.medium_change || "-2.1%",
                  isPositive: true,
                }}
                icon={AlertTriangle}
                colorClass="text-yellow-500"
                bgClass="bg-yellow-500/10 border-yellow-500/20"
              />
              <MetricCard
                title="Low Risk Jobs"
                value={dashboardData.stats.low_risk_jobs}
                trend={{
                  percentage: dashboardData.stats.trends?.low_change || "+8.4%",
                  isPositive: true,
                }}
                icon={ShieldCheck}
                colorClass="text-green-500"
                bgClass="bg-green-500/10 border-green-500/20"
              />
            </div>

            {/* Analytics Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <RiskPieChart
                data={{
                  high: dashboardData.stats.high_risk_jobs,
                  medium: dashboardData.stats.medium_risk_jobs,
                  low: dashboardData.stats.low_risk_jobs,
                }}
                totalAnalyses={dashboardData.stats.total_analyses}
              />
              <ScamGraph />
            </div>

            {/* Scam Indicators Panel */}
            {dashboardData.common_indicators && dashboardData.common_indicators.length > 0 && (
              <ScamIndicatorsPanel
                indicators={dashboardData.common_indicators}
                title="Most Common Scam Indicators Detected"
              />
            )}

            {/* Recent Analyses Section */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Live Threat Feed</h2>
                <p className="text-sm text-muted-foreground">
                  Recent job analyses showing detected threats and risk assessments
                </p>
              </div>
              
              <EnhancedTable
                data={dashboardData.recent_analyses.map((analysis, idx) => ({
                  id: analysis.id || `analysis-${idx}`,
                  timestamp: new Date(analysis.timestamp).toLocaleString(),
                  riskLevel: analysis.risk_level,
                  probability: `${Math.round(analysis.scam_probability * 100)}%`,
                  preview:
                    analysis.job_text.length > 80
                      ? `${analysis.job_text.substring(0, 80)}...`
                      : analysis.job_text,
                }))}
                columns={[
                  {
                    id: "timestamp",
                    label: "Timestamp",
                    accessor: (row) => row.timestamp,
                    sortable: true,
                  },
                  {
                    id: "riskLevel",
                    label: "Risk Level",
                    accessor: (row) => (
                      <RiskBadge
                        level={
                          row.riskLevel === "High"
                            ? "High"
                            : row.riskLevel === "Medium"
                              ? "Medium"
                              : "Low"
                        }
                        size="sm"
                      />
                    ),
                    sortable: true,
                  },
                  {
                    id: "probability",
                    label: "Scam Probability",
                    accessor: (row) => row.probability,
                    sortable: true,
                  },
                  {
                    id: "preview",
                    label: "Job Text Preview",
                    accessor: (row) => (
                      <span className="text-xs text-muted-foreground">{row.preview}</span>
                    ),
                  },
                ]}
                title="Recent Job Analyses"
                maxRows={8}
                defaultSortBy="timestamp"
                defaultSortOrder="desc"
              />
            </div>
          </>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card/30">
            <p className="text-muted-foreground">Failed to load dashboard data</p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}