"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Mail,
  Globe,
  Building2,
  Link2,
  Search,
  XCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecruiterFlag {
  type: "critical" | "warning" | "info";
  message: string;
  category: "email" | "domain" | "company" | "url" | "pattern";
}

interface CheckDetail {
  name: string;
  status: "pass" | "fail" | "warn" | "skip";
  message: string;
}

interface RecruiterResultCardProps {
  trust_score: number;
  risk_level: "High" | "Medium" | "Low";
  flags: RecruiterFlag[];
  checks: {
    email: CheckDetail[];
    domain: CheckDetail[];
    company: CheckDetail[];
    url: CheckDetail[];
    patterns: CheckDetail[];
  };
  recommendation: string;
  recruiterName?: string;
  company?: string;
  email?: string;
  website?: string;
}

// ─── Circular Trust Meter ────────────────────────────────────────────────────

function TrustMeter({ score, riskLevel }: { score: number; riskLevel: string }) {
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270° arc
  const offset = arcLength - (arcLength * score) / 100;

  const colorMap: Record<string, { stroke: string; glow: string; text: string }> = {
    High: { stroke: "#ef4444", glow: "rgba(239,68,68,0.4)", text: "text-red-500" },
    Medium: { stroke: "#eab308", glow: "rgba(234,179,8,0.4)", text: "text-yellow-500" },
    Low: { stroke: "#22c55e", glow: "rgba(34,197,94,0.4)", text: "text-green-500" },
  };

  const color = colorMap[riskLevel] || colorMap.Medium;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="transform rotate-[135deg]">
        {/* Background arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${color.glow})`,
            transition: "stroke-dashoffset 1.5s ease-in-out",
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-5xl font-bold font-mono tracking-tight", color.text)}>
          {score}
        </span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
          Trust Score
        </span>
      </div>
    </div>
  );
}

// ─── Risk Badge ──────────────────────────────────────────────────────────────

function RiskBadgeLarge({ riskLevel }: { riskLevel: string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; bg: string; border: string; text: string }> = {
    High: {
      icon: <ShieldX className="h-5 w-5" />,
      label: "HIGH RISK",
      bg: "bg-red-500/15",
      border: "border-red-500/40",
      text: "text-red-500",
    },
    Medium: {
      icon: <ShieldAlert className="h-5 w-5" />,
      label: "SUSPICIOUS",
      bg: "bg-yellow-500/15",
      border: "border-yellow-500/40",
      text: "text-yellow-500",
    },
    Low: {
      icon: <ShieldCheck className="h-5 w-5" />,
      label: "SAFE",
      bg: "bg-green-500/15",
      border: "border-green-500/40",
      text: "text-green-500",
    },
  };

  const c = config[riskLevel] || config.Medium;

  return (
    <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm tracking-wide", c.bg, c.border, c.text)}>
      {c.icon}
      {c.label}
    </div>
  );
}

// ─── Flag Icon ───────────────────────────────────────────────────────────────

function FlagIcon({ type }: { type: string }) {
  switch (type) {
    case "critical":
      return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />;
    case "info":
      return <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />;
  }
}

// ─── Check Status Icon ───────────────────────────────────────────────────────

function CheckStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
    case "fail":
      return <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
    case "warn":
      return <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
    case "skip":
      return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />;
    default:
      return null;
  }
}

// ─── Category Icon ───────────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case "email":
      return <Mail className="h-4 w-4" />;
    case "domain":
      return <Globe className="h-4 w-4" />;
    case "company":
      return <Building2 className="h-4 w-4" />;
    case "url":
      return <Link2 className="h-4 w-4" />;
    case "pattern":
      return <Search className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
}

// ─── Collapsible Check Section ───────────────────────────────────────────────

function CheckSection({
  title,
  icon,
  checks,
}: {
  title: string;
  icon: React.ReactNode;
  checks: CheckDetail[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasFails = checks.some((c) => c.status === "fail" || c.status === "warn");
  const allSkipped = checks.every((c) => c.status === "skip");

  if (checks.length === 0) return null;

  return (
    <div className={cn(
        "rounded-lg border p-3 transition-colors",
        hasFails ? "border-yellow-500/30 bg-yellow-500/5" : allSkipped ? "border-border/20 bg-card/20" : "border-green-500/20 bg-green-500/5"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className={cn(
            "text-xs px-1.5 py-0.5 rounded",
            hasFails ? "bg-yellow-500/20 text-yellow-500" : allSkipped ? "bg-muted text-muted-foreground" : "bg-green-500/20 text-green-500"
          )}>
            {allSkipped ? "Skipped" : hasFails ? "Issues Found" : "All Clear"}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="mt-3 space-y-2 pl-1">
          {checks.map((check, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckStatusIcon status={check.status} />
              <div>
                <span className="text-xs font-semibold text-foreground">{check.name}</span>
                <p className="text-xs text-muted-foreground">{check.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function RecruiterResultCard({
  trust_score,
  risk_level,
  flags,
  checks,
  recommendation,
  recruiterName,
  company,
  email,
  website,
}: RecruiterResultCardProps) {
  return (
    <div className="space-y-6">
      {/* ═══ Hero: Trust Score + Badge ═══ */}
      <Card className="glass-card border-border overflow-hidden">
        <CardContent className="pt-8 pb-6">
          <div className="flex flex-col items-center gap-5">
            <TrustMeter score={trust_score} riskLevel={risk_level} />
            <RiskBadgeLarge riskLevel={risk_level} />

            {/* Subject info */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              {recruiterName && (
                <span className="flex items-center gap-1.5">
                  <span className="text-foreground font-medium">{recruiterName}</span>
                </span>
              )}
              {company && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-card/60 border border-border/30">
                  <Building2 className="h-3.5 w-3.5" />
                  {company}
                </span>
              )}
              {email && (
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <Mail className="h-3.5 w-3.5" />
                  {email}
                </span>
              )}
              {website && (
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <Globe className="h-3.5 w-3.5" />
                  {website}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ Findings ═══ */}
      {flags.length > 0 && (
        <Card className="glass-card border-border">
          <CardHeader className="border-b border-border/50 pb-3 pt-5 bg-card/40">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Findings ({flags.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {flags.map((flag, idx) => (
              <div
                key={idx}
                className={cn(
                  "rounded-lg border p-3 flex items-start gap-3 transition-colors",
                  flag.type === "critical" ? "border-red-500/30 bg-red-500/5" :
                  flag.type === "warning" ? "border-yellow-500/30 bg-yellow-500/5" :
                  "border-blue-500/30 bg-blue-500/5"
                )}
              >
                <FlagIcon type={flag.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/90">{flag.message}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <CategoryIcon category={flag.category} />
                    {flag.category.charAt(0).toUpperCase() + flag.category.slice(1)} Check
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ═══ Detailed Checks ═══ */}
      <Card className="glass-card border-border">
        <CardHeader className="border-b border-border/50 pb-3 pt-5 bg-card/40">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Shield className="h-4 w-4 text-primary" />
            Detailed Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <CheckSection title="Email Intelligence" icon={<Mail className="h-4 w-4" />} checks={checks.email} />
          <CheckSection title="Domain Intelligence" icon={<Globe className="h-4 w-4" />} checks={checks.domain} />
          <CheckSection title="Company Verification" icon={<Building2 className="h-4 w-4" />} checks={checks.company} />
          <CheckSection title="URL Safety" icon={<Link2 className="h-4 w-4" />} checks={checks.url} />
          <CheckSection title="Pattern Analysis" icon={<Search className="h-4 w-4" />} checks={checks.patterns} />
        </CardContent>
      </Card>

      {/* ═══ Recommendation ═══ */}
      <Card className={cn(
        "glass-card border overflow-hidden",
        risk_level === "High" ? "border-red-500/30 bg-gradient-to-br from-red-500/10 to-card/30" :
        risk_level === "Medium" ? "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-card/30" :
        "border-green-500/30 bg-gradient-to-br from-green-500/10 to-card/30"
      )}>
        <CardContent className="pt-5 pb-5">
          <div className="flex gap-4">
            <div className={cn(
              "h-11 w-11 flex-shrink-0 rounded-xl flex items-center justify-center",
              risk_level === "High" ? "bg-red-500/20" :
              risk_level === "Medium" ? "bg-yellow-500/20" :
              "bg-green-500/20"
            )}>
              {risk_level === "High" ? (
                <ShieldX className="h-6 w-6 text-red-500" />
              ) : risk_level === "Medium" ? (
                <ShieldAlert className="h-6 w-6 text-yellow-500" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-green-500" />
              )}
            </div>
            <div>
              <p className={cn(
                "font-bold text-base",
                risk_level === "High" ? "text-red-500" :
                risk_level === "Medium" ? "text-yellow-500" :
                "text-green-500"
              )}>
                {risk_level === "High" ? "Do Not Proceed" :
                 risk_level === "Medium" ? "Proceed with Caution" :
                 "Likely Legitimate"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
