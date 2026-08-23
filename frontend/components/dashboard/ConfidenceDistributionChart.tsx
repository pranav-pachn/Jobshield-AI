"use client";

import { AnalyticsOverview } from "@/lib/intelligenceTypes";

interface Props {
  overview: AnalyticsOverview | null;
}

export function ConfidenceDistributionChart({ overview }: Props) {
  if (!overview) return null;

  return (
    <div className="h-64 flex flex-col justify-center px-4">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-slate-300">Average Confidence</span>
          <span className="text-2xl font-bold text-slate-100">{overview.averageConfidence}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${overview.averageConfidence}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-slate-300">High Risk proportion</span>
          <span className="text-2xl font-bold text-rose-400">{overview.highRiskPercentage}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-rose-500 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${overview.highRiskPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
