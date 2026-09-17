"use client";

import { InvestigationTrace } from "@/lib/investigationTypes";
import { VerdictHeader } from "./VerdictHeader";
import { ExplainabilityPanel } from "./ExplainabilityPanel";
import { EvidenceBundleView } from "./EvidenceBundleView";
import { RiskBreakdownSection } from "./RiskBreakdownSection";
import { InvestigationNextActions } from "./InvestigationNextActions";
import { FeedbackPanel } from "./explainabilityV2/FeedbackPanel";
import { AdvancedInvestigationDetails } from "./AdvancedInvestigationDetails";
import { InputSummaryPanel } from "./InputSummaryPanel";
import { Loader2 } from "lucide-react";

interface InvestigationReportProps {
  trace: InvestigationTrace;
  onReset?: () => void;
}

export function InvestigationReport({ trace, onReset }: InvestigationReportProps) {
  // If the investigation is still running or preparing
  if (trace.state !== "COMPLETED" && trace.state !== "FAILED") {
    const isContentDone = Boolean(trace.contentFindings);
    const isRecruiterDone = Boolean(trace.recruiterFindings);
    const isThreatDone = Boolean(trace.threatFindings);
    const isEvidenceDone = Boolean(trace.evidenceAggregation);
    const isFinalDone = Boolean(trace.finalDecision);

    return (
      <div role="status" aria-live="polite" className="mx-auto max-w-4xl space-y-6 py-6">
        <div className="p-8 sm:p-10 rounded-xl bg-surface-elevated border border-slate-800/80 flex flex-col items-center justify-center space-y-6 shadow-md text-center">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />

          <div className="space-y-1 max-w-md">
            <h2 className="text-xl sm:text-2xl font-serif text-slate-100 tracking-tight">
              Investigating this opportunity
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-sans">
              Cross-referencing recruiter identity, posting content, and known threat telemetry.
            </p>
          </div>

          <div className="flex flex-col space-y-3 text-xs font-sans text-slate-300 pt-2 w-full max-w-sm text-left">
            <div className="flex items-center gap-3">
              {isContentDone ? (
                <span className="text-emerald-400 font-bold">✓</span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              )}
              <span className={isContentDone ? "text-slate-300" : "text-slate-100 font-medium"}>
                Job content analyzed
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isRecruiterDone ? (
                <span className="text-emerald-400 font-bold">✓</span>
              ) : isContentDone ? (
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-600" />
              )}
              <span className={isRecruiterDone ? "text-slate-300" : isContentDone ? "text-slate-100 font-medium" : "text-slate-500"}>
                Checking recruiter signals
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isThreatDone ? (
                <span className="text-emerald-400 font-bold">✓</span>
              ) : isRecruiterDone ? (
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-600" />
              )}
              <span className={isThreatDone ? "text-slate-300" : isRecruiterDone ? "text-slate-100 font-medium" : "text-slate-500"}>
                Threat database pattern search
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isEvidenceDone ? (
                <span className="text-emerald-400 font-bold">✓</span>
              ) : isThreatDone ? (
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-600" />
              )}
              <span className={isEvidenceDone ? "text-slate-300" : isThreatDone ? "text-slate-100 font-medium" : "text-slate-500"}>
                Aggregating evidence
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isFinalDone ? (
                <span className="text-emerald-400 font-bold">✓</span>
              ) : isEvidenceDone ? (
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-600" />
              )}
              <span className={isFinalDone ? "text-slate-300" : isEvidenceDone ? "text-slate-100 font-medium" : "text-slate-500"}>
                Final assessment
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract query candidates for recruiter & company intelligence
  const recruiterQuery = trace.input?.recruiterName || trace.input?.email;
  const companyQuery = trace.input?.company;

  // Once completed or failed, we render the report components in the canonical sequence:
  // 1. VERDICT
  // 2. WHY WAS THIS DETECTED?
  // 3. KEY EVIDENCE
  // 4. RISK BREAKDOWN
  // 5. RECOMMENDATIONS
  // 6. FEEDBACK
  // 7. ADVANCED DETAILS
  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* 1. Verdict */}
      <VerdictHeader 
        finalDecision={trace.finalDecision} 
        totalLatencyMs={trace.totalLatencyMs} 
      />

      {/* 2. Why was this detected? (Signature Centerpiece) */}
      <ExplainabilityPanel 
        investigationId={trace.investigationId} 
        trace={trace}
      />

      {/* 3. Key Evidence */}
      <EvidenceBundleView 
        bundle={trace.evidenceAggregation} 
      />

      {/* 4. Risk Breakdown */}
      <RiskBreakdownSection 
        evaluation={trace.evaluation} 
        finalDecision={trace.finalDecision}
      />

      {/* 5. Job Details */}
      <InputSummaryPanel input={trace.input} />

      {/* 5. Recommendations & Actions */}
      <InvestigationNextActions
        investigationId={trace.investigationId}
        recruiterQuery={recruiterQuery}
        companyQuery={companyQuery}
        onAnalyzeAnother={onReset}
        summaryData={{
          id: trace.investigationId,
          verdict: trace.finalDecision?.verdict,
          riskScore: trace.finalDecision?.riskScore,
          confidence: trace.finalDecision?.confidence,
          reasons: trace.finalDecision?.why,
          recommendations: trace.finalDecision?.recommendations,
          jobText: trace.input?.jobText,
          date: trace.createdAt ? new Date(trace.createdAt).toLocaleString() : undefined,
        }}
      />

      {/* 6. User Feedback */}
      {trace.investigationId && (
        <FeedbackPanel analysisId={trace.investigationId} />
      )}

      {/* 7. Collapsible Advanced Investigation Details */}
      <AdvancedInvestigationDetails 
        trace={trace} 
        evaluation={trace.evaluation} 
      />
    </div>
  );
}
