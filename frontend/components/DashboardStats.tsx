"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskPieChart } from "@/components/RiskPieChart";
import { RecentAnalysesTable } from "@/components/RecentAnalysesTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Shield, Activity, BarChart3, Loader2 } from "lucide-react";

interface DashboardStats {
  total_analyses: number;
  high_risk_jobs: number;
  medium_risk_jobs: number;
  low_risk_jobs: number;
  common_scam_phrases: Array<{ phrase: string; count: number }>;
}

interface RecentAnalysis {
  id: string;
  timestamp: string;
  risk_level: "High" | "Medium" | "Low";
  scam_probability: number;
  job_text?: string;
  suspicious_phrases: string[];
}

interface DashboardResponse {
  stats: DashboardStats;
  recent_analyses: RecentAnalysis[];
}

interface StatsApiResponse {
  total?: number;
  high_risk?: number;
  medium_risk?: number;
  low_risk?: number;
}

interface RecentAnalysisApiItem {
  _id?: string;
  created_at?: string;
  risk_level?: "High" | "Medium" | "Low";
  scam_probability?: number;
  job_text?: string;
  suspicious_phrases?: string[];
}

interface RecentAnalysesApiResponse {
  analyses?: RecentAnalysisApiItem[];
}

function buildCommonPhraseStats(analyses: RecentAnalysis[]): Array<{ phrase: string; count: number }> {
  const counts = new Map<string, number>();

  for (const analysis of analyses) {
    for (const phrase of analysis.suspicious_phrases ?? []) {
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([phrase, count]) => ({ phrase, count }));
}

function normalizeRecentAnalyses(payload: RecentAnalysesApiResponse): RecentAnalysis[] {
  return (payload.analyses ?? []).map((analysis, index) => ({
    id: analysis._id ?? `analysis-${index}`,
    timestamp: analysis.created_at ?? new Date(0).toISOString(),
    risk_level: analysis.risk_level ?? "Low",
    scam_probability: analysis.scam_probability ?? 0,
    job_text: analysis.job_text,
    suspicious_phrases: analysis.suspicious_phrases ?? [],
  }));
}

function normalizeStats(payload: StatsApiResponse, recentAnalyses: RecentAnalysis[]): DashboardStats {
  return {
    total_analyses: payload.total ?? 0,
    high_risk_jobs: payload.high_risk ?? 0,
    medium_risk_jobs: payload.medium_risk ?? 0,
    low_risk_jobs: payload.low_risk ?? 0,
    common_scam_phrases: buildCommonPhraseStats(recentAnalyses),
  };
}

export function DashboardStats() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch both stats and recent analyses
        const [statsResponse, recentResponse] = await Promise.all([
          fetch(`${backendBaseUrl}/api/jobs/stats`),
          fetch(`${backendBaseUrl}/api/jobs/recent`)
        ]);

        if (!statsResponse.ok || !recentResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const statsPayload: StatsApiResponse = await statsResponse.json();
        const recentPayload: RecentAnalysesApiResponse = await recentResponse.json();
        const recentAnalyses = normalizeRecentAnalyses(recentPayload);

        setDashboardData({
          stats: normalizeStats(statsPayload, recentAnalyses),
          recent_analyses: recentAnalyses
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [backendBaseUrl]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-gray-700 bg-gray-800 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-100">
              <Activity className="h-5 w-5" />
              Dashboard Stats
            </CardTitle>
            <CardDescription className="text-gray-400">
              Operational metrics for the intelligence and reporting layer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span className="text-gray-300">Loading dashboard data...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-gray-700 bg-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-100">
            <Activity className="h-5 w-5" />
            Dashboard Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
    return null;
  }
  const { stats, recent_analyses } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Card className="border-gray-700 bg-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-100">
            <Activity className="h-5 w-5" />
            Dashboard Stats
          </CardTitle>
          <CardDescription className="text-gray-400">
            Operational metrics for the intelligence and reporting layer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-600 bg-gray-700/50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                <TrendingUp className="h-4 w-4" />
                Total Analyses
              </div>
              <div className="text-2xl font-bold text-gray-100">{stats.total_analyses}</div>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-red-400 mb-2">
                <AlertTriangle className="h-4 w-4" />
                High Risk Jobs
              </div>
              <div className="text-2xl font-bold text-red-400">{stats.high_risk_jobs}</div>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-yellow-400 mb-2">
                <AlertTriangle className="h-4 w-4" />
                Medium Risk Jobs
              </div>
              <div className="text-2xl font-bold text-yellow-400">{stats.medium_risk_jobs}</div>
            </div>
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-green-400 mb-2">
                <Shield className="h-4 w-4" />
                Low Risk Jobs
              </div>
              <div className="text-2xl font-bold text-green-400">{stats.low_risk_jobs}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Pie Chart */}
        <div className="min-w-0">
          <RiskPieChart 
            data={{
              high: stats.high_risk_jobs,
              medium: stats.medium_risk_jobs,
              low: stats.low_risk_jobs
            }}
            totalAnalyses={stats.total_analyses}
          />
        </div>

        {/* Common Scam Phrases Chart */}
        {stats.common_scam_phrases.length > 0 && (
          <Card className="min-w-0 border-gray-700 bg-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-100">
                <BarChart3 className="h-5 w-5" />
                Common Scam Phrases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 min-h-64 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={256}>
                  <BarChart data={stats.common_scam_phrases}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="phrase" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Bar dataKey="count" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Analyses Table */}
      <RecentAnalysesTable analyses={recent_analyses} />
    </div>
  );
}