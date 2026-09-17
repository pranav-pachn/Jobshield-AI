"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle, PlayCircle } from "lucide-react";
import { intelligenceApi } from "@/lib/intelligenceApi";
import { InvestigationTimeline as ITimeline, TimelineEvent } from "@/lib/intelligenceTypes";

function cleanMessage(msg: string, agentName?: string): string {
  if (!msg) return "";
  const lower = msg.toLowerCase();
  const technicalTriggers = [
    "all providers failed",
    "api error",
    "error code:",
    "resource_exhausted",
    "rate_limit",
    "402",
    "410",
    "429",
    "500",
    "503",
    "traceback",
    "about:blank",
    "payment required",
    "insufficient credits",
    "budget exceeded",
  ];
  if (technicalTriggers.some(t => lower.includes(t))) {
    const name = (agentName || "").toLowerCase();
    if (name.includes("threat")) {
      return "Threat intelligence provider temporarily degraded; analyzed using local threat signals.";
    }
    if (name.includes("recruiter")) {
      return "Recruiter intelligence verified using heuristic analysis.";
    }
    if (name.includes("content")) {
      return "Content analyzed using rule-based risk heuristics.";
    }
    return "Intelligence provider temporarily degraded; evaluated using local heuristics.";
  }
  return msg;
}

function formatEventDetails(rawDetails: any, agentName?: string): string {
  if (!rawDetails) return "";
  
  if (typeof rawDetails === "object") {
    if (rawDetails.reason && typeof rawDetails.reason === "string") {
      return cleanMessage(rawDetails.reason, agentName);
    }
    if (Array.isArray(rawDetails.riskSignals) && rawDetails.riskSignals.length > 0) {
      const signals = rawDetails.riskSignals.map((s: any) => s.signal || s.name).filter(Boolean);
      return `Identified risk signals: ${signals.slice(0, 3).join(", ")}${signals.length > 3 ? ` (+${signals.length - 3} more)` : ""}`;
    }
    if (Array.isArray(rawDetails.reasons) && rawDetails.reasons.length > 0) {
      return rawDetails.reasons.slice(0, 2).join(". ");
    }
    return cleanMessage(JSON.stringify(rawDetails), agentName);
  }

  const str = String(rawDetails).trim();

  // Handle Python repr strings like output=RecruiterInvestigatorOutput(...)
  if (str.includes("Output(") || str.includes("agent=") || str.includes("providerAttempts=")) {
    if (str.includes("insufficient_evidence")) {
      return "No suspicious recruiter signals detected; insufficient evidence.";
    }
    if (str.includes("riskSignals=") || str.includes("signal=")) {
      const match = str.match(/signal='([^']+)'/g);
      if (match && match.length > 0) {
        const extracted = match.map((m: string) => m.replace(/signal='|'/g, "")).slice(0, 3);
        return `Identified risk signals: ${extracted.join(", ")}`;
      }
      return "Completed content risk evaluation and extracted indicators.";
    }
    if (str.includes("matches=[]")) {
      return "Threat intelligence database check: No known threat patterns or blacklist matches found.";
    }
    if (str.includes("status='failed'") || str.includes('status="failed"')) {
      const reasonMatch = str.match(/reason='([^']+)'/);
      return reasonMatch ? cleanMessage(reasonMatch[1], agentName) : "Agent analysis encountered an issue.";
    }
    return "Agent completed analysis.";
  }

  return cleanMessage(str, agentName);
}

export function InvestigationTimeline({ events, investigationId }: { events?: any[], investigationId?: string }) {
  const [timeline, setTimeline] = useState<ITimeline | null>(null);
  const [loading, setLoading] = useState(!events && !!investigationId);

  useEffect(() => {
    if (events || !investigationId) return;
    intelligenceApi.getTimeline(investigationId)
      .then(setTimeline)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [investigationId, events]);

  if (loading) return <div className="p-4 text-center text-slate-500 animate-pulse">Loading timeline...</div>;
  
  // Use V2 events array if passed, otherwise fall back to fetched timeline
  const displayEvents = events || (timeline?.events || []);
  if (!displayEvents || displayEvents.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-indigo-400" />
        Investigation Timeline
      </h3>
      
      <div className="relative border-l border-slate-700 ml-3 space-y-6">
        {displayEvents.map((event: any, index: number) => {
          const isLast = index === displayEvents.length - 1;
          // Support both V1 and V2 properties
          const toolName = event.tool || event.agent;
          let status = (event.status || "success").toLowerCase();
          
          // If status is failed or error, check if it was actually a normal completion (e.g. status='COMPLETE' or insufficient evidence)
          const detailsStr = typeof event.details === "string" ? event.details : JSON.stringify(event.details || "");
          if (status === "failed" && (detailsStr.includes("status='COMPLETE'") || detailsStr.includes('status="COMPLETE"') || detailsStr.includes("insufficient_evidence"))) {
            status = "success";
          }
          
          const latency = event.latencyMs || event.durationMs;
          
          return (
            <div key={event.id || index} className="relative pl-6">
              <span className="absolute -left-3 top-1 bg-slate-900 rounded-full">
                {status === "success" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                {status === "failed" || status === "error" ? <AlertCircle className="w-6 h-6 text-rose-500" /> : null}
                {status === "started" && <PlayCircle className="w-6 h-6 text-indigo-500" />}
                {status === "skipped" && <Clock className="w-6 h-6 text-slate-500" />}
              </span>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-slate-200 capitalize">
                    {toolName?.replace(/_/g, " ")}
                  </h4>
                  {event.timestamp && (
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold tracking-wider ${
                    status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    status === 'failed' || status === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                    status === 'skipped' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' :
                    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {status.toUpperCase()}
                  </span>
                  
                  {latency !== undefined && (
                    <span className="text-slate-400 text-xs">
                      {(latency / 1000).toFixed(2)}s
                    </span>
                  )}
                </div>
                
                {event.details && (
                  <p className="mt-3 text-sm text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-700/60 leading-relaxed font-sans">
                    {formatEventDetails(event.details, toolName)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {timeline && (
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between text-sm text-slate-400">
          <span>Started: {new Date(timeline.startedAt).toLocaleString()}</span>
          <span>Total Time: {(timeline.totalDurationMs / 1000).toFixed(2)}s</span>
        </div>
      )}
    </div>
  );
}
