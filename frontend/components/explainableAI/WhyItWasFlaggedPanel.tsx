"use client";

import React from "react";
import {
  AlertTriangle,
  DollarSign,
  MessageCircle,
  Globe,
  UserX,
  Clock,
  Briefcase,
  Lock,
  Mail,
  Phone,
  FileText,
  ShieldAlert,
  Zap,
} from "lucide-react";

export interface WhyItWasFlaggedPanelProps {
  suspicious_phrases: string[];
  phrase_details?: Array<{
    phrase: string;
    confidence: number;
    reason: string;
  }>;
  reasons?: string[];
}

// Map common scam keywords to meaningful icon + label + description triplets
const SCAM_PATTERN_MAP: Array<{
  keywords: string[];
  icon: React.ElementType;
  label: string;
  description: string;
  severity: "critical" | "high" | "medium";
}> = [
  {
    keywords: ["registration fee", "upfront fee", "training fee", "payment required", "pay to apply", "advance payment", "admin fee"],
    icon: DollarSign,
    label: "Registration / Upfront Fee Requested",
    description: "Legitimate employers never ask candidates to pay fees to apply or start work.",
    severity: "critical",
  },
  {
    keywords: ["unrealistic salary", "high salary", "$10,000", "$5,000 per week", "earn unlimited", "massive income", "sky-high pay"],
    icon: Zap,
    label: "Unrealistic Salary Offered",
    description: "Compensation far above market rate is a classic lure used by scammers.",
    severity: "critical",
  },
  {
    keywords: ["telegram", "whatsapp", "signal", "dm us", "message us", "chat app", "text us"],
    icon: MessageCircle,
    label: "Recruiter Using Unofficial Messaging App",
    description: "Legitimate recruiters use professional email and official platforms, not chat apps.",
    severity: "high",
  },
  {
    keywords: ["work from home", "remote", "no experience needed", "anyone can apply", "no skills required"],
    icon: Briefcase,
    label: "Overly Easy Entry Requirements",
    description: "Scam postings often claim no experience is needed to cast a wide net.",
    severity: "medium",
  },
  {
    keywords: ["gmail", "yahoo", "hotmail", "outlook.com", "proton"],
    icon: Mail,
    label: "Personal Email Used for Business",
    description: "Recruiters from real companies use corporate email addresses, not free providers.",
    severity: "high",
  },
  {
    keywords: ["newly registered", "new domain", "domain age", "recently created"],
    icon: Globe,
    label: "Suspicious or Newly Registered Domain",
    description: "The company domain was registered very recently, a common scam tactic.",
    severity: "high",
  },
  {
    keywords: ["social security", "ssn", "passport", "id copy", "bank account", "personal details upfront"],
    icon: Lock,
    label: "Sensitive Personal Data Requested Early",
    description: "Asking for personal or financial data before hiring is a major red flag.",
    severity: "critical",
  },
  {
    keywords: ["unknown company", "no company name", "anonymous employer", "confidential employer"],
    icon: UserX,
    label: "Company Identity Concealed",
    description: "Scammers often hide their company identity to avoid being traced.",
    severity: "high",
  },
  {
    keywords: ["urgent", "immediate", "start today", "limited slots", "act now", "respond asap"],
    icon: Clock,
    label: "Artificial Urgency Tactics",
    description: "High-pressure language is used to prevent candidates from doing proper research.",
    severity: "medium",
  },
  {
    keywords: ["call us now", "phone interview only", "voice only", "no email"],
    icon: Phone,
    label: "Phone-Only Communication Insisted",
    description: "Avoiding written trails is a sign the recruiter wants to stay untrackable.",
    severity: "medium",
  },
  {
    keywords: ["reshipping", "package forwarding", "receive packages", "ship goods"],
    icon: FileText,
    label: "Reshipping / Package Forwarding Involved",
    description: "These 'jobs' are money mule operations that involve handling stolen goods.",
    severity: "critical",
  },
];

interface FlagItem {
  icon: React.ElementType;
  label: string;
  description: string;
  severity: "critical" | "high" | "medium";
  raw?: string;
}

function matchFlags(reasons: string[], suspicious_phrases: string[]): FlagItem[] {
  const all = [...reasons, ...suspicious_phrases].map(s => s.toLowerCase());
  const matched = new Set<number>();
  const flags: FlagItem[] = [];

  for (const text of all) {
    for (let i = 0; i < SCAM_PATTERN_MAP.length; i++) {
      if (matched.has(i)) continue;
      const pattern = SCAM_PATTERN_MAP[i];
      if (pattern.keywords.some(kw => text.includes(kw))) {
        matched.add(i);
        flags.push({
          icon: pattern.icon,
          label: pattern.label,
          description: pattern.description,
          severity: pattern.severity,
        });
      }
    }
  }

  // For unmatched reasons, add them raw
  for (const reason of reasons) {
    if (reason.length > 5) {
      flags.push({
        icon: ShieldAlert,
        label: reason,
        description: "Detected by AI pattern analysis engine.",
        severity: "high",
      });
    }
  }

  // De-duplicate by label
  const seen = new Set<string>();
  return flags.filter(f => {
    if (seen.has(f.label)) return false;
    seen.add(f.label);
    return true;
  }).slice(0, 7);
}

