"use client";

import { FinalDecisionOutput } from "@/lib/investigationTypes";
import { AlertTriangle, ShieldCheck, ShieldAlert, Shield, Clock } from "lucide-react";

interface VerdictHeaderProps {
  finalDecision?: FinalDecisionOutput;
  totalLatencyMs?: number;
}

export function VerdictHeader({ finalDecision, totalLatencyMs }: VerdictHeaderProps) {
  if (!finalDecision) {
    return (
      <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center">
        <h2 className="text-xl font-bold text-slate-400">Verdict Unavailable</h2>
        <p className="text-slate-500 mt-2">The investigation did not reach a final decision.</p>
      </div>
    );
  }

  const { verdict, riskScore, confidence } = finalDecision;

  // Determine styles based on verdict
  let bgColor = "bg-slate-900";
  let borderColor = "border-slate-800";
  let textColor = "text-slate-200";
  let Icon = Shield;

  if (verdict === "HIGH_RISK" || verdict === "CRITICAL") {
    bgColor = "bg-red-950/30";
    borderColor = "border-red-500/50";
    textColor = "text-red-500";
    Icon = ShieldAlert;
  } else if (verdict === "MEDIUM_RISK") {
    bgColor = "bg-amber-950/30";
    borderColor = "border-amber-500/50";
    textColor = "text-amber-500";
    Icon = AlertTriangle;
  } else if (verdict === "LOW_RISK" || verdict === "SAFE") {
    bgColor = "bg-emerald-950/30";
    borderColor = "border-emerald-500/50";
    textColor = "text-emerald-500";
    Icon = ShieldCheck;
  }

  const formatVerdict = (v: string) => v.replace("_", " ");

  return (
    <div className={`p-8 rounded-xl ${bgColor} border ${borderColor} flex flex-col items-center justify-center space-y-4 shadow-lg relative overflow-hidden`}>
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-${textColor.split('-')[1]}-500/5 opacity-50`} />
      
      <div className="relative z-10 flex flex-col items-center space-y-2">
        <div className={`p-3 rounded-full ${bgColor} border ${borderColor}`}>
          <Icon className={`h-8 w-8 ${textColor}`} />
        </div>
        <h2 className={`text-3xl md:text-4xl font-black tracking-tighter ${textColor}`}>
          {formatVerdict(verdict)}
        </h2>
        
        <div className="flex items-center gap-6 mt-4">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-slate-100">{Math.round(riskScore)}<span className="text-lg text-slate-500 font-medium">/100</span></span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Risk Score</span>
          </div>
          <div className="h-10 w-px bg-slate-800"></div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-slate-100">{Math.round(confidence * 100)}<span className="text-lg text-slate-500 font-medium">%</span></span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Confidence</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/50 w-full justify-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide border border-emerald-500/20">
            ✓ Investigation completed
          </span>
          {totalLatencyMs && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium tracking-wide border border-slate-700">
              <Clock className="h-3 w-3" />
              {(totalLatencyMs / 1000).toFixed(2)}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
