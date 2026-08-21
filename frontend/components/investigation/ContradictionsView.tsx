"use client";

import { EvidenceBundle, InvestigationTrace } from "@/lib/investigationTypes";
import { AlertTriangle, Info } from "lucide-react";

interface ContradictionsViewProps {
  trace: InvestigationTrace;
}

export function ContradictionsView({ trace }: ContradictionsViewProps) {
  const bundle = trace.evidenceAggregation;
  const hasContradictions = bundle && bundle.contradictionDetails && bundle.contradictionDetails.length > 0;
  
  // Collect any agent failures (graceful degradation)
  const missingEvidence: Array<{ agent: string; reason: string }> = [];
  
  if (trace.contentFindings && "status" in trace.contentFindings && trace.contentFindings.status !== "success") {
    if ("reason" in trace.contentFindings) {
      missingEvidence.push({ agent: "Content Investigator", reason: trace.contentFindings.reason });
    }
  }
  
  if (trace.recruiterFindings && "status" in trace.recruiterFindings && trace.recruiterFindings.status !== "success") {
    if (trace.recruiterFindings.status === "insufficient_evidence") {
      missingEvidence.push({ agent: "Recruiter Investigator", reason: "No recruiter email or LinkedIn profile was provided." });
    } else if ("reason" in trace.recruiterFindings) {
      missingEvidence.push({ agent: "Recruiter Investigator", reason: trace.recruiterFindings.reason });
    }
  }

  if (trace.threatFindings && "status" in trace.threatFindings && trace.threatFindings.status !== "success") {
    if ("reason" in trace.threatFindings) {
      missingEvidence.push({ agent: "Threat Intelligence", reason: trace.threatFindings.reason });
    }
  }

  if (!hasContradictions && missingEvidence.length === 0) {
    return (
      <div className="mt-8 mb-8 text-center">
        <p className="text-sm font-medium text-emerald-500 flex items-center justify-center gap-2">
          <span>✓</span> No significant contradictions or missing evidence detected
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 space-y-6">
      {hasContradictions && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2 before:h-px before:flex-1 before:bg-slate-800 after:h-px after:flex-1 after:bg-slate-800">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Contradictions Detected
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {bundle.contradictionDetails.map((c, i) => (
              <div key={i} className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 flex flex-col gap-2">
                <p className="text-sm text-slate-300 font-medium">{c.description}</p>
                <div className="text-xs text-slate-500">
                  <span className="font-bold uppercase tracking-wider text-amber-500/70 mr-2">Impact</span>
                  Final confidence adjusted due to conflict between: {c.agents.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {missingEvidence.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2 before:h-px before:flex-1 before:bg-slate-800 after:h-px after:flex-1 after:bg-slate-800">
            <Info className="h-4 w-4 text-blue-400" />
            Limited Evidence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {missingEvidence.map((m, i) => (
              <div key={i} className="p-4 rounded-xl bg-blue-950/10 border border-blue-500/20 flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{m.agent}</span>
                <p className="text-sm text-slate-400">{m.reason}</p>
                <p className="text-xs text-slate-500 italic mt-1">This did not prevent the investigation from completing.</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