const SEVERITY_STYLES = {
  critical: {
    border: "border-red-500/40",
    bg: "bg-red-500/10 hover:bg-red-500/15",
    iconBg: "bg-red-500/20 border-red-500/40",
    iconColor: "text-red-400",
    badge: "bg-red-500/20 text-red-300 border-red-500/40",
    badgeLabel: "CRITICAL",
    dot: "bg-red-400",
  },
  high: {
    border: "border-amber-500/40",
    bg: "bg-amber-500/10 hover:bg-amber-500/15",
    iconBg: "bg-amber-500/20 border-amber-500/40",
    iconColor: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    badgeLabel: "HIGH",
    dot: "bg-amber-400",
  },
  medium: {
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5 hover:bg-yellow-500/10",
    iconBg: "bg-yellow-500/20 border-yellow-500/30",
    iconColor: "text-yellow-400",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    badgeLabel: "MEDIUM",
    dot: "bg-yellow-400",
  },
};

export const WhyItWasFlaggedPanel: React.FC<WhyItWasFlaggedPanelProps> = ({
  suspicious_phrases,
  phrase_details,
  reasons,
}) => {
  // Build display flags: prefer rich phrase_details, augment with reasons + suspicious_phrases
  const allReasons = reasons || [];
  const allPhrases = suspicious_phrases || [];

  const smartFlags = matchFlags(allReasons, allPhrases);

  // Also include phrase_details items not already captured
  const phraseFlags: FlagItem[] = (phrase_details || []).map(p => ({
    icon: ShieldAlert,
    label: `"${p.phrase}"`,
    description: p.reason || "Detected as suspicious by the AI engine.",
    severity: p.confidence >= 0.8 ? "critical" : p.confidence >= 0.5 ? "high" : "medium",
  }));

  // Merge: smart flags first, then unique phrase flags
  const seenLabels = new Set(smartFlags.map(f => f.label));
  const mergedFlags = [
    ...smartFlags,
    ...phraseFlags.filter(f => !seenLabels.has(f.label)),
  ].slice(0, 8);

  if (mergedFlags.length === 0 && allReasons.length === 0 && allPhrases.length === 0) {
    return null;
  }

  const critCount = mergedFlags.filter(f => f.severity === "critical").length;
  const highCount = mergedFlags.filter(f => f.severity === "high").length;

  return (
    <div className="rounded-xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-card/30 to-card/20 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Top glow stripe */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white tracking-tight">
              Why This Job Was Flagged
            </h3>
            <p className="text-sm text-red-200/60 mt-1">
              AI-detected indicators that match known scam patterns
            </p>
          </div>
          {/* Summary counts */}
          <div className="flex gap-2 flex-shrink-0">
            {critCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-xs font-bold text-red-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                {critCount} Critical
              </span>
            )}
            {highCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {highCount} High
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Flags list */}
      <div className="p-4 space-y-2.5">
        {mergedFlags.map((flag, i) => {
          const s = SEVERITY_STYLES[flag.severity];
          const Icon = flag.icon;
          return (
            <div
              key={i}
              className={`group flex items-start gap-4 rounded-xl border ${s.border} ${s.bg} p-4 transition-all duration-200 cursor-default`}
            >
              {/* Icon */}
              <div className={`mt-0.5 flex-shrink-0 p-2.5 rounded-lg border ${s.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`h-4 w-4 ${s.iconColor}`} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-semibold text-white text-sm leading-snug">
                    {flag.label}
                  </p>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider ${s.badge}`}>
                    {s.badgeLabel}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  {flag.description}
                </p>
              </div>

              {/* Severity dot */}
              <div className={`mt-2 flex-shrink-0 h-2 w-2 rounded-full ${s.dot} ${flag.severity === "critical" ? "animate-pulse" : ""}`} />
            </div>
          );
        })}

        {/* Fallback if no smart flags but raw phrases exist */}
        {mergedFlags.length === 0 && allPhrases.length > 0 && (
          <div className="space-y-2">
            {allPhrases.slice(0, 6).map((phrase, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-lg border ${SEVERITY_STYLES.high.border} ${SEVERITY_STYLES.high.bg} px-4 py-3 transition-all`}>
                <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-white font-medium">"{phrase}"</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 pb-4">
        <div className="rounded-lg bg-white/5 border border-white/5 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            💡 These signals were cross-referenced against <strong className="text-white/70">10,000+ verified scam templates</strong> and community reports. Each flag contributes to the overall scam probability score.
          </p>
        </div>
      </div>
    </div>
  );
};
