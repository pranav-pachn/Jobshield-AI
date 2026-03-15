"use client";

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, TrendingUp, Globe, Activity } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { ThreatMapVisualization } from "@/components/ThreatMapVisualization";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ThreatIntelligencePage() {
  const [threatMetrics, setThreatMetrics] = useState({
    totalThreatsDetected: 1234,
    criticalAlerts: 23,
    warningsToday: 156,
    globeHeartbeat: "Active",
  });

  const threatIntelItems = [
    {
      title: "Domain-Based Threats",
      description: "Suspicious domains flagged by threat intelligence networks",
      count: 456,
      icon: Globe,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      title: "Pattern Recognition Threats",
      description: "Job postings matching known scam patterns",
      count: 298,
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Reputation Scores",
      description: "Recruiters with low reputation/trust scores",
      count: 167,
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "Real-Time Monitoring",
      description: "Continuous threat feeds being monitored",
      count: 24,
      icon: Activity,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
  ];

  return (
    <AuthGuard>
      <div className="space-y-10">
        {/* Page Header */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm flex-shrink-0">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Threat Intelligence
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time cybersecurity monitoring, threat detection, and fraud analysis across the global job market
              </p>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {threatIntelItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card
                key={index}
                className="glass-card group relative overflow-hidden"
              >
                <CardContent className="pt-6">
                  <div className="space-y-4 relative z-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br border transition-all group-hover:scale-110"
                         style={{
                           backgroundImage: item.color === 'text-red-500' 
                             ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)'
                             : item.color === 'text-yellow-500'
                             ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(234, 179, 8, 0.1) 100%)'
                             : item.color === 'text-orange-500'
                             ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)'
                             : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                           borderColor: item.color === 'text-red-500' 
                             ? 'rgba(239, 68, 68, 0.3)'
                             : item.color === 'text-yellow-500'
                             ? 'rgba(234, 179, 8, 0.3)'
                             : item.color === 'text-orange-500'
                             ? 'rgba(249, 115, 22, 0.3)'
                             : 'rgba(59, 130, 246, 0.3)'
                         }}>
                      <IconComponent className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-4xl font-bold tracking-tight text-foreground font-mono">
                        {item.count.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {/* Glow effect on hover */}
                  <div className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none ${item.color}`} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Status Overview */}
        <Card className="glass-card border-blue-500/20 animate-slide-up animation-delay-2000">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-5 w-5 text-blue-400" />
              Intelligence Sources
            </CardTitle>
            <CardDescription>
              Active threat intelligence feeds and real-time data sources
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
                  className="group flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-600/30 hover:border-blue-500/40 hover:from-slate-900/70 hover:to-slate-800/50 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm group-hover:text-blue-300 transition-colors">
                      {source.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                      {source.incidents} <span className="text-blue-400">incidents</span>
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-500/15 text-green-300 border-green-500/30 font-semibold"
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

        {/* Recent Threats */}
        <Card className="glass-card border-red-500/20 animate-slide-up">
          <CardHeader className="pb-5">
            <CardTitle className="text-xl">Recent Threat Detections</CardTitle>
            <CardDescription>
              Critical and high-priority threats detected in the past 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
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
              ].map((threat, index) => (
                <div
                  key={index}
                  className="group flex items-start justify-between p-4 rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-600/30 hover:border-blue-500/40 hover:from-slate-900/70 hover:to-slate-800/50 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <code className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                        {threat.domain}
                      </code>
                      <Badge
                        variant="outline"
                        className={
                          threat.threatLevel === "Critical"
                            ? "bg-red-500/15 text-red-300 border-red-500/30 font-semibold"
                            : threat.threatLevel === "High"
                            ? "bg-orange-500/15 text-orange-300 border-orange-500/30 font-semibold"
                            : "bg-yellow-500/15 text-yellow-300 border-yellow-500/30 font-semibold"
                        }
                      >
                        {threat.threatLevel} Risk
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      <span className="text-blue-400/70">Detected:</span> {threat.detected}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {threat.indicators.map((indicator, i) => (
                        <span
                          key={i}
                          className="inline-block text-xs bg-blue-500/10 text-blue-300 px-2.5 py-1 rounded-md border border-blue-500/20 font-medium"
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
