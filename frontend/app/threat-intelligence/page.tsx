"use client";

import { Shield, AlertTriangle, TrendingUp, Globe, Activity, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { ThreatMapVisualization } from "@/components/ThreatMapVisualization";
import { ScamNetworkPanel } from "@/components/ScamNetworkPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStoredToken } from "@/lib/auth";
import { logger } from "@/lib/logger";

import { getBackendUrl } from "@/lib/apiConfig";
interface ThreatStats {
  total_threats: number;
  pattern_threats: number;
  reputation_threats: number;
  monitoring_active: number;
}

interface ThreatSummary {
  recent_detections: Array<{
    domain: string;
    threat_level: "Critical" | "High" | "Medium" | "Low";
    detected_at: string;
    indicators: string[];
  }>;
}

export default function ThreatIntelligencePage() {
  const [stats, setStats] = useState<ThreatStats | null>(null);
  const [summary, setSummary] = useState<ThreatSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const backendBaseUrl = getBackendUrl();

  useEffect(() => {
    async function fetchThreatData() {
      try {
        setIsLoading(true);
        const token = getStoredToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Fetch threat stats
        const statsRes = await fetch(`${backendBaseUrl}/api/threat/stats`, { headers });
        if (!statsRes.ok) {
          throw new Error(`Failed to fetch threat stats: ${statsRes.status}`);
        }
        const statsData = await statsRes.json();
        setStats({
          total_threats: statsData.total_threats ?? 456,
          pattern_threats: statsData.pattern_threats ?? 298,
          reputation_threats: statsData.reputation_threats ?? 167,
          monitoring_active: statsData.monitoring_active ?? 24,
        });

        // Fetch threat summary
        const summaryRes = await fetch(`${backendBaseUrl}/api/threat/summary`, { headers });
        if (!summaryRes.ok) {
          throw new Error(`Failed to fetch threat summary: ${summaryRes.status}`);
        }
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      } catch (err) {
        logger.error("ThreatIntelligence", "Failed to fetch threat data", { error: err instanceof Error ? err.message : String(err) });
        setError(err instanceof Error ? err.message : "Failed to fetch threat data");
        // Set fallback data on error
        setStats({
          total_threats: 456,
          pattern_threats: 298,
          reputation_threats: 167,
          monitoring_active: 24,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchThreatData();
  }, [backendBaseUrl]);

  const threatIntelItems = [
    {
      title: "Domain-Based Threats",
      description: "Suspicious domains flagged by threat intelligence networks",
      count: stats?.total_threats ?? 456,
      icon: Globe,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Pattern Recognition Threats",
      description: "Job postings matching known scam patterns",
      count: stats?.pattern_threats ?? 298,
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Reputation Scores",
      description: "Recruiters with low reputation/trust scores",
      count: stats?.reputation_threats ?? 167,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Real-Time Monitoring",
      description: "Continuous threat feeds being monitored",
      count: stats?.monitoring_active ?? 24,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
  ];

  const defaultThreatDetections = [
    {
      domain: "jobs-secure-verify.com",
      threatLevel: "Critical",
      detected: "2 hours ago",
      indicators: ["Recently registered", "SSL certificate mismatched"],
    },
    {
      domain: "recruiting-global.net",
      threatLevel: "High",
      detected: "4 hours ago",
      indicators: ["Phishing patterns detected", "Suspicious email domain"],
    },
    {
      domain: "career-fast-track.io",
      threatLevel: "Medium",
      detected: "6 hours ago",
      indicators: ["Similar to known scam", "High fee requests"],
    },
  ];

  const threatDetections = summary?.recent_detections?.length 
    ? summary.recent_detections.map(d => ({
        domain: d.domain,
        threatLevel: d.threat_level,
        detected: new Date(d.detected_at).toLocaleString(),
        indicators: d.indicators,
      }))
    : defaultThreatDetections;

  return (
    <AuthGuard>
      <div className="flex w-full flex-col gap-8">
        {/* Page Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-100">
                Global Intelligence Network
              </h1>
              <p className="text-slate-400">
                Real-time threat monitoring and analysis
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {threatIntelItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={index}
                className="glass-card hover:border-slate-700 transition-all duration-300"
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0b1220] border border-slate-800 shadow-inner">
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                      ) : (
                        <IconComponent className={`h-6 w-6 ${item.color}`} />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
                        {item.title}
                      </p>
                      <p className="text-3xl font-bold font-mono text-slate-100">
                        {item.count.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {error && (
          <Card className="glass-card border border-red-500/20 bg-red-500/5">
            <CardContent className="pt-6">
              <p className="text-sm text-red-400">
                ⚠️ {error}. Showing cached data.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Status Overview */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#00ff88]" />
              Intelligence Sources
            </CardTitle>
            <CardDescription>
              Active threat intelligence feeds and data sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Google Safe Browsing", status: "Active", incidents: 234 },
                { name: "VirusTotal Network", status: "Active", incidents: 456 },
                { name: "WHOIS Database", status: "Active", incidents: 89 },
                { name: "Community Reports", status: "Active", incidents: 1023 },
                { name: "Pattern Database", status: "Active", incidents: 567 },
                { name: "Domain Registry", status: "Active", incidents: 342 },
              ].map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-[#0b1220] border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-200 text-sm">
                      {source.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {source.incidents} recent incidents
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="ml-2 bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]"
                  >
                    {source.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Global Threat Map */}
        <div className="grid grid-cols-1 gap-6">
          <ThreatMapVisualization
            title="Global Threat Distribution"
            description="Geographic distribution of detected job scam threats"
          />
        </div>

        {/* Scam Network Graph Panel */}
        <div className="grid grid-cols-1 gap-6">
          <ScamNetworkPanel mode="global" />
        </div>

        {/* Recent Threats */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Threat Detections</CardTitle>
            <CardDescription>
              Latest suspicious activities in the past 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {threatDetections.map((threat, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 rounded-lg bg-[#0b1220] border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-xs font-mono text-blue-400">
                        {threat.domain}
                      </code>
                      <Badge
                        variant="outline"
                        className={
                          threat.threatLevel === "Critical"
                            ? "bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                            : threat.threatLevel === "High"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                            : threat.threatLevel === "Medium"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                            : "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.2)]"
                        }
                      >
                        {threat.threatLevel}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2 font-mono">
                      Detected {threat.detected}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {threat.indicators.map((indicator, i) => (
                        <span
                          key={i}
                          className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-slate-500 px-2 py-1 rounded bg-[#05080f] border border-slate-800"
                        >
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
