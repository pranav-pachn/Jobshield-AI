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

interface InvestigationReportProps {
  trace: InvestigationTrace;
}

export function InvestigationReport({ trace }: InvestigationReportProps) {
  // If the investigation is still running or preparing
  if (trace.state !== "COMPLETED" && trace.state !== "FAILED") {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-4">
          <div className="h-8 w-8 rounded-full border-2 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent animate-spin"></div>
          <h2 className="text-xl font-bold text-white tracking-wider">DEEP INVESTIGATION</h2>
          <div className="flex flex-col space-y-2 text-sm font-mono text-slate-400">
            <div className="flex items-center gap-2">
              {trace.contentFindings ? <span className="text-emerald-500">✓</span> : <span className="animate-pulse text-blue-400">◉</span>} 
              <span>Content analysis {trace.contentFindings ? "complete" : "in progress..."}</span>
            </div>
            <div className="flex items-center gap-2">
              {trace.recruiterFindings ? <span className="text-emerald-500">✓</span> : <span className="animate-pulse text-blue-400">◉</span>} 
              <span>Recruiter consistency {trace.recruiterFindings ? "checked" : "in progress..."}</span>
            </div>
            <div className="flex items-center gap-2">
              {trace.threatFindings ? <span className="text-emerald-500">✓</span> : <span className="animate-pulse text-blue-400">◉</span>} 
              <span>Searching threat intelligence {trace.threatFindings ? "complete" : "in progress..."}</span>
            </div>
            <div className="flex items-center gap-2">
              {trace.evidenceAggregation ? <span className="text-emerald-500">✓</span> : <span className="text-slate-600">○</span>} 
              <span>Aggregating evidence</span>
            </div>
            <div className="flex items-center gap-2">
              {trace.finalDecision ? <span className="text-emerald-500">✓</span> : <span className="text-slate-600">○</span>} 
              <span>Preparing final assessment</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

      <InvestigationTimeline investigationId={trace.investigationId} />

      <InvestigationTraceDrawer trace={trace} />
    </div>
  );
}
