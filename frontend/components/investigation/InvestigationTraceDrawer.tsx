"use client";

import { useState } from "react";
import { InvestigationTrace, AgentTrace } from "@/lib/investigationTypes";
import { ChevronDown, ChevronUp, Terminal, Activity, CheckCircle2, XCircle } from "lucide-react";

interface InvestigationTraceDrawerProps {
  trace: InvestigationTrace;
}

export function InvestigationTraceDrawer({ trace }: InvestigationTraceDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getAgentLabel = (agentName: string) => {
    switch(agentName) {
      case "content_investigator": return "Content Investigator";
      case "recruiter_investigator": return "Recruiter Investigator";
      case "threat_intelligence": return "Threat Intelligence";
      case "evidence_aggregator": return "Evidence Aggregation";
      case "final_decision": return "Final Decision";
      default: return agentName;
    }
  };

  return (
    <div className="mt-12 mb-8">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
        >
          <Terminal className="h-4 w-4" />
          {isOpen ? "Hide Investigation Trace" : "View Investigation Trace"}
          {isOpen ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-6 rounded-xl bg-[#0b1220] border border-slate-800 font-mono text-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Activity className="h-4 w-4" />
              <span className="uppercase tracking-widest font-bold text-xs">Diagnostic Trace</span>
            </div>
            {trace.degradationReason && (
              <span className="text-orange-400 text-xs px-2 py-1 bg-orange-500/10 rounded-md border border-orange-500/20">
                Reason: {trace.degradationReason}
              </span>
            )}
          </div>

          <div className="space-y-4">
            {trace.agentTraces.map((t: AgentTrace, idx: number) => (
              <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg bg-black/40 border border-slate-800/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {t.status === "failed" ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    <span className="font-semibold text-slate-200">{getAgentLabel(t.agentName)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={t.status === "failed" ? "text-red-400 text-xs font-bold uppercase tracking-wider" : "text-emerald-400 text-xs font-bold uppercase tracking-wider"}>
                      {t.status}
                    </span>
                    <span className="text-slate-500">{t.latencyMs}ms</span>
                  </div>
                </div>
                
                {t.providerAttempts && t.providerAttempts.length > 0 && (
                  <div className="mt-2 pl-6">
                    <div className="text-xs uppercase tracking-widest text-slate-600 mb-2 border-b border-slate-800 pb-1">Provider Execution</div>
                    <div className="space-y-2">
                      {t.providerAttempts.map((attempt, aIdx) => (
                        <div key={aIdx} className="grid grid-cols-12 gap-2 text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/50">
                          <div className="col-span-3 font-semibold text-slate-300">{attempt.provider}</div>
                          <div className={`col-span-4 ${attempt.status === 'SUCCESS' ? 'text-emerald-400' : 'text-orange-400'}`}>
                            {attempt.status}
                          </div>
                          <div className="col-span-2 text-slate-500">{attempt.latencyMs}ms</div>
                          <div className="col-span-3 truncate" title={attempt.model}>{attempt.model}</div>
                          {attempt.error && (
                            <div className="col-span-12 text-red-400 mt-1 text-[10px] break-all">{attempt.error}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-900/10 border border-blue-500/20 mt-4">
              <span className="font-bold text-blue-400 uppercase tracking-widest text-xs">Total Pipeline Latency</span>
              <span className="font-bold text-blue-400">{trace.totalLatencyMs || 0}ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
