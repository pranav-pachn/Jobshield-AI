import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityHeaderProps {
  type: string;
  id: string;
  title: string;
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE" | "UNKNOWN";
  status?: string;
  confidence?: number;
  icon?: LucideIcon;
  className?: string;
}

const getRiskColor = (level: string) => {
  switch (level.toUpperCase()) {
    case "CRITICAL":
      return "text-red-500 border-red-500/30 bg-red-500/10";
    case "HIGH":
      return "text-orange-500 border-orange-500/30 bg-orange-500/10";
    case "MEDIUM":
      return "text-amber-500 border-amber-500/30 bg-amber-500/10";
    case "LOW":
      return "text-blue-500 border-blue-500/30 bg-blue-500/10";
    case "SAFE":
      return "text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10";
    default:
      return "text-slate-400 border-slate-500/30 bg-slate-500/10";
  }
};

const getStatusColor = (status: string) => {
  if (status.includes("CONFIRMED")) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (status.includes("ACTIVE")) return "text-blue-400 border-blue-500/30 bg-blue-500/10";
  if (status.includes("DORMANT")) return "text-slate-400 border-slate-500/30 bg-slate-500/10";
  return "text-slate-400 border-slate-500/30 bg-slate-500/10";
};

export function EntityHeader({ type, id, title, riskLevel, status, confidence, icon: Icon, className }: EntityHeaderProps) {
  return (
    <div className={cn("p-6 bg-[#080f1d] border border-slate-800 rounded-xl shadow-xl flex flex-col gap-4 relative overflow-hidden", className)}>
      {/* Background Accent */}
      <div className="absolute top-0 w-full h-1 left-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />
      
      {/* Type Label */}
      <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-slate-500">
        {Icon && <Icon className="w-4 h-4" />}
        {type}
      </div>

      {/* Identity */}
      <div>
        <h3 className="text-sm font-mono text-slate-400 mb-1">{id}</h3>
        <h1 className="text-3xl font-black text-slate-100 tracking-tight uppercase">{title}</h1>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-3 mt-2">
        <div className={cn("px-3 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase flex items-center gap-2", getRiskColor(riskLevel))}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {riskLevel} RISK
        </div>

        {status && (
          <div className={cn("px-3 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase flex items-center gap-2", getStatusColor(status))}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status}
          </div>
        )}

        {confidence !== undefined && (
          <div className="px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900 text-xs font-bold tracking-widest text-slate-400 uppercase">
            Confidence {confidence}%
          </div>
        )}
      </div>
    </div>
  );
}
