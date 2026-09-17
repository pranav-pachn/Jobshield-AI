"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, BrainCircuit } from "lucide-react";
import { intelligenceApi } from "@/lib/intelligenceApi";
import { InvestigationExplanation } from "@/lib/intelligenceTypes";
import { InvestigationTrace } from "@/lib/investigationTypes";

interface ExplainabilityPanelProps {
  investigationId?: string;
  trace?: InvestigationTrace;
}

function formatSignalHeader(name: string): string {
  if (!name) return "DETECTED SIGNAL";
  return name.replace(/_/g, " ").toUpperCase();
}

export function ExplainabilityPanel({ investigationId, trace }: ExplainabilityPanelProps) {
  const [explanation, setExplanation] = useState<InvestigationExplanation | null>(null);
  const [loading, setLoading] = useState(Boolean(investigationId));
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (!investigationId) {
      setLoading(false);
      return;
    }
    intelligenceApi.getExplanation(investigationId)
      .then(setExplanation)
      .catch((err) => {
        // Silently capture error; trace fallback will serve data
        console.warn("Could not load API explanation details:", err?.message || err);
      })
      .finally(() => setLoading(false));
  }, [investigationId]);

  // Extract Top Content / Flagged Signal
  const topSignal = 
    explanation?.signals?.[0] || 
    (trace?.evidenceAggregation?.contentEvidence?.[0] ? {
      type: trace.evidenceAggregation.contentEvidence[0].signal,
      description: trace.evidenceAggregation.contentEvidence[0].evidence || "",
      severity: trace.evidenceAggregation.contentEvidence[0].severity,
      source: "content_analysis",
      confidence: trace.evidenceAggregation.contentEvidence[0].confidence
    } : null) ||
    (trace?.contentFindings?.riskSignals?.[0] ? {
      type: trace.contentFindings.riskSignals[0].signal,
      description: trace.contentFindings.riskSignals[0].evidence || "",
      severity: trace.contentFindings.riskSignals[0].severity,
      source: "content_analysis",
      confidence: trace.contentFindings.riskSignals[0].confidence
    } : null);

  // Extract Top Threat Intelligence Pattern
  const topThreat = 
    trace?.evidenceAggregation?.threatEvidence?.[0] ||
    trace?.threatFindings?.matches?.[0] ||
    null;

  // Extract Recruiter Identity Signal
  const recruiterSignal =
    (trace?.evidenceAggregation?.recruiterEvidence?.[0] ? {
      type: trace.evidenceAggregation.recruiterEvidence[0].signal,
      description: trace.evidenceAggregation.recruiterEvidence[0].evidence || "",
      confidence: trace.evidenceAggregation.recruiterEvidence[0].confidence
    } : null) ||
    (trace?.recruiterFindings?.identitySignals?.[0] ? {
      type: trace.recruiterFindings.identitySignals[0].signal,
      description: trace.recruiterFindings.identitySignals[0].evidence || "",
      confidence: trace.recruiterFindings.identitySignals[0].confidence
    } : null) ||
    (explanation?.signals?.find((s) => s.source.toLowerCase().includes("recruiter")) ? {
      type: explanation.signals.find((s) => s.source.toLowerCase().includes("recruiter"))!.type,
      description: explanation.signals.find((s) => s.source.toLowerCase().includes("recruiter"))!.description,
      confidence: undefined
    } : null);

  if (loading && !trace) {
    return (
      <div className="p-6 text-center text-slate-500 bg-surface-elevated rounded-lg border border-slate-800 animate-pulse text-xs font-sans">
        Analyzing explanation signals...
      </div>
    );
  }

  // If literally no data is present across both explanation and trace, skip rendering
  if (!explanation && !trace && !topSignal && !topThreat && !recruiterSignal) {
    return null;
  }

  const verdict = trace?.finalDecision?.verdict;
  let heading = "Why was this detected?";
  if (verdict === "SAFE") {
    heading = "Why did JobShield consider this safe?";
  } else if (verdict === "HUMAN_REVIEW") {
    heading = "Why does this need human review?";
  } else if (verdict === "SCAM") {
    heading = "Why was this flagged?";
  }

  return (
    <section aria-label={heading} className="space-y-4">
      <div>
        <h3 className="text-base font-serif text-slate-100 tracking-tight flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-blue-400" />
          {heading}
        </h3>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Primary signals and contextual intelligence contributing to this assessment.
        </p>
      </div>

      {/* Signature 3-Card Centerpiece */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Primary Scam Signal */}
        <div className="p-4 sm:p-5 rounded-lg bg-surface-elevated border border-slate-800/80 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              {topSignal?.type ? formatSignalHeader(topSignal.type) : "PRIMARY SIGNAL"}
            </span>
            <span className="text-xs font-semibold text-red-400 mt-1 block font-sans">
              {topSignal?.severity ? `${topSignal.severity.toUpperCase()} RISK SIGNAL` : "High-risk signal"}
            </span>
            <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
              {topSignal?.description || "No specific content signal flagged for this opportunity."}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-sans">Confidence</span>
            <span className="font-mono text-slate-200">
              {typeof topSignal?.confidence === "number"
                ? `${Math.round(topSignal.confidence > 1 ? topSignal.confidence : topSignal.confidence * 100)}%`
                : "Not available"}
            </span>
          </div>
        </div>

        {/* Card 2: Threat Intelligence */}
        <div className="p-4 sm:p-5 rounded-lg bg-surface-elevated border border-slate-800/80 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              THREAT INTELLIGENCE
            </span>
            <span className="text-xs font-semibold text-purple-400 mt-1 block font-sans">
              {topThreat?.sourceId ? `Pattern: ${topThreat.sourceId}` : "Related threat pattern"}
            </span>
            <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
              {topThreat 
                ? `Matched against historical threat clusters with strong semantic vector similarity.`
                : "No matching historical fraud campaigns or known threat clusters found."}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-sans">Similarity</span>
            <span className="font-mono text-slate-200">
              {typeof topThreat?.similarity === "number"
                ? `${Math.round(topThreat.similarity * 100)}%`
                : "Not available"}
            </span>
          </div>
        </div>

        {/* Card 3: Recruiter Signal */}
        <div className="p-4 sm:p-5 rounded-lg bg-surface-elevated border border-slate-800/80 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              RECRUITER SIGNAL
            </span>
            <span className="text-xs font-semibold text-amber-400 mt-1 block font-sans">
              {recruiterSignal?.type ? formatSignalHeader(recruiterSignal.type) : "Recruiter identity verification"}
            </span>
            <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
              {recruiterSignal?.description || "Domain or recruiter credentials could not be cross-referenced or verified."}
            </p>
          </div>
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-sans">Verification Status</span>
            <span className="font-mono text-slate-200">
              {typeof recruiterSignal?.confidence === "number"
                ? `${Math.round(recruiterSignal.confidence > 1 ? recruiterSignal.confidence : recruiterSignal.confidence * 100)}%`
                : (recruiterSignal ? "Evaluated" : "Not available")}
            </span>
          </div>
        </div>
      </div>

      {/* Optional Technical Policy Explanation Accordion */}
      {explanation?.decisionPolicy && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="text-xs text-slate-500 hover:text-slate-300 font-sans flex items-center gap-1 transition-colors"
          >
            {isDetailsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {isDetailsOpen ? "Hide policy determination details" : "View policy determination details"}
          </button>

          {isDetailsOpen && (
            <div className="mt-2 p-4 rounded-lg bg-black/30 border border-slate-800/80 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-sans font-medium text-slate-300">Policy Verdict</span>
                <span className="font-mono text-xs text-slate-200 uppercase bg-slate-800 px-2 py-0.5 rounded">
                  {explanation.decisionPolicy.decision}
                </span>
              </div>
              <p className="text-slate-400 font-sans leading-relaxed">
                {explanation.decisionPolicy.reason}
              </p>
              <div className="pt-2 text-[10px] text-slate-500 font-mono">
                Policy Version: {explanation.decisionPolicy.policyVersion || "1.0"}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
