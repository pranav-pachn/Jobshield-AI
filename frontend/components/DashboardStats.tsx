"use client";

import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskPieChart } from "@/components/RiskPieChart";
import { RecentAnalysesTable } from "@/components/RecentAnalysesTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, AlertTriangle, Shield, Activity, BarChart3, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";

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

// Trend data for the area chart
const trendData = [
  { date: "Mon", scams: 12, legitimate: 45 },
  { date: "Tue", scams: 19, legitimate: 52 },
  { date: "Wed", scams: 15, legitimate: 48 },
  { date: "Thu", scams: 25, legitimate: 61 },
  { date: "Fri", scams: 22, legitimate: 55 },
  { date: "Sat", scams: 8, legitimate: 32 },
  { date: "Sun", scams: 11, legitimate: 28 },
];

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
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="h-5 w-5" />
              Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Fetching threat intelligence...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5" />
            Dashboard Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Analyses</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.total_analyses}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3 text-risk-low" />
                  <span className="text-risk-low">+12%</span>
                  <span>vs last week</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Jobs</p>
                <p className="text-3xl font-bold text-risk-high mt-1">{stats.high_risk_jobs}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <ArrowDownRight className="h-3 w-3 text-risk-low" />
                  <span className="text-risk-low">-8%</span>
                  <span>vs last week</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-risk-high/10">
                <AlertTriangle className="h-6 w-6 text-risk-high" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medium Risk Jobs</p>
                <p className="text-3xl font-bold text-risk-medium mt-1">{stats.medium_risk_jobs}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3 text-risk-medium" />
                  <span className="text-risk-medium">+3%</span>
                  <span>vs last week</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-risk-medium/10">
                <AlertTriangle className="h-6 w-6 text-risk-medium" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Risk Jobs</p>
                <p className="text-3xl font-bold text-risk-low mt-1">{stats.low_risk_jobs}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3 text-risk-low" />
                  <span className="text-risk-low">+15%</span>
                  <span>vs last week</span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-risk-low/10">
                <Shield className="h-6 w-6 text-risk-low" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Pie Chart */}
        <RiskPieChart 
          data={{
            high: stats.high_risk_jobs,
            medium: stats.medium_risk_jobs,
            low: stats.low_risk_jobs
          }}
          totalAnalyses={stats.total_analyses}
        />

        {/* Trend Chart */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5" />
              Detection Trends
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Weekly scam detection activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 min-h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorScams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLegit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="scams" 
                    stroke="#ef4444" 
                    fillOpacity={1} 
                    fill="url(#colorScams)" 
                    strokeWidth={2}
                    name="Scams Detected"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="legitimate" 
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#colorLegit)" 
                    strokeWidth={2}
                    name="Legitimate Jobs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Common Scam Phrases */}
      {stats.common_scam_phrases.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="h-5 w-5" />
              Top Scam Indicators
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Most frequently detected suspicious phrases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 min-h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.common_scam_phrases} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis 
                    type="number"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="phrase" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    width={120}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#ef4444" 
                    radius={[0, 4, 4, 0]}
                    name="Occurrences"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Analyses Table */}
      <RecentAnalysesTable analyses={recent_analyses} />
    </div>
  );
}
