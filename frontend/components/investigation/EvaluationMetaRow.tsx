import { BetterEvaluation } from "@/lib/investigationTypes";
import { Shield, Users, Layers, AlertCircle } from "lucide-react";

interface EvaluationMetaRowProps {
  evaluation: BetterEvaluation;
}

export function EvaluationMetaRow({ evaluation }: EvaluationMetaRowProps) {
  const getQualityColor = (level: string) => {
    if (level === "High") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (level === "Medium") return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (conf >= 60) return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
    return "text-slate-500 bg-slate-500/10 border-slate-500/20";
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
      <div className={`flex-1 flex items-center justify-between p-4 rounded-lg border ${getQualityColor(evaluation.evidence_quality.level)}`}>
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 opacity-80" />
          <span className="text-sm font-semibold tracking-wide uppercase opacity-80">Evidence Quality</span>
        </div>
        <span className="text-xl font-black">{evaluation.evidence_quality.level}</span>
      </div>

      <div className={`flex-1 flex items-center justify-between p-4 rounded-lg border ${getConfidenceColor(evaluation.confidence)} group relative cursor-help`}>
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 opacity-80" />
          <span className="text-sm font-semibold tracking-wide uppercase opacity-80 flex items-center gap-1">
            Confidence
            <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-current/20 text-[9px] opacity-70">i</span>
          </span>
        </div>
        <span className="text-xl font-black">{Math.round(evaluation.confidence)}%</span>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-800 text-xs text-slate-300 rounded shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
          Confidence reported by the investigation decision system. This value is not yet empirically calibrated as a probability.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-between p-4 rounded-lg border text-slate-400 bg-slate-800/30 border-slate-700/50">
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 opacity-80" />
          <span className="text-sm font-semibold tracking-wide uppercase opacity-80">Sources Used</span>
        </div>
        <span className="text-xl font-black">{evaluation.sources_used}</span>
      </div>
    </div>
  );
}
