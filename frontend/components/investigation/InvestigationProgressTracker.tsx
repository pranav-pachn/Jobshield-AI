"use client";

import { useMemo } from "react";
import { Loader2, CheckCircle2, Shield, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvestigationProgressTrackerProps {
  status: string;
  agentStates: Record<string, { status: string; trace?: any }>;
  onCancel?: () => void;
}

interface StageInfo {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}

export function InvestigationProgressTracker({
  status,
  agentStates,
  onCancel,
}: InvestigationProgressTrackerProps) {
  const isContentDone = agentStates["content_investigator"]?.status === "complete";
  const isRecruiterDone = agentStates["recruiter_investigator"]?.status === "complete";
  const isThreatDone = agentStates["threat_intelligence_agent"]?.status === "complete";
  const isEvidenceDone = agentStates["evidence_aggregator"]?.status === "complete";
  const isFinalDone = agentStates["final_decision_agent"]?.status === "complete";

  const stages: StageInfo[] = useMemo(() => {
    const isInvestigating = status === "INVESTIGATING";
    const isAggregating = status === "EVIDENCE_AGGREGATION";
    const isDeciding = status === "FINAL_DECISION";

    return [
      {
        id: "intake",
        label: "Receiving submitted information",
        description: "Ingesting job text, company domains, and extracted candidate signals",
        isComplete: status !== "STARTING" && status !== "IDLE",
        isActive: status === "STARTING" || status === "PLANNING",
      },
      {
        id: "content",
        label: "Analyzing job content",
        description: "Checking compensation claims, urgency patterns, and advance fee requests",
        isComplete: isContentDone,
        isActive: isInvestigating && !isContentDone,
      },
      {
        id: "recruiter",
        label: "Checking recruiter and company signals",
        description: "Verifying domain age, email authentication, and known recruiter anomalies",
        isComplete: isRecruiterDone,
        isActive: isInvestigating && !isRecruiterDone,
      },
      {
        id: "threat",
        label: "Searching threat intelligence",
        description: "Matching against FTC, FBI IC3 PSAs, and recurring fraud campaigns",
        isComplete: isThreatDone,
        isActive: isInvestigating && !isThreatDone,
      },
      {
        id: "evidence",
        label: "Comparing historical investigations",
        description: "Aggregating multi-agent findings and resolving signal contradictions",
        isComplete: isEvidenceDone,
        isActive: isAggregating && !isEvidenceDone,
      },
      {
        id: "verdict",
        label: "Preparing evidence and final assessment",
        description: "Synthesizing explainable risk scoring and protective recommendations",
        isComplete: isFinalDone,
        isActive: isDeciding && !isFinalDone,
      },
    ];
  }, [status, isContentDone, isRecruiterDone, isThreatDone, isEvidenceDone, isFinalDone]);

  // Overall progress percentage based on completed stages
  const completedCount = stages.filter((s) => s.isComplete).length;
  const progressPercent = Math.min(100, Math.round((completedCount / stages.length) * 100));

  return (
    <div className="rounded-xl border border-slate-800/80 bg-surface-elevated p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-slate-100 tracking-tight">
              Investigating Opportunity
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Autonomous agents are currently cross-referencing signals across multiple threat networks.
            </p>
          </div>
        </div>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-slate-100 shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5 text-slate-400" />
            <span>Cancel Investigation</span>
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>PIPELINE EXECUTION</span>
          <span className="text-blue-400 font-semibold">{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-slate-800/60">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Progress Stages List */}
      <div className="grid grid-cols-1 gap-3 pt-1">
        {stages.map((stage, idx) => (
          <div
            key={stage.id}
            className={`flex items-start gap-3.5 p-3 rounded-lg border transition-colors ${
              stage.isComplete
                ? "bg-black/30 border-slate-800/60 text-slate-300"
                : stage.isActive
                ? "bg-blue-950/20 border-blue-500/30 text-slate-100"
                : "bg-black/10 border-slate-900/40 text-slate-500"
            }`}
          >
            {/* Status indicator */}
            <div className="mt-0.5 shrink-0">
              {stage.isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : stage.isActive ? (
                <div className="relative flex items-center justify-center w-4 h-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-600">
                  {idx + 1}
                </div>
              )}
            </div>

            {/* Label and description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-medium ${
                    stage.isComplete
                      ? "text-slate-200"
                      : stage.isActive
                      ? "text-blue-300 font-semibold"
                      : "text-slate-500"
                  }`}
                >
                  {stage.label}
                </span>
                {stage.isActive && (
                  <span className="text-[10px] font-mono text-blue-400 animate-pulse uppercase tracking-wider shrink-0">
                    Running...
                  </span>
                )}
                {stage.isComplete && (
                  <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                    Complete
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed truncate sm:whitespace-normal">
                {stage.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-sans border-t border-slate-800/60 pt-4">
        <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Live telemetry stream connected. Do not close this tab while the analysis completes.
        </span>
      </div>
    </div>
  );
}
