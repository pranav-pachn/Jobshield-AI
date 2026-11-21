"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  RotateCcw,
  Building,
  DollarSign,
  Loader2,
  CheckCircle2,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvestigationTrace } from "@/lib/investigationTypes";
import { InvestigationReport } from "@/components/investigation/InvestigationReport";
import { startDemoInvestigation } from "@/lib/investigateApi";

interface DemoSample {
  id: string;
  title: string;
  category: "SCAM" | "SAFE" | "HUMAN_REVIEW";
  categoryLabel: string;
  company: string;
  role: string;
  salary: string;
  description: string;
  summaryReason: string;
}

const DEMO_SAMPLES: DemoSample[] = [
  {
    id: "demo-scam-equipment-check",
    title: "Registration fee & check scam",
    category: "SCAM",
    categoryLabel: "SCAM",
    company: "Apex Global Logistics",
    role: "Remote Data Entry Specialist",
    salary: "$45.00/hour",
    description: "Recruiter sends unsolicited offer for $45/hr and promises a $3,500 check to purchase home office gear via wire transfer.",
    summaryReason: "Advance-fee check routing syndicate targeting remote job seekers."
  },
  {
    id: "demo-safe-tech-lead",
    title: "Established company hiring",
    category: "SAFE",
    categoryLabel: "SAFE",
    company: "Stripe",
    role: "Senior Full-Stack Engineer",
    salary: "$175k - $210k + equity",
    description: "Legitimate tech enterprise role with verified @stripe.com domain, matching careers ATS page, and market compensation.",
    summaryReason: "Authenticated corporate domain with zero fraud telemetry matches."
  },
  {
    id: "demo-review-stealth-startup",
    title: "Suspicious recruiter message",
    category: "HUMAN_REVIEW",
    categoryLabel: "REVIEW",
    company: "CognitiveFlow Labs (Stealth)",
    role: "Founding AI Engineer",
    salary: "$140,000 + 2.5% Equity",
    description: "Stealth startup with a 45-day-old domain and no public careers page, but corroborated founder GitHub identity.",
    summaryReason: "Unregistered corporate presence requires manual founder verification."
  }
];

