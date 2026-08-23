"use client";

import { useEffect, useState } from "react";
import { intelligenceApi } from "@/lib/intelligenceApi";
import { ScamTrend } from "@/lib/intelligenceTypes";
import { TrendingUp, Search } from "lucide-react";

export function ScamTrendsPanel() {
  const [trends, setTrends] = useState<ScamTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    intelligenceApi.getTrends(30)
      .then(setTrends)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-500 animate-pulse">Loading trends...</div>;
  if (trends.length === 0) return (
    <div className="h-64 flex flex-col items-center justify-center text-slate-500">
      <Search className="w-8 h-8 mb-2 opacity-50" />
      <span className="text-sm">No scam trends found in the past 30 days</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center text-sm text-slate-400 mb-4">
        <TrendingUp className="w-4 h-4 mr-2" />
        Top recurring signals in the last 30 days
      </div>
      
      <div className="space-y-3">
        {trends.map((trend, i) => (
          <div key={i} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-slate-200 text-sm truncate pr-4">{trend.signalName}</span>
              <span className="text-xs font-mono bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                {trend.count} {trend.count === 1 ? 'hit' : 'hits'}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-1.5 rounded-full"
                style={{ width: `${trend.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
