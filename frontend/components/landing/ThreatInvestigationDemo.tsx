"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Terminal, 
  Search, 
  Shield, 
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight
} from "lucide-react";

/**
 * Persisted demo fixture derived directly from JobShield's deterministic risk rules:
 * - registration_fee (+40) [CRITICAL]
 * - suspicious_domain (+20) [HIGH]
 * - generic_email (+15) [MEDIUM]
 * - unrealistic_salary (+15) [MEDIUM]
 * Total Raw: 90 | Scaled Final Risk: 85/100 (HIGH RISK)
 */
const DEMO_FIXTURE = {
  document: {
    title: "Senior Full Stack Engineer - Global Remote",
    company: "Apex Innovations LLC",
    sender: "talent-acquisition@apex-careers-portal.net",
    salary: "$195,000 / year (Entry Level considered)",
    feeSnippet: "Mandatory $65 onboarding compliance & background verification fee payable prior to hardware dispatch via crypto or Wire.",
  },
  stages: [
    {
      id: "scan",
      label: "1. SCAN",
      desc: "Syntax & entity extraction completed. Identified target recruiter contact and payment phrase.",
      status: "COMPLETED",
    },
    {
      id: "verify",
      label: "2. VERIFY",
      desc: "WHOIS lookup: apex-careers-portal.net registered 6 days ago. Recruiter using freemail forwarding gateway.",
      status: "ALERT",
    },
    {
      id: "retrieve",
      label: "3. RETRIEVE",
      desc: "RAG vector retrieval matched 4 known advance-fee fraud signatures in Threat Intelligence KB.",
      status: "ALERT",
    },
    {
      id: "correlate",
      label: "4. CORRELATE",
      desc: "Graph linkage: Domain shares nameserver and payment wallet hash with active campaign cluster #CAMP-882.",
      status: "CRITICAL",
    },
    {
      id: "calculate",
      label: "5. CALCULATE",
      desc: "Deterministic Risk Engine applied verified rule weights from riskSignalRules.ts.",
      status: "CALCULATING",
    },
  ],
  verifiedSignals: [
    { rule: "registration_fee", points: 40, severity: "CRITICAL", label: "Registration / Training Fee Required" },
    { rule: "suspicious_domain", points: 20, severity: "HIGH", label: "Domain impersonating legitimate company (< 10 days old)" },
    { rule: "generic_email", points: 15, severity: "MEDIUM", label: "Recruiter using generic/unverified email provider" },
    { rule: "unrealistic_salary", points: 15, severity: "MEDIUM", label: "Salary range exceeds 95th percentile benchmark for role" },
  ],
  finalRiskScore: 85,
  riskTier: "HIGH RISK",
  confidence: "94.2%",
};

