"use client";

import { InvestigationTrace, ContentInvestigatorOutput } from "@/lib/investigationTypes";
import { CheckCircle2, XCircle, AlertCircle, FileText, UserSearch, ShieldAlert } from "lucide-react";

interface AgentCardsProps {
  trace: InvestigationTrace;
}

export function AgentCards({ trace }: AgentCardsProps) {
  
  const getAgentStatus = (findings: any, agentName: string) => {
    if (!findings) return { status: "pending", text: "Pending", icon: AlertCircle, color: "text-slate-500" };
    if (findings.status === "failed") return { status: "failed", text: "Failed", icon: XCircle, color: "text-red-500" };
    if (findings.status === "insufficient_evidence") return { status: "limited", text: "Limited Evidence", icon: AlertCircle, color: "text-amber-500" };
    return { status: "complete", text: "✓ Complete", icon: CheckCircle2, color: "text-emerald-500" };
  };

  const getContentFinding = () => {
    if (!trace.contentFindings) return "Waiting for analysis...";
    if ('status' in trace.contentFindings && trace.contentFindings.status === "failed") return "Analysis failed to complete.";
    const findings = trace.contentFindings as ContentInvestigatorOutput;
    if (findings.riskSignals && findings.riskSignals.length > 0) {
      return `${findings.riskSignals.length} risk signals detected`;
    }
    return "No obvious content risks detected";
  };

  const getRecruiterFinding = () => {
    if (!trace.recruiterFindings) return "Waiting for verification...";
    if ('status' in trace.recruiterFindings && trace.recruiterFindings.status === "failed") return "Verification failed to complete.";
    if ('status' in trace.recruiterFindings && trace.recruiterFindings.status === "insufficient_evidence") return "Could not verify identity.";
    const findings = trace.recruiterFindings as any;
    if (findings.identitySignals && findings.identitySignals.length > 0) {
      return "Identity inconsistencies found";
    }
    return "Identity appears consistent";
  };

  const getThreatFinding = () => {
    if (!trace.threatFindings) return "Waiting for threat intel...";
    if ('status' in trace.threatFindings && trace.threatFindings.status === "failed") return "Threat lookup failed.";
    if ('status' in trace.threatFindings && (trace.threatFindings.status as any) === "insufficient_evidence") return "No direct threat matches.";
    const findings = trace.threatFindings as any;
    if (findings.matches && findings.matches.length > 0) {
      return `${findings.matches.length} threat matches found`;
    }
    return "No known threat patterns matched";
  };

  const contentStatus = getAgentStatus(trace.contentFindings, "Content");
  const recruiterStatus = getAgentStatus(trace.recruiterFindings, "Recruiter");
  const threatStatus = getAgentStatus(trace.threatFindings, "Threat Intel");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Content Investigator Card */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-200">Content</h3>
          </div>
          <span className={`text-xs font-semibold tracking-wide ${contentStatus.color}`}>
            {contentStatus.text}
          </span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed font-medium">
          {getContentFinding()}
        </p>
      </div>

      {/* Recruiter Investigator Card */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <UserSearch className="h-4 w-4 text-purple-400" />
            </div>
            <h3 className="font-semibold text-slate-200">Recruiter</h3>
          </div>
          <span className={`text-xs font-semibold tracking-wide ${recruiterStatus.color}`}>
            {recruiterStatus.text}
          </span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed font-medium">
          {getRecruiterFinding()}
        </p>
      </div>

      {/* Threat Intel Card */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
            </div>
            <h3 className="font-semibold text-slate-200">Threat Intel</h3>
          </div>
          <span className={`text-xs font-semibold tracking-wide ${threatStatus.color}`}>
            {threatStatus.text}
          </span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed font-medium">
          {getThreatFinding()}
        </p>
      </div>
    </div>
  );
}
