"use client";

import { InvestigationTrace } from "@/lib/investigationTypes";
import { VerdictHeader } from "./VerdictHeader";
import { AgentCards } from "./AgentCards";
import { EvidenceBundleView } from "./EvidenceBundleView";
import { ContradictionsView } from "./ContradictionsView";
import { FinalExplanation } from "./FinalExplanation";
import { InvestigationTraceDrawer } from "./InvestigationTraceDrawer";
import { EvaluationDashboard } from "./EvaluationDashboard";
import { EvaluationMetaRow } from "./EvaluationMetaRow";
import { EvaluationExplainDrawer } from "./EvaluationExplainDrawer";
import { ExplainabilityPanel } from "./ExplainabilityPanel";
import { InvestigationTimeline } from "./InvestigationTimeline";
import { FeedbackPanel } from "./explainabilityV2/FeedbackPanel";
import { InvestigationNextActions } from "./InvestigationNextActions";


interface InvestigationReportProps {
  trace: InvestigationTrace;
  onReset?: () => void;
}

export function InvestigationReport({ trace, onReset }: InvestigationReportProps) {
  // If the investigation is still running or preparing
  if (trace.state !== "COMPLETED" && trace.state !== "FAILED") {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="p-8 rounded-xl bg-[#090d16] border border-slate-800 flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="h-9 w-9 rounded-full border-2 border-t-[#00ff88] border-r-blue-500 border-b-transparent border-l-transparent animate-spin"></div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white tracking-wide font-display">
              Job Investigation in Progress
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Investigating the job and checking related signals across threat intelligence...
            </p>
          </div>
          <div className="flex flex-col space-y-2 text-xs font-mono text-slate-400 pt-2 w-full max-w-md">
            <div className="flex items-center gap-2">
              {trace.contentFindings ? <span className="text-emerald-500 font-bold">✓</span> : <span className="animate-pulse text-blue-400">◉</span>} 
              <span>Content analysis {trace.contentFindings ? "complete" : "in progress..."}</span>
            </div>
            <div className="flex items-center gap-2">
              {trace.recruiterFindings ? <span className="text-emerald-500 font-bold">✓</span> : <span className="animate-pulse text-blue-400">◉</span>} 
              <span>Recruiter consistency {trace.recruiterFindings ? "checked" : "in progress..."}</span>
            </div>
            <div className="flex items-center gap-2">
              {trace.threatFindings ? <span className="text-emerald-500 font-bold">✓</span> : <span className="animate-pulse text-blue-400">◉</span>} 
              <span>Searching threat intelligence {trace.threatFindings ? "complete" : "in progress..."}</span>
            </div>
            <div className="flex items-center gap-2">
              {trace.evidenceAggregation ? <span className="text-emerald-500 font-bold">✓</span> : <span className="text-slate-600">○</span>} 
              <span>Aggregating evidence</span>
            </div>
            <div className="flex items-center gap-2">
              {trace.finalDecision ? <span className="text-emerald-500 font-bold">✓</span> : <span className="text-slate-600">○</span>} 
              <span>Preparing final assessment</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract query candidates for recruiter & company intelligence
  const recruiterQuery = trace.input?.recruiterName || trace.input?.email;
  const companyQuery = trace.input?.company;

  // Once completed or failed, we render the report components
  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <VerdictHeader 
        finalDecision={trace.finalDecision} 
        totalLatencyMs={trace.totalLatencyMs} 
      />

      {trace.evaluation && (
        <>
          <EvaluationDashboard evaluation={trace.evaluation} />
          <EvaluationMetaRow evaluation={trace.evaluation} />
          <EvaluationExplainDrawer trace={trace} evaluation={trace.evaluation} />
        </>
      )}

      <AgentCards trace={trace} />

      <EvidenceBundleView bundle={trace.evidenceAggregation} />

      <ContradictionsView trace={trace} />

      <ExplainabilityPanel investigationId={trace.investigationId} />

      <FinalExplanation finalDecision={trace.finalDecision} />

      {/* User Feedback Panel */}
      {trace.investigationId && (
        <FeedbackPanel analysisId={trace.investigationId} />
      )}

      {/* Next Actions */}
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

      <InvestigationTimeline investigationId={trace.investigationId} />

      <InvestigationTraceDrawer trace={trace} />
    </div>
  );
}

