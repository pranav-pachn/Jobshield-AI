import React from "react";

type RiskLevel = "Low" | "Medium" | "High";

interface RiskSummaryCardProps {
  riskLevel: RiskLevel;
  riskScore: number;
  confidencePercent: number;
  reasons: string[];
}

function getRiskColors(riskLevel: RiskLevel) {
  switch (riskLevel) {
    case "High":
      return {
        border: "border-red-500/40",
        bg: "bg-gradient-to-br from-red-950/40 to-card/20",
        accent: "text-red-400",
        glow: "shadow-[0_0_24px_rgba(239,68,68,0.25)]",
        strip: "via-red-500/60",
        progress: "bg-gradient-to-r from-red-600 to-red-400",
      };
    case "Medium":
      return {
        border: "border-amber-500/40",
        bg: "bg-gradient-to-br from-amber-950/30 to-card/20",
        accent: "text-amber-400",
        glow: "shadow-[0_0_24px_rgba(217,119,6,0.25)]",
        strip: "via-amber-500/60",
        progress: "bg-gradient-to-r from-amber-600 to-amber-400",
      };
    case "Low":
      return {
        border: "border-emerald-500/35",
        bg: "bg-gradient-to-br from-emerald-950/20 to-card/20",
        accent: "text-emerald-400",
        glow: "shadow-[0_0_24px_rgba(16,185,129,0.2)]",
        strip: "via-emerald-500/60",
        progress: "bg-gradient-to-r from-emerald-600 to-emerald-400",
      };
  }
}

export function RiskSummaryCard({
  riskLevel,
  riskScore,
  confidencePercent,
  reasons,
}: RiskSummaryCardProps) {
  const colors = getRiskColors(riskLevel);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${colors.border} ${colors.bg} ${colors.glow} p-6 backdrop-blur-xl sm:p-8`}
    >
      <div className={`absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent ${colors.strip} to-transparent`} />

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className={`mb-1 text-xs font-bold uppercase tracking-widest ${colors.accent} opacity-70`}>
            Threat Assessment
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Risk Score
          </div>
          <div className={`mt-1 text-4xl font-black tracking-tight ${colors.accent}`}>
            {riskScore}% ({riskLevel} Risk)
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Confidence</div>
          <div className="text-3xl font-black tabular-nums text-blue-400">{confidencePercent}%</div>
        </div>
      </div>

      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full transition-all duration-700 ${colors.progress}`} style={{ width: `${riskScore}%` }} />
      </div>

      {reasons.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Reasons</p>
          <ul className="space-y-1.5">
            {reasons.map((reason, index) => (
              <li key={`${reason}-${index}`} className="flex items-start gap-2 text-sm text-foreground/90">
                <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${colors.accent.replace("text-", "bg-")}`} />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
