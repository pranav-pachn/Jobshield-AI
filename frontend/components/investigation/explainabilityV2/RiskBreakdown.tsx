import { CheckCircle2, AlertTriangle, Info, AlertCircle } from "lucide-react";

export function RiskBreakdown({ breakdown }: { breakdown: { signal: string; contribution: number }[] }) {
  if (!breakdown || breakdown.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4 shadow-xl">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-indigo-400" /> Risk Ledger
      </h3>
      
      <div className="space-y-3">
        {breakdown.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700/50">
            <span className="text-slate-300 font-medium capitalize">{item.signal.replace(/_/g, " ")}</span>
            <div className={`font-bold flex items-center gap-1 ${item.contribution > 0 ? "text-rose-400" : item.contribution < 0 ? "text-emerald-400" : "text-slate-400"}`}>
              {item.contribution > 0 ? "+" : ""}{item.contribution} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
