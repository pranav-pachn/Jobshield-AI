"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Scale, 
  ShieldAlert, 
  Check, 
  Plus, 
  Cpu, 
  FileCode, 
  Info,
  ArrowRight
} from "lucide-react";

/**
 * EXACT RISK WEIGHTS FROM `backend/src/services/riskSignalRules.ts`
 * Single source of truth. Zero fabricated weights or arbitrary scores.
 */
const VERIFIED_RULES = [
  { key: "advance_fee", points: 40, severity: "CRITICAL", desc: "Upfront payment requested from candidate" },
  { key: "registration_fee", points: 40, severity: "CRITICAL", desc: "Registration or training fee required" },
  { key: "payment_request", points: 30, severity: "HIGH", desc: "Requests payment for equipment or software" },
  { key: "suspicious_domain", points: 20, severity: "HIGH", desc: "Domain is suspicious or impersonating a legitimate company" },
  { key: "telegram_whatsapp", points: 20, severity: "HIGH", desc: "Requests communication exclusively over Telegram or WhatsApp" },
  { key: "generic_email", points: 15, severity: "MEDIUM", desc: "Recruiter uses a free or generic email provider" },
  { key: "recruiter_mismatch", points: 15, severity: "MEDIUM", desc: "Recruiter identity does not match the hiring company" },
  { key: "unrealistic_salary", points: 15, severity: "MEDIUM", desc: "Salary is unrealistically high for the role" },
  { key: "off_platform_contact", points: 15, severity: "MEDIUM", desc: "Asks to contact outside of the hiring platform" },
  { key: "urgency", points: 10, severity: "MEDIUM", desc: "Job posting uses high-pressure or urgent language" },
];

export const ExplainableRiskSection: React.FC = () => {
  // Pre-selected signals matching a sample high-risk investigation
  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    "registration_fee",
    "suspicious_domain",
    "unrealistic_salary",
  ]);

  const toggleRule = (key: string) => {
    setSelectedKeys((prev) => 
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Calculate sum based purely on active rules
  const rawSum = selectedKeys.reduce((acc, k) => {
    const r = VERIFIED_RULES.find((rule) => rule.key === k);
    return acc + (r ? r.points : 0);
  }, 0);

  // Scaled score capped at 100
  const score = Math.min(100, Math.round(rawSum * 1.1));

  const getTier = (s: number) => {
    if (s >= 70) return { label: "HIGH RISK", color: "text-red-400", bg: "bg-red-950/20 border-red-500/40" };
    if (s >= 40) return { label: "SUSPICIOUS / ELEVATED", color: "text-amber-400", bg: "bg-amber-950/20 border-amber-500/40" };
    if (s > 0) return { label: "LOW RISK", color: "text-blue-400", bg: "bg-blue-950/20 border-blue-500/40" };
    return { label: "BENIGN / VERIFIED", color: "text-[#00ff88]", bg: "bg-emerald-950/20 border-emerald-500/40" };
  };

  const currentTier = getTier(score);

  return (
    <section id="explainability" className="py-24 px-6 bg-[#070b14] relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88] text-xs font-mono tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>SEE EXACTLY WHY</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif text-white tracking-tight mb-4">
            Don&apos;t just get a score. <br />
            <span className="text-[#00ff88] italic font-normal">See why.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Every point is calculated by audited, deterministic risk rules. If a job is flagged, you see the exact signals, evidence, and penalty breakdown — no black boxes, no arbitrary numbers.
          </p>
        </div>

        {/* Two-Column Interactive Formula Demonstrator */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Verified Rules Selector (7 cols) */}
          <div className="lg:col-span-7 bg-[#090d16] border border-slate-800 rounded-2xl p-6 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-white uppercase">Active Engine Rules</span>
              </div>
              <span className="text-[11px] text-slate-500">CLICK TO TOGGLE SIGNALS</span>
            </div>

            <div className="space-y-2.5">
              {VERIFIED_RULES.map((rule) => {
                const isSelected = selectedKeys.includes(rule.key);
                return (
                  <div
                    key={rule.key}
                    onClick={() => toggleRule(rule.key)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-slate-900 border-[#00ff88]/60 text-white shadow-[0_0_15px_rgba(0,255,136,0.1)]"
                        : "bg-[#05080f] border-slate-800/80 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-[#00ff88] text-black" : "border border-slate-700 text-transparent"
                      }`}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate">{rule.key}</div>
                        <div className="text-[11px] text-slate-500 truncate">{rule.desc}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        rule.severity === "CRITICAL" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                        rule.severity === "HIGH" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                        "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      }`}>
                        {rule.severity}
                      </span>
                      <span className="font-bold text-[#00ff88] w-10 text-right">
                        +{rule.points}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Live Calculated Verdict & Trace (5 cols) */}
          <div className="lg:col-span-5 bg-[#090d16] border border-slate-800 rounded-2xl p-6 font-mono text-xs shadow-2xl flex flex-col space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-bold text-white uppercase">YOUR INVESTIGATION RESULT</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[#00ff88]">
                DETERMINISTIC
              </span>
            </div>

            {/* Live Score Dial Display */}
            <div className={`p-6 rounded-xl border text-center transition-all ${currentTier.bg}`}>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
                Calculated Risk Score
              </div>
              <div className="text-6xl font-black text-white my-2 tracking-tight">
                {score}
                <span className="text-xl text-slate-500 font-normal">/100</span>
              </div>
              <div className={`text-sm font-bold tracking-wider ${currentTier.color}`}>
                {currentTier.label}
              </div>
            </div>

            {/* Formula Breakdown */}
            <div className="space-y-3 bg-[#05080f] p-4 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px] font-semibold uppercase flex items-center justify-between">
                <span>Evidence Breakdown</span>
                <span>{selectedKeys.length} SIGNALS</span>
              </div>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {selectedKeys.length === 0 ? (
                  <div className="text-slate-600 text-center py-4">No signals active. Risk score is 0.</div>
                ) : (
                  selectedKeys.map((key) => {
                    const rule = VERIFIED_RULES.find((r) => r.key === key);
                    return (
                      <div key={key} className="flex justify-between text-slate-300 text-[11px]">
                        <span className="truncate pr-2">{key}</span>
                        <span className="font-bold text-[#00ff88]">+{rule?.points}</span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-white text-xs">
                <span>Raw Sum:</span>
                <span className="text-[#00ff88]">{rawSum} pts</span>
              </div>
            </div>

            {/* Why This Matters Callout */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-blue-200 text-xs leading-relaxed space-y-2 font-sans">
              <div className="font-mono text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>WHY DETERMINISTIC SCORING MATTERS</span>
              </div>
              <p>
                In security operations, an analyst must know precisely why an alert was triggered. If a candidate asks why a job was flagged, JobShield can cite the exact line in the job description and the exact rule weight that triggered it.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
