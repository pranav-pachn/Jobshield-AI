"use client";

import { Database, Bot, Activity, ArrowRight } from "lucide-react";

export function InvestigationEngineViz() {
  return (
    <div className="h-full flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center shadow-lg relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h3 className="text-sm font-bold tracking-widest text-slate-300 font-mono uppercase">
            Investigation Engine
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            Awaiting analysis...
          </p>
        </div>

        {/* Pipeline Visualization */}
        <div className="flex items-center justify-between px-4 opacity-50">
          
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center shadow-inner">
              <Database className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">RAG</span>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-600" />

          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center shadow-inner">
              <Bot className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Agent</span>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-600" />

          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center shadow-inner">
              <Activity className="h-4 w-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Risk</span>
          </div>

        </div>
      </div>
    </div>
  );
}
