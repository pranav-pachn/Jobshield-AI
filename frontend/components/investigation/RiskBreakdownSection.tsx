"use client";

import { BetterEvaluation, FinalDecisionOutput } from "@/lib/investigationTypes";

interface RiskBreakdownSectionProps {
  evaluation?: BetterEvaluation;
  finalDecision?: FinalDecisionOutput;
}

export function RiskBreakdownSection({ evaluation, finalDecision }: RiskBreakdownSectionProps) {
  if (!evaluation && !finalDecision) {
    return null;
  }

  const contentScore = evaluation?.content_risk?.score;
  const recruiterTrust = evaluation?.recruiter_trust?.score;
  const threatScore = evaluation?.threat_match?.score;
  const historicalScore = evaluation?.historical_similarity?.score;

  const overallScore = finalDecision?.riskScore ?? evaluation?.overall_risk?.score;
  const confidence = finalDecision?.confidence;
  const evidenceQuality = evaluation?.evidence_quality?.label ?? "Not available";

  return (
    <section aria-label="Risk Breakdown" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-serif text-slate-100 tracking-tight">Risk Breakdown</h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Dimensional assessment evaluated across content, recruiter identity, and threat telemetry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dimension Bars */}
        <div className="p-5 rounded-lg bg-surface-elevated border border-slate-800/80 flex flex-col justify-around gap-4">
          {/* Content Risk */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-slate-300 font-medium">Content Risk</span>
              <span className="font-mono text-slate-200">
                {typeof contentScore === "number" ? `${Math.round(contentScore)}%` : "Not available"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{ width: typeof contentScore === "number" ? `${Math.min(100, Math.max(0, contentScore))}%` : "0%" }}
              />
            </div>
          </div>

          {/* Recruiter Trust */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-slate-300 font-medium">Recruiter Trust</span>
              <span className="font-mono text-slate-200">
                {typeof recruiterTrust === "number" ? `${Math.round(recruiterTrust)}%` : "Not available"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: typeof recruiterTrust === "number" ? `${Math.min(100, Math.max(0, recruiterTrust))}%` : "0%" }}
              />
            </div>
          </div>

          {/* Threat Match */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-slate-300 font-medium">Threat Match</span>
              <span className="font-mono text-slate-200">
                {typeof threatScore === "number" ? `${Math.round(threatScore)}%` : "Not available"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: typeof threatScore === "number" ? `${Math.min(100, Math.max(0, threatScore))}%` : "0%" }}
              />
            </div>
          </div>

          {/* Historical Similarity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-slate-300 font-medium">Historical Pattern Match</span>
              <span className="font-mono text-slate-200">
                {typeof historicalScore === "number" ? `${Math.round(historicalScore)}%` : "Not available"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: typeof historicalScore === "number" ? `${Math.min(100, Math.max(0, historicalScore))}%` : "0%" }}
              />
            </div>
          </div>
        </div>

        {/* Summary Telemetry Card */}
        <div className="p-5 rounded-lg bg-surface-elevated border border-slate-800/80 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 text-xs">
              <span className="text-slate-400 font-sans">Evaluated Risk</span>
              <span className="font-mono font-medium text-slate-200">
                {typeof overallScore === "number" ? `${Math.round(overallScore)} / 100` : "Not available"}
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 text-xs">
              <span className="text-slate-400 font-sans">Decision Confidence</span>
              <span className="font-mono font-medium text-slate-200">
                {typeof confidence === "number" 
                  ? `${Math.round(confidence > 1 ? confidence : confidence * 100)}%` 
                  : "Not available"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-sans">Evidence Quality</span>
              <span className="font-mono text-slate-300">
                {evidenceQuality}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-sans leading-relaxed pt-3 border-t border-slate-800/60">
            Scores reflect automated heuristics and retrieved telemetry. For comprehensive agent logs and raw decision policy weights, expand Advanced Investigation Details below.
          </p>
        </div>
      </div>
    </section>
  );
}