export function ThreatInvestigationDemo() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });

  useEffect(() => {
    if (isInView && !isPlaying) {
      setIsPlaying(true);
    }
  }, [isInView, isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < 5) return prev + 1;
        clearInterval(interval);
        return 5;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleReplay = () => {
    setCurrentStageIndex(0);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 200);
  };

  return (
    <section id="how-it-works" className="py-24 px-6 bg-[#05080f] relative border-t border-slate-800/60">
      <div className="max-w-6xl mx-auto" ref={containerRef}>
        
        {/* Section Header */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-[#090d16] text-slate-400 text-xs font-mono tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5 text-[#00ff88]" />
            <span>HOW JOBSHIELD WORKS</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif text-white tracking-tight mb-4">
            Give JobShield the job. <br />
            <span className="text-[#00ff88] italic font-normal">We&apos;ll investigate the rest.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Paste a job posting, URL, or recruiter message. JobShield runs a multi-source investigation across identity, infrastructure, and fraud patterns.
          </p>
          <div className="mt-3">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900/60 px-2.5 py-1 rounded border border-slate-800">
              INTERACTIVE DEMO • DERIVED FROM PERSISTED FIXTURE (#INV-882-APEX)
            </span>
          </div>
        </div>

        {/* Pipeline Stepper Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8 font-mono text-xs">
          {DEMO_FIXTURE.stages.map((stage, idx) => {
            const isActive = currentStageIndex === idx;
            const isDone = currentStageIndex > idx;
            return (
              <div
                key={stage.id}
                className={`p-2.5 rounded-lg border transition-all ${
                  isActive
                    ? "border-[#00ff88] bg-[#00ff88]/10 text-white shadow-[0_0_15px_rgba(0,255,136,0.15)]"
                    : isDone
                    ? "border-slate-800 bg-[#090d16] text-slate-400"
                    : "border-slate-900 bg-[#05080f] text-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{stage.label}</span>
                  {isDone && <CheckCircle2 className="w-3 h-3 text-[#00ff88]" />}
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-ping" />}
                </div>
                <div className="text-[10px] text-slate-500 uppercase">
                  {isDone ? "Done" : isActive ? "Running" : "Pending"}
                </div>
              </div>
            );
          })}
          {/* Stage 6: Verdict */}
          <div
            className={`p-2.5 rounded-lg border transition-all col-span-2 sm:col-span-3 lg:col-span-1 ${
              currentStageIndex >= 5
                ? "border-red-500/80 bg-red-500/10 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                : "border-slate-900 bg-[#05080f] text-slate-600"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">6. VERDICT</span>
              {currentStageIndex >= 5 && <ShieldAlert className="w-3 h-3 text-red-400" />}
            </div>
            <div className="text-[10px] text-slate-500 uppercase">
              {currentStageIndex >= 5 ? "RESOLVED" : "Pending"}
            </div>
          </div>
        </div>

        {/* SOC Investigation Stage View */}
        <div className="grid lg:grid-cols-12 gap-6 bg-[#090d16] rounded-xl border border-slate-800 shadow-2xl p-4 sm:p-6">
          
          {/* Left: Input Document Inspection (5 cols) */}
          <div className="lg:col-span-5 bg-[#05080f] rounded-lg border border-slate-800/80 p-5 flex flex-col font-mono text-xs text-slate-300">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-500" />
                <span>source_payload.json</span>
              </div>
              <span className="text-[10px] text-slate-600">UTF-8 RAW</span>
            </div>

            <div className="space-y-3.5 leading-relaxed overflow-y-auto max-h-[380px]">
              <div>
                <span className="text-slate-500 block text-[10px]">TARGET_POSITION:</span>
                <span className="text-white font-semibold">{DEMO_FIXTURE.document.title}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">COMPANY:</span>
                <span className="text-slate-200">{DEMO_FIXTURE.document.company}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">RECRUITER_CONTACT:</span>
                <span className={`px-1 rounded transition-colors duration-500 ${
                  currentStageIndex >= 1 ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-slate-300"
                }`}>
                  {DEMO_FIXTURE.document.sender}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">OFFERED_SALARY:</span>
                <span className={`px-1 rounded transition-colors duration-500 ${
                  currentStageIndex >= 1 ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-300"
                }`}>
                  {DEMO_FIXTURE.document.salary}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">EXCERPT_TEXT:</span>
                <div className={`p-2 rounded mt-1 text-slate-300 bg-slate-900/50 border transition-all duration-500 ${
                  currentStageIndex >= 2 ? "border-red-500/40 bg-red-950/20 text-red-200" : "border-slate-800"
                }`}>
                  {DEMO_FIXTURE.document.feeSnippet}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>HASH: 8f9b2d01e4a</span>
              <span>PARSED BY EXTRACTOR</span>
            </div>
          </div>

          {/* Right: Real-time Evidence & Rule Breakdown (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* Control & Activity Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00ff88]" />
                <span className="font-mono text-xs font-semibold text-white tracking-wide">
                  DETERMINISTIC ANALYSIS CONSOLE
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-xs">
                {currentStageIndex < 5 ? (
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <Search className="w-3.5 h-3.5 animate-spin" />
                    <span>ANALYZING...</span>
                  </span>
                ) : (
                  <button
                    onClick={handleReplay}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RE-RUN DEMO</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Stage Execution Log */}
            <div className="bg-[#05080f] rounded-lg border border-slate-800 p-4 font-mono text-xs">
              <div className="text-slate-500 mb-2 flex items-center justify-between">
                <span>STAGE LOG [{currentStageIndex < 5 ? DEMO_FIXTURE.stages[currentStageIndex]?.label : "VERDICT"}]</span>
                <span className="text-[#00ff88]">{currentStageIndex < 5 ? "STREAMING" : "COMPLETE"}</span>
              </div>
              <p className="text-slate-200 leading-relaxed min-h-[44px]">
                {currentStageIndex < 5 
                  ? DEMO_FIXTURE.stages[currentStageIndex]?.desc 
                  : "All intelligence signals correlated against threat graph. Final verdict rendered."}
              </p>
            </div>

            {/* Verified Risk Rule Matches (Single Source of Truth from riskSignalRules.ts) */}
            <div className="space-y-2">
              <div className="text-slate-400 font-mono text-xs font-semibold flex items-center justify-between">
                <span>EVIDENCE SIGNALS IDENTIFIED</span>
                <span className="text-[10px] text-slate-500">SOURCE: riskSignalRules.ts</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {DEMO_FIXTURE.verifiedSignals.map((signal, idx) => {
                  const isVisible = currentStageIndex >= idx + 1;
                  return (
                    <motion.div
                      key={signal.rule}
                      initial={{ opacity: 0, x: 10 }}
                      animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0.25, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`p-2.5 rounded border flex items-center justify-between ${
                        isVisible 
                          ? signal.severity === "CRITICAL"
                            ? "bg-red-950/20 border-red-500/40 text-red-300"
                            : "bg-slate-900/50 border-slate-700 text-slate-200"
                          : "bg-transparent border-slate-900 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isVisible ? (signal.severity === "CRITICAL" ? "bg-red-400" : "bg-amber-400") : "bg-slate-700"
                        }`} />
                        <span className="truncate">{signal.label}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-slate-800 text-slate-400">
                          {signal.severity}
                        </span>
                        <span className="font-bold text-[#00ff88]">
                          +{signal.points}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Real Final Verdict Box */}
            <AnimatePresence>
              {currentStageIndex >= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-red-950/30 border border-red-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono"
                >
                  <div className="flex items-center gap-3 text-left w-full sm:w-auto">
                    <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 shrink-0">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{DEMO_FIXTURE.riskTier}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                          CONFIDENCE {DEMO_FIXTURE.confidence}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        4 Verified Signals • Deterministic Match
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-2xl font-black text-red-400 leading-none">
                        {DEMO_FIXTURE.finalRiskScore}
                        <span className="text-xs text-slate-500 font-normal">/100</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase">RISK SCORE</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </section>
  );
}
