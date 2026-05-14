import { Brain, UserCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskBreakdown {
  aiScore: number;
  recruiterScore: number;
  threatScore: number;
}

interface ConfidenceBreakdownPanelProps {
  breakdown: RiskBreakdown;
  confidence: number;
}

export function ConfidenceBreakdownPanel({ breakdown, confidence }: ConfidenceBreakdownPanelProps) {
  
  const getScoreColor = (score: number) => {
    if (score > 75) return "bg-destructive shadow-destructive/50";
    if (score > 40) return "bg-yellow-500 shadow-yellow-500/50";
    return "bg-green-500 shadow-green-500/50";
  };

  const getAgreementBadge = () => {
    if (confidence > 85) return { text: "Strong Agreement", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    if (confidence > 60) return { text: "Moderate Agreement", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" };
    return { text: "Divergent Signals", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
  };

  const badge = getAgreementBadge();

  const renderSignalBar = (label: string, icon: React.ReactNode, score: number, weight: string) => (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
            {icon}
          </div>
          <span className="text-sm font-medium text-slate-200">{label}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-1.5 py-0.5 bg-white/5 rounded border border-white/5">{weight} Weight</span>
        </div>
        <span className="font-mono text-sm font-bold text-white">{score}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 shadow-[0_0_8px]", getScoreColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Signal Breakdown</h3>
        <div className={cn("text-xs px-2.5 py-1 rounded-full border font-medium flex items-center gap-1.5", badge.color)}>
          <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", badge.color.split(' ')[0].replace('/20', ''))} />
          {badge.text}
        </div>
      </div>

      <div className="space-y-5">
        {renderSignalBar("AI NLP Engine", <Brain className="h-4 w-4 text-blue-400" />, breakdown.aiScore, "50%")}
        {renderSignalBar("Recruiter Trust", <UserCheck className="h-4 w-4 text-purple-400" />, breakdown.recruiterScore, "25%")}
        {renderSignalBar("Threat Intelligence", <ShieldAlert className="h-4 w-4 text-rose-400" />, breakdown.threatScore, "25%")}
      </div>
    </div>
  );
}
