import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountingNumber } from "./CountingNumber";

interface UnifiedRiskConfidenceProps {
  finalScore: number;
  confidence: number;
  riskLevel: "High" | "Medium" | "Low";
}

export function UnifiedRiskConfidence({ finalScore, confidence, riskLevel }: UnifiedRiskConfidenceProps) {
  const getRiskColor = () => {
    if (riskLevel === "High") return "text-destructive border-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]";
    if (riskLevel === "Medium") return "text-yellow-500 border-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]";
    return "text-green-500 border-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]";
  };

  const getBgColor = () => {
    if (riskLevel === "High") return "bg-destructive/10";
    if (riskLevel === "Medium") return "bg-yellow-500/10";
    return "bg-green-500/10";
  };

  const getIcon = () => {
    if (riskLevel === "High") return <ShieldAlert className="h-8 w-8 text-destructive" />;
    if (riskLevel === "Medium") return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
    return <ShieldCheck className="h-8 w-8 text-green-500" />;
  };

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md relative overflow-hidden">
      {/* Background glow */}
      <div className={cn(
        "absolute -inset-10 blur-3xl opacity-20 pointer-events-none rounded-full transition-colors duration-1000",
        getBgColor()
      )} />

      {/* Circular Risk Score */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            className="stroke-white/10"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            className={cn("transition-all duration-1500 ease-out", getRiskColor())}
            strokeWidth="8"
            strokeDasharray={352} // 2 * PI * 56
            strokeDashoffset={352 - (352 * finalScore) / 100}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-black font-mono", getRiskColor())}>
            <CountingNumber target={finalScore} duration={1200} decimals={0} />
          </span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{riskLevel}</span>
        </div>
      </div>

      {/* Confidence Metrics & Text */}
      <div className="flex-1 space-y-4 w-full relative z-10">
        <div className="flex items-center gap-3 mb-2">
          {getIcon()}
          <div>
            <h3 className="text-lg font-bold text-foreground">Unified Risk Assessment</h3>
            <p className="text-sm text-muted-foreground">AI, Recruiter, and Threat signals combined</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-slate-300">Signal Agreement Confidence</span>
            <span className="text-white font-mono">{confidence}%</span>
          </div>
          <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.3)]",
                confidence > 80 ? "bg-blue-500" : confidence > 50 ? "bg-indigo-400" : "bg-slate-400"
              )}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground pt-1 italic">
            * Confidence increases when multiple independent signals agree on the risk level.
          </p>
        </div>
      </div>
    </div>
  );
}
