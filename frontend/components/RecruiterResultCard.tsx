"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/RiskBadge";
import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  Mail,
  BarChart3,
  Network,
  Clock,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RecruiterResultCardProps {
  email?: string;
  domain?: string;
  riskScore: number;
  riskLevel: "High" | "Medium" | "Low";
  isVerified: boolean;
  relatedScams: number;
  lastSeen?: string;
  indicators: string[];
}

export function RecruiterResultCard({
  email,
  domain,
  riskScore,
  riskLevel,
  isVerified,
  relatedScams,
  lastSeen,
  indicators,
}: RecruiterResultCardProps) {
  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card className="glass-card border-border overflow-hidden">
        <CardHeader className="border-b border-border/50 pb-4 pt-6 bg-card/40">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              Recruiter Assessment
            </CardTitle>
            <RiskBadge level={riskLevel} size="md" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Contact Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            {email && (
              <div className="rounded-lg border border-border/30 bg-card/40 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Email Address
                    </p>
                    <p className="mt-1 font-mono text-sm text-foreground break-all">{email}</p>
                  </div>
                </div>
              </div>
            )}

            {domain && (
              <div className="rounded-lg border border-border/30 bg-card/40 p-4">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Domain
                    </p>
                    <p className="mt-1 font-mono text-sm text-foreground break-all">{domain}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Risk Score */}
          <div className="rounded-xl border border-border bg-black/40 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Risk Score
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className={cn(
                      "text-4xl font-mono font-bold tracking-tight",
                      riskLevel === "High"
                        ? "text-destructive"
                        : riskLevel === "Medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                    )}
                  >
                    {riskScore}%
                  </span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    threat level
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-2">
                  {isVerified ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-500">Verified Domain</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <span className="text-sm font-medium text-destructive">Not Verified</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-border/50">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    riskLevel === "High"
                      ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                      : riskLevel === "Medium"
                        ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"
                        : "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                  )}
                  style={{ width: `${riskScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border/30 bg-card/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Related Scams
                </p>
              </div>
              <p className="text-2xl font-bold text-foreground">{relatedScams}</p>
              <p className="text-xs text-muted-foreground mt-1">reports found</p>
            </div>

            <div className="rounded-lg border border-border/30 bg-card/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Threat Indicators
                </p>
              </div>
              <p className="text-2xl font-bold text-foreground">{indicators.length}</p>
              <p className="text-xs text-muted-foreground mt-1">detected</p>
            </div>

            <div className="rounded-lg border border-border/30 bg-card/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Last Seen
                </p>
              </div>
              <p className="text-2xl font-bold text-foreground">{lastSeen || "Unknown"}</p>
              <p className="text-xs text-muted-foreground mt-1">activity date</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threat Indicators */}
      {indicators.length > 0 && (
        <Card className="glass-card border-border">
          <CardHeader className="border-b border-border/50 pb-4 pt-6 bg-card/40">
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Threat Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {indicators.map((indicator, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border/30 bg-card/40 p-3 hover:bg-card/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-foreground/90">{indicator}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendation */}
      <Card className="glass-card border-border bg-gradient-to-br from-card/60 to-card/30">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div
              className={cn(
                "h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center",
                riskLevel === "High"
                  ? "bg-destructive/20"
                  : riskLevel === "Medium"
                    ? "bg-yellow-500/20"
                    : "bg-green-500/20"
              )}
            >
              {riskLevel === "High" ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : riskLevel === "Medium" ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {riskLevel === "High"
                  ? "High Risk - Proceed with Caution"
                  : riskLevel === "Medium"
                    ? "Medium Risk - Verify Additional Information"
                    : "Low Risk - Likely Legitimate"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {riskLevel === "High"
                  ? "This recruiter shows significant markers associated with fraud. We recommend not engaging."
                  : riskLevel === "Medium"
                    ? "Some concerning indicators detected. Verify independently before proceeding."
                    : "This recruiter appears legitimate based on available data. Exercise normal caution."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
