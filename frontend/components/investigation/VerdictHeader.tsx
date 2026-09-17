"use client";

import { FinalDecisionOutput } from "@/lib/investigationTypes";
import { AlertTriangle, ShieldCheck, ShieldAlert, Shield, Clock, HelpCircle } from "lucide-react";

interface VerdictHeaderProps {
  finalDecision?: FinalDecisionOutput;
  totalLatencyMs?: number;
}

export function VerdictHeader({ finalDecision, totalLatencyMs }: VerdictHeaderProps) {
  if (!finalDecision) {
    return (
      <div className="p-8 rounded-xl bg-surface border border-slate-800 text-center">
        <h2 className="text-xl font-serif text-slate-400">Verdict Unavailable</h2>
        <p className="text-slate-500 mt-2 text-sm font-sans">The investigation did not reach a final decision.</p>
      </div>
    );
  }

  const { verdict, riskScore, confidence } = finalDecision;
  const rawVerdict = String(verdict).toUpperCase();

  let bgColor = "bg-surface";
  let borderColor = "border-slate-800";
  let textColor = "text-slate-200";
  let Icon = Shield;
  let title = "Investigation Complete";
  let subtitle = "";
  let isHumanReview = false;

  if (rawVerdict === "SCAM") {
    bgColor = "bg-red-950/20";
    borderColor = "border-red-500/30";
    textColor = "text-red-400";
    Icon = ShieldAlert;
    title = "High Risk";
    subtitle = "JobShield identified multiple high-risk indicators associated with fraudulent recruitment.";
  } else if (rawVerdict === "HUMAN_REVIEW") {
    bgColor = "bg-amber-950/20";
    borderColor = "border-amber-500/40";
    textColor = "text-amber-400";
    Icon = HelpCircle;
    title = "Human Review Required";
    isHumanReview = true;
    subtitle = "This investigation contains conflicting or incomplete evidence and should be reviewed before proceeding.";
  } else if (rawVerdict === "SAFE") {
    bgColor = "bg-emerald-950/20";
    borderColor = "border-emerald-500/30";
    textColor = "text-emerald-400";
    Icon = ShieldCheck;
    title = "Looks Safe";
    subtitle = "JobShield found no significant indicators of job fraud in this investigation.";
  } else {
    // Fallback for unexpected states
    bgColor = "bg-slate-900/60";
    borderColor = "border-slate-700/60";
    textColor = "text-slate-300";
    Icon = Shield;
    title = "Investigation Complete";
    subtitle = "Analysis finished with an inconclusive verdict.";
  }

  return (
    <section 
      aria-label="Investigation Verdict" 
      className={`p-4 sm:p-5 rounded-xl ${bgColor} border ${borderColor} flex flex-col items-center justify-center text-center shadow-md relative overflow-hidden transition-all`}
    >
      <div className="relative z-10 flex flex-col items-center max-w-xl w-full">
        <div className={`p-3 rounded-full ${bgColor} border ${borderColor} mb-2`}>
          <Icon className={`h-7 w-7 ${textColor}`} />
        </div>

        <h2 className={`font-serif text-3xl sm:text-4xl font-normal tracking-tight ${textColor}`}>
          {title}
        </h2>

        {subtitle && (
          <p className="text-slate-400 text-sm sm:text-base font-sans mt-2 max-w-md leading-relaxed">
            {subtitle}
          </p>
        )}

        {isHumanReview && (
          <div className="w-full mt-4 p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-sans text-left">
            <span className="font-semibold block mb-0.5">Analyst Guidance</span>
            Review the contradiction signals and recruiter domain verification in the sections below to verify candidate safety.
          </div>
        )}

        <div className="flex items-center justify-center gap-8 sm:gap-12 mt-4 pt-4 border-t border-slate-800/80 w-full max-w-md">
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Risk Score
            </span>
            <div className="font-mono text-2xl font-semibold text-slate-100 tracking-tight">
              {Math.round(riskScore)}<span className="text-sm text-slate-500 font-normal">/100</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="flex flex-col items-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Confidence
            </span>
            <div className="font-mono text-2xl font-semibold text-slate-100 tracking-tight">
              {Math.round((confidence > 1 ? confidence : confidence * 100))}<span className="text-sm text-slate-500 font-normal">%</span>
            </div>
          </div>
        </div>

        {typeof totalLatencyMs === "number" && totalLatencyMs > 0 && (
          <div className="flex flex-wrap items-center justify-center mt-3 pt-3 border-t border-slate-800/50 w-full">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/60 text-slate-400 text-xs font-mono border border-slate-800">
              <Clock className="h-3 w-3" />
              {(totalLatencyMs / 1000).toFixed(2)}s
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
