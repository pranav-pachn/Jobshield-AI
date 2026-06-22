import { cn } from "@/lib/utils";

interface ScanProgressProps {
  progress: number;
  status: string;
  stage: string;
  className?: string;
}

export function ScanProgress({ progress, status, stage, className }: ScanProgressProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest">
        <span className="text-blue-400">{stage}</span>
        <span className="text-slate-400">{Math.round(progress)}%</span>
      </div>
      
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-500 ease-out relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>
      
      <p className="text-[10px] text-slate-500 font-mono">{status}</p>
    </div>
  );
}
