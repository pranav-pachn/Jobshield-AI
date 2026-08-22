import { BetterEvaluation, InvestigationTrace } from "@/lib/investigationTypes";
import { ChevronDown, AlertTriangle, Info, CheckCircle2, FileText, UserCheck, ShieldAlert } from "lucide-react";
import { useState } from "react";

interface EvaluationExplainDrawerProps {
  trace: InvestigationTrace;
  evaluation: BetterEvaluation;
}

export function EvaluationExplainDrawer({ trace, evaluation }: EvaluationExplainDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const contentSignals = trace.contentFindings && "riskSignals" in trace.contentFindings ? trace.contentFindings.riskSignals : [];
  const recruiterSignals = trace.recruiterFindings && "identitySignals" in trace.recruiterFindings ? trace.recruiterFindings.identitySignals : [];
  const threatMatches = trace.threatFindings && "matches" in trace.threatFindings ? trace.threatFindings.matches : [];
  const topThreat = threatMatches.length > 0 ? threatMatches.reduce((prev, current) => (prev.similarity > current.similarity) ? prev : current) : null;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-slate-400" />
          <span className="font-semibold text-slate-200 tracking-wide">How was this calculated?</span>
        </div>
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="p-6 pt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-300">
          
          {/* Content Risk Explainer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-slate-400" />
              <h4 className="font-bold text-slate-200">Content Risk — {Math.round(evaluation.content_risk.score)}%</h4>
            </div>
            
            <div className="space-y-3 text-sm">
              <p className="text-slate-400 font-semibold mb-2">Why?</p>
              {contentSignals.length === 0 ? (
                <p className="text-slate-500 italic">No specific signals detected. Using base score.</p>
              ) : (
                <ul className="space-y-2">
                  {contentSignals.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      {s.severity === 'high' || s.severity === 'critical' ? (
                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <span>
                        <span className="font-semibold">{s.signal.replace(/_/g, ' ')}:</span> {s.evidence}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pt-2 border-t border-slate-800 mt-4 text-slate-500 font-mono text-xs">
                Evidence: {contentSignals.length} signals
              </div>
            </div>
          </div>

          {/* Recruiter Trust Explainer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="h-5 w-5 text-slate-400" />
              <h4 className="font-bold text-slate-200">Recruiter Trust — {Math.round(evaluation.recruiter_trust.score)}%</h4>
            </div>
            
            <div className="space-y-3 text-sm">
              <p className="text-slate-400 font-semibold mb-2">Why?</p>
              {recruiterSignals.length === 0 ? (
                <p className="text-slate-500 italic">Limited independent identity evidence.</p>
              ) : (
                <ul className="space-y-2">
                  {recruiterSignals.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      {s.severity === 'high' || s.severity === 'critical' ? (
                        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <span>
                        <span className="font-semibold">{s.signal.replace(/_/g, ' ')}:</span> {s.evidence}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="pt-2 border-t border-slate-800 mt-4 text-slate-500 font-mono text-xs">
                Evidence: {recruiterSignals.length} signals
              </div>
            </div>
          </div>

          {/* Threat Match Explainer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-5 w-5 text-slate-400" />
              <h4 className="font-bold text-slate-200">Threat Match — {Math.round(evaluation.threat_match.score)}%</h4>
            </div>
            
            <div className="space-y-3 text-sm">
              {topThreat ? (
                <>
                  <p className="text-slate-400 font-semibold mb-2">Top match:</p>
                  <p className="text-slate-300">{topThreat.evidence}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800 text-xs">
                    <div>
                      <span className="block text-slate-500 mb-1">Similarity</span>
                      <span className="text-slate-300 font-mono">{topThreat.similarity.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1">Source</span>
                      <span className="text-slate-300 font-mono">{topThreat.sourceId}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-slate-500 italic">No significant threat matches found.</p>
              )}
            </div>
          </div>

          {/* Formula Section (Full Width) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 pt-4 border-t border-slate-800 bg-slate-950/50 -mx-6 p-6 pb-2">
            <p className="text-xs text-slate-500 mb-2 font-mono">CALCULATION FORMULA (V1 Policy Weights)</p>
            <div className="font-mono text-xs text-slate-400 bg-slate-900 p-4 rounded border border-slate-800 inline-block overflow-x-auto w-full">
              Overall Risk = (Content Risk × 0.35) + ((100 - Recruiter Trust) × 0.20) + (Threat Match × 0.25) + (Historical Similarity × 0.20)
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
