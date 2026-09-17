"use client";

import { AnalyticsOverview } from "@/lib/intelligenceTypes";

interface Props {
  overview: AnalyticsOverview | null;
}

export function DecisionDistributionChart({ overview }: Props) {
  if (!overview) return null;

  const total = overview.scamCount + overview.legitimateCount + overview.humanReviewCount;
  
  if (total === 0) {
    return (
      <div className="py-8 flex items-center justify-center text-slate-500 text-xs font-mono uppercase tracking-widest border border-slate-800 border-dashed rounded-lg">
        No decision data available yet
      </div>
    );
  }

  const scamPct = Math.round((overview.scamCount / total) * 100) || 0;
  const legPct = Math.round((overview.legitimateCount / total) * 100) || 0;
  const reviewPct = Math.round((overview.humanReviewCount / total) * 100) || 0;

  return (
    <div className="space-y-6 py-2">
      <div className="flex justify-between items-end mb-2">
        <div className="text-xs font-mono font-bold tracking-widest uppercase text-slate-500">Decisions</div>
        <div className="text-xs font-mono text-slate-400">Total: {total}</div>
      </div>
      
      {/* Horizontal Stacked Bar */}
      <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex shadow-inner border border-slate-800">
        {overview.humanReviewCount > 0 && (
          <div 
            className="h-full bg-amber-500 transition-all duration-1000" 
            style={{ width: `${reviewPct}%` }}
            title={`Human Review: ${overview.humanReviewCount}`}
          />
        )}
        {overview.scamCount > 0 && (
          <div 
            className="h-full bg-red-500 transition-all duration-1000" 
            style={{ width: `${scamPct}%` }}
            title={`Scam: ${overview.scamCount}`}
          />
        )}
        {overview.legitimateCount > 0 && (
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000" 
            style={{ width: `${legPct}%` }}
            title={`Safe: ${overview.legitimateCount}`}
          />
        )}
      </div>

      {/* Legend / Metrics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-slate-300">Human Review</span>
          </div>
          <span className="font-mono text-white font-bold">{overview.humanReviewCount}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="text-slate-300">Scam</span>
          </div>
          <span className="font-mono text-white font-bold">{overview.scamCount}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-slate-300">Safe</span>
          </div>
          <span className="font-mono text-white font-bold">{overview.legitimateCount}</span>
        </div>
      </div>
    </div>
  );
}
