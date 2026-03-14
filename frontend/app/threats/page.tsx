import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThreatMap } from "@/components/ThreatMap";
import { ScamIndicatorChips } from "@/components/ScamIndicatorChips";
import { 
  Network, 
  AlertTriangle, 
  Shield, 
  Clock, 
  TrendingUp,
  Eye,
  Activity,
  Zap,
  Target
} from "lucide-react";

const threatCampaigns = [
  {
    id: 1,
    name: "Remote Data Entry Scheme",
    severity: "critical",
    affectedJobs: 234,
    domains: ["consultant-mail.net", "fastjobs-remote.xyz"],
    firstSeen: "Mar 10, 2026",
    status: "active",
  },
  {
    id: 2,
    name: "Fake Tech Startup Recruitment",
    severity: "high",
    affectedJobs: 156,
    domains: ["startup-careers.io", "tech-recruit-pro.net"],
    firstSeen: "Mar 8, 2026",
    status: "active",
  },
  {
    id: 3,
    name: "Crypto Investment Position Scam",
    severity: "high",
    affectedJobs: 89,
    domains: ["crypto-jobs-global.com"],
    firstSeen: "Mar 5, 2026",
    status: "monitoring",
  },
  {
    id: 4,
    name: "Reshipping Mule Recruitment",
    severity: "medium",
    affectedJobs: 67,
    domains: ["logistics-hiring.net"],
    firstSeen: "Mar 1, 2026",
    status: "contained",
  },
];

const recentThreats = [
  { time: "2 min ago", type: "New Domain", detail: "urgentwork-now.xyz added to watchlist" },
  { time: "15 min ago", type: "Pattern Match", detail: "Registration fee scam template detected" },
  { time: "32 min ago", type: "Campaign Update", detail: "Remote Data Entry Scheme expanded" },
  { time: "1 hour ago", type: "Report Filed", detail: "47 new user reports processed" },
  { time: "2 hours ago", type: "Domain Blocked", detail: "fasttrack-jobs.co flagged as malicious" },
];

const severityConfig = {
  critical: { bg: "bg-risk-high", border: "border-risk-high/30", text: "text-risk-high" },
  high: { bg: "bg-risk-high/80", border: "border-risk-high/30", text: "text-risk-high" },
  medium: { bg: "bg-risk-medium", border: "border-risk-medium/30", text: "text-risk-medium" },
  low: { bg: "bg-risk-low", border: "border-risk-low/30", text: "text-risk-low" },
};

export default function ThreatsPage() {
  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Network className="h-3.5 w-3.5" />
            Threat Intelligence
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Threat Intelligence Center
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Monitor active scam campaigns, track emerging threats, and analyze patterns across the job scam landscape.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card glass-card glass-card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                  <p className="text-3xl font-bold text-risk-high mt-1">12</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-risk-high" />
                    <span className="text-risk-high">+3</span>
                    <span>this week</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-risk-high/10">
                  <Target className="h-6 w-6 text-risk-high" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card glass-card glass-card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Flagged Domains</p>
                  <p className="text-3xl font-bold text-risk-medium mt-1">89</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-risk-low" />
                    <span className="text-risk-low">-12%</span>
                    <span>vs last week</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-risk-medium/10">
                  <AlertTriangle className="h-6 w-6 text-risk-medium" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card glass-card glass-card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Threats Contained</p>
                  <p className="text-3xl font-bold text-risk-low mt-1">156</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3 text-risk-low" />
                    <span className="text-risk-low">+24</span>
                    <span>this month</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-risk-low/10">
                  <Shield className="h-6 w-6 text-risk-low" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card glass-card glass-card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Detection Rate</p>
                  <p className="text-3xl font-bold text-primary mt-1">94.2%</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3 text-primary" />
                    <span className="text-primary">+2.1%</span>
                    <span>improvement</span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Threat Map */}
        <ThreatMap />

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr]">
          {/* Active Campaigns */}
          <Card className="border-border bg-card glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Target className="h-5 w-5" />
                Active Threat Campaigns
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Coordinated scam operations currently being tracked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threatCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`p-4 rounded-lg border ${severityConfig[campaign.severity as keyof typeof severityConfig].border} bg-accent/30 hover:bg-accent/50 transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{campaign.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              campaign.status === "active" ? "border-risk-high/30 bg-risk-high/10 text-risk-high" :
                              campaign.status === "monitoring" ? "border-risk-medium/30 bg-risk-medium/10 text-risk-medium" :
                              "border-risk-low/30 bg-risk-low/10 text-risk-low"
                            }`}
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {campaign.domains.map((domain) => (
                            <span
                              key={domain}
                              className="text-xs px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20"
                            >
                              {domain}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={`${severityConfig[campaign.severity as keyof typeof severityConfig].bg} text-white`}
                        >
                          {campaign.severity}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2">{campaign.affectedJobs} affected jobs</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">First seen: {campaign.firstSeen}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="border-border bg-card glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5" />
                Live Activity Feed
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Real-time threat intelligence updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentThreats.map((threat, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      <span className="relative flex h-2 w-2">
                        {index === 0 && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${
                          index === 0 ? "bg-primary" : "bg-muted-foreground/50"
                        }`} />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {threat.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{threat.time}</span>
                      </div>
                      <p className="text-sm text-foreground mt-1 truncate">{threat.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scam Indicator Intelligence */}
        <ScamIndicatorChips />
      </div>
    </AppShell>
  );
}
