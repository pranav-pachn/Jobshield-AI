import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

interface EvidenceSummaryProps {
  evidence: any[];
  contradictions: any[];
}

export function EvidenceSummary({ evidence, contradictions }: EvidenceSummaryProps) {
  const highQualityEvidence = evidence.filter(e => e.similarity && e.similarity >= 0.8).length;
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4 shadow-xl flex gap-4">
      <div className="flex-1 bg-slate-800/30 rounded-lg p-4 border border-slate-700/30 text-center">
        <ShieldAlert className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-80" />
        <div className="text-2xl font-bold text-slate-200">{evidence.length}</div>
        <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Total Evidence</div>
      </div>
      
      <div className="flex-1 bg-slate-800/30 rounded-lg p-4 border border-slate-700/30 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
        <div className="text-2xl font-bold text-slate-200">{highQualityEvidence}</div>
        <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">High Quality</div>
      </div>
      
      <div className="flex-1 bg-slate-800/30 rounded-lg p-4 border border-slate-700/30 text-center">
        <AlertTriangle className={`w-8 h-8 mx-auto mb-2 opacity-80 ${contradictions.length > 0 ? "text-amber-400" : "text-slate-500"}`} />
        <div className="text-2xl font-bold text-slate-200">{contradictions.length}</div>
        <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Contradictions</div>
      </div>
    </div>
  );
}
