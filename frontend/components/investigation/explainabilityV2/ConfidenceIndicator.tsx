import { Shield, Sparkles } from "lucide-react";

export function ConfidenceIndicator({ confidence, quality }: { confidence: number; quality: number }) {
  const getQualityLabel = (q: number) => {
    if (q >= 80) return { label: "High", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (q >= 50) return { label: "Medium", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    return { label: "Low", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" };
  };

  const qStyle = getQualityLabel(quality);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" /> Evidence Quality
      </h3>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-3xl font-black text-slate-100">{confidence}%</span>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Overall Confidence</span>
        </div>
        
        <div className="h-10 w-px bg-slate-800"></div>
        
        <div className="flex flex-col items-end">
          <span className={`text-lg font-bold px-3 py-1 rounded-full border ${qStyle.bg} ${qStyle.border} ${qStyle.color}`}>
            {qStyle.label} Quality
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">{quality}% Evidence Score</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${quality}%` }}></div>
        </div>
      </div>
    </div>
  );
}
