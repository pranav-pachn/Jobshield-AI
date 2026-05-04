"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, DollarSign, Clock, Mail, ShieldX, CheckCircle } from "lucide-react";
import type { QuickScanResult } from "./QuickScanWidget";

interface AIResultPanelProps {
  result: QuickScanResult;
}

const INDICATOR_ICONS: Record<string, React.ElementType> = {
  "Payment Request": DollarSign,
  "Sensitive Data Request": ShieldX,
  "Urgency Language": Clock,
  "Unrealistic Salary": DollarSign,
  "Generic Email Domain": Mail,
  "No Experience Required": CheckCircle,
};

const SEVERITY_STYLES = {
  high: {
    badge: "bg-red-500/15 border-red-500/30 text-red-300",
    dot: "bg-red-400",
    icon: "text-red-400",
  },
  medium: {
    badge: "bg-yellow-500/15 border-yellow-500/30 text-yellow-300",
    dot: "bg-yellow-400",
    icon: "text-yellow-400",
  },
  low: {
    badge: "bg-blue-500/15 border-blue-500/30 text-blue-300",
    dot: "bg-blue-400",
    icon: "text-blue-400",
  },
};

const RISK_CONFIG = {
  High: {
    label: "HIGH RISK",
    bar: "from-red-500 to-red-600",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.4)]",
    badge: "bg-red-500/15 border border-red-500/30 text-red-300",
    ring: "ring-red-500/30",
  },
  Medium: {
    label: "MEDIUM RISK",
    bar: "from-yellow-500 to-orange-500",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
    badge: "bg-yellow-500/15 border border-yellow-500/30 text-yellow-300",
    ring: "ring-yellow-500/30",
  },
  Low: {
    label: "LOW RISK",
    bar: "from-green-500 to-emerald-500",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    badge: "bg-green-500/15 border border-green-500/30 text-green-300",
    ring: "ring-green-500/30",
  },
};

export function AIResultPanel({ result }: AIResultPanelProps) {
  const { scam_probability, risk_level, indicators, suspicious_phrases } = result;
  const riskCfg = RISK_CONFIG[risk_level];

  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top accent line */}
      <div
        className={cn(
          "h-0.5 w-full bg-gradient-to-r",
          risk_level === "High" ? "from-transparent via-red-500 to-transparent" :
          risk_level === "Medium" ? "from-transparent via-yellow-500 to-transparent" :
          "from-transparent via-green-500 to-transparent"
        )}
      />

      <div className="p-5 space-y-5">
        {/* Header + risk badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg border",
              risk_level === "High" ? "bg-red-500/10 border-red-500/20" :
              risk_level === "Medium" ? "bg-yellow-500/10 border-yellow-500/20" :
              "bg-green-500/10 border-green-500/20"
            )}>
              <AlertTriangle className={cn(
                "h-5 w-5",
                risk_level === "High" ? "text-red-400" :
                risk_level === "Medium" ? "text-yellow-400" : "text-green-400"
              )} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI Analysis Result</p>
              <p className="text-xs text-muted-foreground">Threat assessment complete</p>
            </div>
          </div>
          <span className={cn("rounded-full px-3 py-1 text-xs font-bold tracking-widest", riskCfg.badge)}>
            {riskCfg.label}
          </span>
        </div>

        {/* Scam probability bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Scam Probability
            </span>
            <span className={cn(
              "text-2xl font-bold tabular-nums",
              risk_level === "High" ? "text-red-400" :
              risk_level === "Medium" ? "text-yellow-400" : "text-green-400"
            )}>
              {scam_probability}%
            </span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-white/5 overflow-hidden">
            {/* Background track segments */}
            <div className="absolute inset-0 flex gap-px">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 h-full bg-white/[3%] rounded-sm" />
              ))}
            </div>
            {/* Fill bar */}
            <div
              className={cn(
                "absolute top-0 left-0 h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out",
                riskCfg.bar,
                riskCfg.glow
              )}
              style={{ width: `${scam_probability}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground/50">
            <span>Safe</span>
            <span>Suspicious</span>
            <span>Scam</span>
          </div>
        </div>

        {/* Detected issues */}
        {indicators.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Detected Issues ({indicators.length})
            </p>
            <div className="space-y-2">
              {indicators.map((ind, i) => {
                const styles = SEVERITY_STYLES[ind.severity];
                const Icon = INDICATOR_ICONS[ind.label] ?? AlertTriangle;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[2%] px-3 py-2.5 hover:bg-white/[4%] transition-colors"
                  >
                    <div className={cn("mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md", styles.badge)}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground">{ind.label}</span>
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold border", styles.badge)}>
                          {ind.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ind.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Suspicious phrases */}
        {suspicious_phrases.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Flagged Phrases
            </p>
            <div className="flex flex-wrap gap-2">
              {suspicious_phrases.map((phrase, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 font-mono"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="pt-1 border-t border-white/5">
          <a
            href="/analyze"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
          >
            View Full Analysis Report
            <AlertTriangle className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
