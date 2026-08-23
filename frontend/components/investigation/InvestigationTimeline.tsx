"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle, PlayCircle } from "lucide-react";
import { intelligenceApi } from "@/lib/intelligenceApi";
import { InvestigationTimeline as ITimeline, TimelineEvent } from "@/lib/intelligenceTypes";

export function InvestigationTimeline({ investigationId }: { investigationId: string }) {
  const [timeline, setTimeline] = useState<ITimeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    intelligenceApi.getTimeline(investigationId)
      .then(setTimeline)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [investigationId]);

  if (loading) return <div className="p-4 text-center text-slate-500 animate-pulse">Loading timeline...</div>;
  if (!timeline || timeline.events.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-indigo-400" />
        Investigation Timeline
      </h3>
      
      <div className="relative border-l border-slate-700 ml-3 space-y-6">
        {timeline.events.map((event, index) => {
          const isLast = index === timeline.events.length - 1;
          return (
            <div key={event.id} className="relative pl-6">
              <span className="absolute -left-3 top-1 bg-slate-900 rounded-full">
                {event.status === "success" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                {event.status === "failed" && <AlertCircle className="w-6 h-6 text-rose-500" />}
                {event.status === "started" && <PlayCircle className="w-6 h-6 text-indigo-500" />}
              </span>
              
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-slate-200 capitalize">
                    {event.agent.replace(/_/g, " ")}
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    event.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 
                    event.status === 'failed' ? 'bg-rose-500/10 text-rose-400' : 
                    'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {event.status.toUpperCase()}
                  </span>
                  
                  {event.durationMs !== undefined && (
                    <span className="text-slate-400 text-xs">
                      {(event.durationMs / 1000).toFixed(2)}s
                    </span>
                  )}
                </div>
                
                {event.details && (
                  <p className="mt-3 text-sm text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                    {event.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between text-sm text-slate-400">
        <span>Started: {new Date(timeline.startedAt).toLocaleString()}</span>
        <span>Total Time: {(timeline.totalDurationMs / 1000).toFixed(2)}s</span>
      </div>
    </div>
  );
}
