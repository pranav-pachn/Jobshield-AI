"use client";

import { cn } from "@/lib/utils";

interface LoadingStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed";
}

interface LoadingStateProps {
  title?: string;
  steps?: LoadingStep[];
  className?: string;
}

export function LoadingState({
  title = "SYSTEM PROCESSING",
  steps = [],
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("w-full flex flex-col items-start p-8 rounded-lg border bg-black/20 border-slate-800/50 font-mono", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
        </div>
        <h3 className="text-sm font-bold tracking-widest text-slate-200 uppercase">{title}</h3>
      </div>
      
      {steps.length > 0 ? (
        <div className="flex flex-col gap-3 ml-1">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3 text-xs tracking-wider">
              {step.status === "completed" && <span className="text-[#00ff88]">✓</span>}
              {step.status === "active" && <span className="text-blue-500 animate-pulse">●</span>}
              {step.status === "pending" && <span className="text-slate-600">○</span>}
              
              <span className={cn(
                step.status === "completed" && "text-slate-400",
                step.status === "active" && "text-blue-400 font-semibold",
                step.status === "pending" && "text-slate-600"
              )}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2 ml-1 opacity-70">
          <div className="h-1 w-24 bg-blue-500/20 rounded overflow-hidden">
            <div className="h-full bg-blue-500 w-1/2 animate-[pulse_1s_ease-in-out_infinite]" />
          </div>
          <span className="text-xs text-slate-500 tracking-wider mt-2">PROCESSING...</span>
        </div>
      )}
    </div>
  );
}
