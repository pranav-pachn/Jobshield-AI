"use client";

import { useState } from "react";
import { InvestigationTrace, BetterEvaluation } from "@/lib/investigationTypes";
import { ChevronDown, Code2, Copy, Check } from "lucide-react";
import { AgentCards } from "./AgentCards";
import { EvaluationDashboard } from "./EvaluationDashboard";
import { EvaluationMetaRow } from "./EvaluationMetaRow";
import { EvaluationExplainDrawer } from "./EvaluationExplainDrawer";
import { ContradictionsView } from "./ContradictionsView";
import { InvestigationTimeline } from "./InvestigationTimeline";
import { InvestigationTraceDrawer } from "./InvestigationTraceDrawer";

interface AdvancedInvestigationDetailsProps {
  trace: InvestigationTrace;
  evaluation?: BetterEvaluation;
}

export function AdvancedInvestigationDetails({ trace, evaluation }: AdvancedInvestigationDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (trace.investigationId) {
      navigator.clipboard.writeText(trace.investigationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatId = (id?: string) => {
    if (!id) return "N/A";
    if (id.length <= 14) return id;
    return `${id.substring(0, 8)}...${id.substring(id.length - 6)}`;
  };

  return (
    <section aria-label="Advanced Investigation Details" className="mt-8 border-t border-slate-800/80 pt-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 rounded-lg bg-surface-elevated border border-slate-800 hover:border-slate-700 transition-colors text-left group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <Code2 className="h-4 w-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
          <div>
            <span className="text-sm font-medium text-slate-200 block font-sans">
              Advanced Investigation Details
            </span>
            <span className="text-xs text-slate-500 font-sans">
              Agent execution traces, contradiction telemetry, and evaluation weights
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{isOpen ? "Hide" : "Show"}</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-4">
            <div className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
              Investigation Metadata
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-surface-elevated border border-slate-800/80">
                <span className="text-xs text-slate-500 font-sans block mb-1">Investigation ID</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-slate-200">{formatId(trace.investigationId)}</span>
                  {trace.investigationId && (
                    <button onClick={handleCopy} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors">
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-surface-elevated border border-slate-800/80">
                <span className="text-xs text-slate-500 font-sans block mb-1">Created</span>
                <span className="font-mono text-sm text-slate-200">
                  {trace.createdAt ? new Date(trace.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          {evaluation && (
            <div className="space-y-4">
              <div className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
                Evaluation Weights & Model Telemetry
              </div>
              <EvaluationDashboard evaluation={evaluation} />
              <EvaluationMetaRow evaluation={evaluation} />
              <EvaluationExplainDrawer trace={trace} evaluation={evaluation} />
            </div>
          )}

          <div className="space-y-4">
            <div className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
              Multi-Agent Execution Pipeline
            </div>
            <AgentCards trace={trace} />
          </div>

          <ContradictionsView trace={trace} />

          <InvestigationTimeline investigationId={trace.investigationId} />

          <InvestigationTraceDrawer trace={trace} />
        </div>
      )}
    </section>
  );
}
