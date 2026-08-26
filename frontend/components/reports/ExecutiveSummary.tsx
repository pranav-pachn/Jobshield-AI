import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ExecutiveSummaryProps {
  verdict: string;
  riskScore: number;
  confidence: number;
  reasons: string[];
}

export function ExecutiveSummary({ verdict, riskScore, confidence, reasons }: ExecutiveSummaryProps) {
  let badgeColor = "bg-slate-800 text-slate-300";
  let icon = <Info className="h-6 w-6 text-slate-400" />;
  let label = "Unknown";

  if (verdict === "SCAM") {
    badgeColor = "bg-red-900/50 text-red-400 border border-red-500/30";
    icon = <AlertTriangle className="h-6 w-6 text-red-500" />;
    label = "SCAM DETECTED";
  } else if (verdict === "HUMAN_REVIEW") {
    badgeColor = "bg-amber-900/50 text-amber-400 border border-amber-500/30";
    icon = <AlertTriangle className="h-6 w-6 text-amber-500" />;
    label = "HUMAN REVIEW REQUIRED";
  } else if (verdict === "SAFE") {
    badgeColor = "bg-emerald-900/50 text-emerald-400 border border-emerald-500/30";
    icon = <CheckCircle className="h-6 w-6 text-emerald-500" />;
    label = "LIKELY SAFE";
  }

  return (
    <section id="executive-summary" className="scroll-mt-24 space-y-4">
      <h3 className="text-xl font-semibold text-white border-b border-slate-800 pb-2">Executive Summary</h3>
      
      <div className={`p-4 rounded-lg flex items-center gap-4 ${badgeColor}`}>
        {icon}
        <div>
          <h4 className="font-bold text-lg">{label}</h4>
          <p className="text-sm opacity-80">Risk Score: {riskScore}/100 • Confidence: {(confidence * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 mt-4">
        <h4 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Key Findings</h4>
        <ul className="space-y-2">
          {reasons.slice(0, 5).map((reason, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
              <span className="text-slate-300 leading-relaxed">{reason}</span>
            </li>
          ))}
          {reasons.length === 0 && (
            <li className="text-slate-500 italic">No specific findings recorded.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
