import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Zap, Shield, Globe, CheckCircle2 } from "lucide-react";

export interface ConfidenceBreakdownPanelProps {
  scam_probability: number;
  pipeline_metadata?: {
    ai_invoked?: boolean;
    ai_latency_ms?: number;
    rule_score: number;
    heuristic_score: number;
    ai_triggered_by?: string;
    preprocessed_length?: number;
  };
  domain_trust_score?: number;
  confidence_level?: string;
  confidence_reason?: string;
}

interface ScoreBarProps {
  label: string;
  sublabel: string;
  value: number;
  icon: React.ReactNode;
  invert?: boolean; // higher = safer
}

const ScoreBar: React.FC<ScoreBarProps> = ({ label, sublabel, value, icon, invert = false }) => {
  const display = Math.round(Math.max(0, Math.min(100, value)));
  const riskLevel = invert
    ? display > 70 ? "safe" : display > 40 ? "medium" : "danger"
    : display > 70 ? "danger" : display > 40 ? "medium" : "safe";

  const styles = {
    danger: { text: "text-red-400", bar: "from-red-600 to-red-500", badge: "bg-red-500/15 border-red-500/25 text-red-400" },
    medium: { text: "text-amber-400", bar: "from-amber-600 to-amber-400", badge: "bg-amber-500/15 border-amber-500/25 text-amber-400" },
    safe:   { text: "text-emerald-400", bar: "from-emerald-600 to-emerald-400", badge: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400" },
  };
  const s = styles[riskLevel];

  return (
    <div className="rounded-xl border border-border/40 bg-card/20 p-4 hover:border-white/20 transition-all duration-200 hover:bg-card/40">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">{icon}</div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{sublabel}</p>
          </div>
        </div>
        <div className={`flex-shrink-0 text-2xl font-black tabular-nums ${s.text}`}>
          {invert ? <>{display}<span className="text-sm font-normal text-muted-foreground">/100</span></> : <>{display}<span className="text-base font-normal text-muted-foreground">%</span></>}
        </div>
      </div>
      <div className="mt-3 w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${s.bar}`}
          style={{ width: `${display}%` }}
        />
      </div>
    </div>
  );
};

export const ConfidenceBreakdownPanel: React.FC<ConfidenceBreakdownPanelProps> = ({
  scam_probability,
  pipeline_metadata,
  domain_trust_score,
  confidence_level = "Medium",
  confidence_reason,
}) => {
  const aiScore = Math.round(scam_probability * 100);
  const ruleScore = pipeline_metadata ? Math.round(pipeline_metadata.rule_score * 100) : 0;
  const heuristicScore = pipeline_metadata ? Math.round(pipeline_metadata.heuristic_score * 100) : 0;
  const domainTrust = domain_trust_score ?? 0;

  const finalConfidence = Math.round(
    (aiScore * 0.45 + ruleScore * 0.25 + heuristicScore * 0.20 + (100 - domainTrust) * 0.10)
  );

  const confBadgeStyle =
    confidence_level === "High" ? "bg-blue-500/15 border-blue-500/25 text-blue-300" :
    confidence_level === "Medium" ? "bg-amber-500/15 border-amber-500/25 text-amber-300" :
    "bg-slate-500/15 border-slate-500/25 text-slate-400";

  return (
    <Card className="glass-card border-border overflow-hidden">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <CardHeader className="border-b border-border/50 pb-4 pt-6 bg-card/40">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Calculator className="h-5 w-5 text-blue-400" />
            </div>
            Confidence Breakdown
          </CardTitle>
          <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${confBadgeStyle}`}>
            {confidence_level} Confidence
          </span>
        </div>
        {confidence_reason && (
          <p className="text-sm text-muted-foreground italic mt-2">
            "{confidence_reason}"
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-6 space-y-3">
        {/* Individual scores */}
        <ScoreBar
          label="AI Model Confidence"
          sublabel="Deep learning analysis of semantics and context"
          value={aiScore}
          icon={<Zap className="h-5 w-5 text-primary" />}
        />
        <ScoreBar
          label="Rule-Based Detection"
          sublabel="Deterministic matching against scam rule criteria"
          value={ruleScore}
          icon={<Shield className="h-5 w-5 text-amber-400" />}
        />
        <ScoreBar
          label="Heuristic Score"
          sublabel="Algorithmic evaluation of structural red flags"
          value={heuristicScore}
          icon={<Calculator className="h-5 w-5 text-purple-400" />}
        />
        <ScoreBar
          label="Domain Trust"
          sublabel="Reputation and age of communication sources"
          value={domainTrust}
          icon={<Globe className="h-5 w-5 text-emerald-400" />}
          invert={true}
        />

        {/* Final composite score */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold uppercase tracking-wider text-primary">Final Confidence Score</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Weighted composite (AI 45% · Rules 25% · Heuristic 20% · Domain 10%)
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-black text-primary tabular-nums">{finalConfidence}%</p>
            </div>
          </div>
          <div className="mt-3 w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700"
              style={{ width: `${finalConfidence}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