export const InteractiveDemoSection: React.FC = () => {
  const router = useRouter();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [trace, setTrace] = useState<InvestigationTrace | null>(null);

  const steps = [
    "Analyzing posting content & language anomalies",
    "Verifying recruiter identity & domain infrastructure",
    "Cross-referencing threat telemetry & campaign IOCs",
    "Synthesizing multi-agent evidence ledger",
    "Applying Decision Policy V1"
  ];

  const handleSelectSample = async (sample: DemoSample) => {
    setSelectedScenarioId(sample.id);
    setIsSimulating(true);
    setTrace(null);
    setActiveStep(0);

    // Realistic step-through simulation (~800ms)
    for (let i = 0; i < steps.length; i++) {
      setActiveStep(i);
      await new Promise((res) => setTimeout(res, 150));
    }

    try {
      const result = await startDemoInvestigation(sample.id);
      setTrace(result);
    } catch {
      // Fallback in case of network issue - fetch from static demo scenarios
      const fallbackTrace: any = {
        investigationId: sample.id,
        executionMode: "DEMO",
        isSimulated: true,
        state: "COMPLETED",
        input: { jobText: sample.description, company: sample.company, jobTitle: sample.role, salary: sample.salary },
        agentTraces: [],
        finalDecision: {
          verdict: sample.category === "SCAM" ? "CRITICAL" : sample.category === "SAFE" ? "SAFE" : "MEDIUM_RISK",
          riskScore: sample.category === "SCAM" ? 92 : sample.category === "SAFE" ? 10 : 55,
          confidence: 0.92,
          why: [sample.summaryReason],
          evidence: [],
          contradictions: [],
          recommendations: ["Always verify recruiter domain before transmitting sensitive information."]
        },
        evaluation: {
          content_risk: { score: sample.category === "SCAM" ? 92 : 10, label: sample.category },
          recruiter_trust: { score: sample.category === "SAFE" ? 94 : 15, label: sample.category },
          threat_match: { score: sample.category === "SCAM" ? 94 : 0, label: sample.category },
          historical_similarity: { score: 10, label: "Low" },
          overall_risk: { score: sample.category === "SCAM" ? 92 : 10, label: sample.category },
          evidence_quality: { level: "High", score: 90 },
          confidence: 0.92,
          sources_used: 4,
          contradictions: 0,
          missing_evidence: 0
        },
        decisionPolicy: {
          decision: sample.category === "SCAM" ? "SCAM" : sample.category === "SAFE" ? "SAFE" : "HUMAN_REVIEW",
          policy_version: "v1",
          reason: sample.summaryReason,
          risk: sample.category === "SCAM" ? 92 : 10,
          confidence: 92
        },
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        totalLatencyMs: 850
      };
      setTrace(fallbackTrace);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setSelectedScenarioId(null);
    setTrace(null);
    setIsSimulating(false);
  };

  return (
    <section id="demo" className="py-24 px-6 bg-[#040711] relative overflow-hidden border-t border-slate-900 scroll-mt-16">
      {/* Background ambient accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>INTERACTIVE DEMO • NO ACCOUNT REQUIRED</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight leading-tight">
            Try JobShield in action.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-sans pt-1">
            Choose a sample investigation below to see how our multi-agent architecture verifies posting content, recruiter identity, and threat telemetry.
          </p>
        </div>

        {/* 1. Scenario Selector Cards (when no active report) */}
        {!trace && !isSimulating && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {DEMO_SAMPLES.map((sample) => {
                const isScam = sample.category === "SCAM";
                const isSafe = sample.category === "SAFE";

                return (
                  <div
                    key={sample.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 transition-all p-6 space-y-5 shadow-lg group"
                  >
                    <div className="space-y-3.5">
                      {/* Category Badge */}
                      <div className="flex items-center justify-between">
                        {isScam ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            <span>{sample.categoryLabel}</span>
                          </span>
                        ) : isSafe ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{sample.categoryLabel}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            <span>{sample.categoryLabel}</span>
                          </span>
                        )}

                        <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
                          Sample Case
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <h3 className="text-base font-semibold text-slate-100 group-hover:text-amber-200 transition-colors">
                          {sample.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                          {sample.description}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="pt-2 border-t border-slate-800/60 space-y-1 text-xs text-slate-400 font-sans">
                        <div className="flex items-center gap-1.5 text-slate-300 truncate">
                          <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{sample.company}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 truncate">
                          <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{sample.salary}</span>
                        </div>
                      </div>
                    </div>

                    {/* Trigger Button */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSelectSample(sample)}
                      className="w-full text-xs font-medium border border-slate-700 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400 text-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Run Sample Investigation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-slate-500 font-mono pt-2">
              * Illustrative scenarios. Results are simulated deterministically without storing records.
            </p>
          </div>
        )}

        {/* 2. In-Progress Simulation View */}
        {isSimulating && (
          <div className="rounded-2xl border border-slate-800 bg-[#080c14] p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto shadow-2xl">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <div className="space-y-1.5">
              <h3 className="text-xl font-serif text-slate-100">
                Running Simulated Investigation
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Executing multi-agent evaluation pipeline on synthetic scenario...
              </p>
            </div>

            {/* Stepper progress */}
            <div className="space-y-2.5 max-w-md mx-auto text-left pt-2">
              {steps.map((stepText, idx) => {
                const isCompleted = idx < activeStep;
                const isCurrent = idx === activeStep;

                return (
                  <div key={stepText} className="flex items-center gap-3 text-xs">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0 ml-0.5 mr-1" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-700 shrink-0 ml-0.5 mr-1" />
                    )}
                    <span className={isCurrent ? "text-amber-300 font-medium" : isCompleted ? "text-slate-300" : "text-slate-500"}>
                      {stepText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Completed Investigation Report View */}
        {trace && !isSimulating && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 self-start cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>← Choose Another Sample Investigation</span>
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-amber-300/80 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30">
                  DEMO — SIMULATED REPORT
                </span>
                <Button
                  size="sm"
                  onClick={() => router.push("/login")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs px-3 py-1.5 cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In for Full App</span>
                </Button>
              </div>
            </div>

            {/* Actual Full Report Interface */}
            <div className="bg-[#05080f]/80 p-4 sm:p-8 rounded-2xl border border-slate-800/80 shadow-2xl">
              <InvestigationReport trace={trace} onReset={handleReset} />
            </div>

            {/* Bottom Conversion Call to Action */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-[#0a1020] to-slate-900/90 p-8 sm:p-10 text-center space-y-5 shadow-2xl">
              <div className="space-y-2 max-w-xl mx-auto">
                <h3 className="text-2xl font-serif text-white tracking-tight">
                  Want to use the complete platform?
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-sans">
                  Sign in to analyze custom postings, access your private investigation history, and connect live AI threat intelligence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => router.push("/login")}
                  className="w-full sm:w-auto bg-[#00ff88] hover:bg-[#00cc6a] text-black font-semibold text-xs px-6 py-5 rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(0,255,136,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Full Platform</span>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/signup")}
                  className="w-full sm:w-auto border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs px-6 py-5 rounded-lg cursor-pointer"
                >
                  <span>Create Free Account</span>
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  onClick={handleReset}
                  className="w-full sm:w-auto text-slate-400 hover:text-slate-200 text-xs px-4 cursor-pointer"
                >
                  <span>Try Another Sample</span>
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
