"use client";

import { useEffect, useState } from "react";
import { intelligenceApi } from "@/lib/intelligenceApi";
import { ThreatSummary } from "@/lib/intelligenceTypes";
import { ShieldAlert, Database } from "lucide-react";

export function ThreatIntelPanel() {
  const [threats, setThreats] = useState<ThreatSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    intelligenceApi.getThreats(5)
      .then(setThreats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center text-slate-500 animate-pulse">Loading threat intel...</div>;
  if (threats.length === 0) return (
    <div className="h-64 flex flex-col items-center justify-center text-slate-500">
      <Database className="w-8 h-8 mb-2 opacity-50" />
      <span className="text-sm">No known threat signatures matched recently</span>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center text-sm text-slate-400 mb-4">
        <ShieldAlert className="w-4 h-4 mr-2" />
        Top known threat actors & networks identified
      </div>
      
      <div className="space-y-3">
        {threats.map((threat, i) => (
          <div key={i} className="bg-slate-800/50 rounded-lg p-3 border border-rose-900/30">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-slate-200 text-sm truncate pr-4 text-rose-400">{threat.threatName}</div>
              <div className="text-right shrink-0">
                <span className="text-xs font-mono bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">
                  {threat.matchedInvestigations} matches
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Avg Similarity</span>
              <span>{(threat.averageSimilarity * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
