"use client";

import { Shield, AlertTriangle, TrendingUp, Globe, Activity } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { ThreatMapVisualization } from "@/components/ThreatMapVisualization";
import { ScamNetworkPanel } from "@/components/ScamNetworkPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ThreatIntelligencePage() {

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
      <div className="flex w-full flex-col gap-8">
        {/* Page Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Threat Intelligence
              </h1>
              <p className="text-muted-foreground">
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
                className="glass-card hover:glass-card-accent transition-all duration-300 border border-white/10"
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${item.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${item.color}`} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {item.title}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {item.count.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Status Overview */}
        <Card className="glass-card border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
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
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">
                      {source.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {source.incidents} recent incidents
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="ml-2 bg-green-500/10 text-green-400 border-green-500/20"
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
        <Card className="glass-card border border-white/10">
          <CardHeader>
            <CardTitle>Recent Threat Detections</CardTitle>
            <CardDescription>
              Latest suspicious activities in the past 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                  className="flex items-start justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <code className="text-xs font-mono text-primary">
                        {threat.domain}
                      </code>
                      <Badge
                        variant="outline"
                        className={
                          threat.threatLevel === "Critical"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : threat.threatLevel === "High"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }
                      >
                        {threat.threatLevel}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Detected {threat.detected}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {threat.indicators.map((indicator, i) => (
                        <span
                          key={i}
                          className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20"
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
