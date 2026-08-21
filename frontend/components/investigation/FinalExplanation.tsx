"use client";

import { FinalDecisionOutput } from "@/lib/investigationTypes";
import { HelpCircle, CheckCircle2 } from "lucide-react";

interface FinalExplanationProps {
  finalDecision?: FinalDecisionOutput;
}

export function FinalExplanation({ finalDecision }: FinalExplanationProps) {
  if (!finalDecision) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-8">
      {/* Why This Verdict */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-blue-400" />
          Why This Verdict?
        </h3>
        <ol className="list-decimal list-inside space-y-3 text-slate-300">
          {finalDecision.why.map((reason, idx) => (
            <li key={idx} className="text-sm leading-relaxed pl-2 marker:text-slate-500 marker:font-bold">
              {reason}
            </li>
          ))}
        </ol>
      </div>

      {/* Recommended Actions */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Recommended Actions
        </h3>
        <ul className="space-y-3 text-slate-300">
          {finalDecision.recommendations.map((action, idx) => (
            <li key={idx} className="text-sm leading-relaxed flex items-start gap-3">
              <span className="text-emerald-500 mt-0.5">•</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
