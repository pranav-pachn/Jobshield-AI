import { BetterEvaluation } from "@/lib/investigationTypes";
import { MetricCard } from "../security/MetricCard";

interface EvaluationDashboardProps {
  evaluation: BetterEvaluation;
}

export function EvaluationDashboard({ evaluation }: EvaluationDashboardProps) {
  const getRiskColor = (score: number) => {
    if (score >= 60) return "text-red-500 border-red-500/50 bg-red-950/30 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]";
    if (score >= 40) return "text-amber-500 border-amber-500/50 bg-amber-950/30 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]";
    return "text-emerald-500 border-emerald-500/50 bg-emerald-950/30 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]";
  };

  const getRiskBg = (score: number) => {
    if (score >= 60) return "bg-red-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const riskScore = evaluation.overall_risk.score;
  const overallLabel = evaluation.overall_risk.label;

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
      {/* Overall Risk Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-200">INVESTIGATION EVALUATION</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">Overall Risk</span>
            <span className={`text-2xl font-black ${getRiskColor(riskScore).split(" ")[0]}`}>
              {Math.round(riskScore)}%
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider ${getRiskColor(riskScore)}`}>
              {overallLabel}
            </span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getRiskBg(riskScore)} transition-all duration-1000 ease-out`}
            style={{ width: `${riskScore}%` }}
          />
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        <div className="p-6 flex flex-col space-y-2 hover:bg-slate-800/50 transition-colors">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Content Risk</h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-200">{Math.round(evaluation.content_risk.score)}%</span>
            <span className={`text-sm font-bold uppercase tracking-wider mb-1 ${getRiskColor(evaluation.content_risk.score).split(" ")[0]}`}>
              {evaluation.content_risk.label}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col space-y-2 hover:bg-slate-800/50 transition-colors border-t md:border-t-0 border-slate-800">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Recruiter Trust</h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-200">{Math.round(evaluation.recruiter_trust.score)}%</span>
            <span className={`text-sm font-bold uppercase tracking-wider mb-1 ${
                evaluation.recruiter_trust.score < 40 ? "text-red-500" :
                evaluation.recruiter_trust.score < 60 ? "text-amber-500" : "text-emerald-500"
            }`}>
              {evaluation.recruiter_trust.label}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col space-y-2 hover:bg-slate-800/50 transition-colors border-t border-slate-800">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Threat Match</h4>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-200">{Math.round(evaluation.threat_match.score)}%</span>
            <span className={`text-sm font-bold uppercase tracking-wider mb-1 ${getRiskColor(evaluation.threat_match.score).split(" ")[0]}`}>
              {evaluation.threat_match.label}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col space-y-2 hover:bg-slate-800/50 transition-colors border-t border-slate-800">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Historical Similarity</h4>
            <div className="group relative cursor-help">
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-slate-700 text-[10px] text-slate-300">i</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-xs text-slate-300 rounded shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Similarity between this job and retrieved historical threat intelligence. Not a probability of fraud.
              </div>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-200">{Math.round(evaluation.historical_similarity.score)}%</span>
            <span className={`text-sm font-bold uppercase tracking-wider mb-1 ${getRiskColor(evaluation.historical_similarity.score).split(" ")[0]}`}>
              {evaluation.historical_similarity.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
