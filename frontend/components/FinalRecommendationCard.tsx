"use client";

import { AlertTriangle, Shield, X, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinalRecommendationCardProps {
  riskLevel: "Low" | "Medium" | "High";
  riskScore: number;
  suspiciousPhrases?: string[];
  reasons?: string[];
  confidence?: number;
  className?: string;
}

export function FinalRecommendationCard({
  riskLevel,
  riskScore,
  suspiciousPhrases = [],
  reasons = [],
  confidence,
  className,
}: FinalRecommendationCardProps) {
  const isHigh   = riskLevel === "High";
  const isMedium = riskLevel === "Medium";
  const isLow    = riskLevel === "Low";

  type Rec = {
    headline: string;
    message: string;
    callout: string;
    actions: string[];
    Icon: typeof AlertTriangle;
    borderClass: string;
    bgClass: string;
    accentClass: string;
    iconClass: string;
    badgeClass: string;
    stripClass: string;
  };

  const rec: Rec = isHigh
    ? {
        headline: "Avoid This Job Posting",
        message: "Multiple high-confidence scam indicators were detected. Interacting with this posting may expose you to financial loss or identity theft.",
        callout: "Do not apply, share personal information, or make any payments.",
        actions: [
          "Do not apply or respond to the recruiter",
          "Do not share personal or financial information",
          "Report to FTC at reportfraud.ftc.gov",
          "Flag the post on the original job platform",
          "Block the contact if you've been messaged directly",
        ],
        Icon: X,
        borderClass: "border-red-500/40",
        bgClass: "bg-gradient-to-br from-red-950/40 to-card/20",
        accentClass: "text-red-400",
        iconClass: "bg-red-500/20 border-red-500/40",
        badgeClass: "bg-red-500/15 border-red-500/30 text-red-300",
        stripClass: "from-transparent via-red-500/60 to-transparent",
      }
    : isMedium
    ? {
        headline: "Proceed with Caution",
        message: "Suspicious patterns were detected but are not conclusive. Some details require independent verification before proceeding.",
        callout: "Verify the company and recruiter through official channels before sharing any data.",
        actions: [
          "Verify company details through official website",
          "Confirm recruiter identity via LinkedIn",
          "Never pay fees to apply or onboard",
          "Watch for escalating pressure tactics",
          "Use a secondary email for initial communication",
        ],
        Icon: AlertTriangle,
        borderClass: "border-amber-500/35",
        bgClass: "bg-gradient-to-br from-amber-950/30 to-card/20",
        accentClass: "text-amber-400",
        iconClass: "bg-amber-500/20 border-amber-500/40",
        badgeClass: "bg-amber-500/15 border-amber-500/30 text-amber-300",
        stripClass: "from-transparent via-amber-500/60 to-transparent",
      }
    : {
        headline: "Appears Legitimate",
        message: "No significant scam indicators were detected. This posting aligns with known patterns of legitimate employment.",
        callout: "Standard job search precautions are still recommended.",
        actions: [
          "Proceed with your application normally",
          "Keep personal data sharing minimal until hired",
          "Trust your instincts if anything feels off later",
          "Verify offer letters before accepting",
        ],
        Icon: CheckCircle2,
        borderClass: "border-emerald-500/35",
        bgClass: "bg-gradient-to-br from-emerald-950/20 to-card/20",
        accentClass: "text-emerald-400",
        iconClass: "bg-emerald-500/20 border-emerald-500/35",
        badgeClass: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300",
        stripClass: "from-transparent via-emerald-500/60 to-transparent",
      };

  const { Icon } = rec;

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden shadow-xl backdrop-blur-xl",
        rec.borderClass,
        rec.bgClass,
        className
      )}
    >
      {/* Top accent stripe */}
      <div className={`h-0.5 w-full bg-gradient-to-r ${rec.stripClass}`} />

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border shadow-lg ${rec.iconClass}`}>
            <Icon className={`h-7 w-7 ${rec.accentClass}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className={`text-2xl font-black tracking-tight ${rec.accentClass}`}>
                {rec.headline}
              </h3>
              <span className={`text-[10px] uppercase font-bold tracking-widest border px-3 py-1 rounded-full ${rec.badgeClass}`}>
                {riskLevel} Risk · {riskScore}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{rec.message}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Callout box */}
        <div className={cn("rounded-lg border px-4 py-3 flex items-start gap-3", rec.borderClass, "bg-white/3")}>
          <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${rec.accentClass}`} />
          <p className={`text-sm font-semibold ${rec.accentClass}`}>{rec.callout}</p>
        </div>

        {/* Confidence */}
        {confidence !== undefined && (
          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-card/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Analysis Confidence</span>
            </div>
            <span className="text-sm font-bold text-primary">{Math.round(confidence * 100)}%</span>
          </div>
        )}

        {/* Recommended actions */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Recommended Actions
          </p>
          <ul className="space-y-2">
            {rec.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <ChevronRight className={`h-4 w-4 mt-0.5 flex-shrink-0 ${rec.accentClass}`} />
                <span className="text-foreground/90 leading-snug">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Detected key signals (compact) */}
        {reasons.length > 0 && (
          <div className="rounded-lg border border-border/20 bg-card/20 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Key Signals Driving This Decision
            </p>
            <ul className="space-y-1">
              {reasons.slice(0, 4).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${rec.accentClass.replace("text-", "bg-")}`} />
                  {r}
                </li>
              ))}
              {reasons.length > 4 && (
                <li className="text-xs text-muted-foreground italic">
                  +{reasons.length - 4} more signals detected
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
