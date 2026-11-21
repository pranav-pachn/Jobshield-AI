"use client";

import React, { useState, useEffect } from "react";
import { DemoScenario } from "@/lib/investigationTypes";
import { fetchDemoScenarios } from "@/lib/investigateApi";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Sparkles,
  Building,
  DollarSign,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DemoScenarioSelectorProps {
  onSelectScenario: (scenario: DemoScenario) => void;
  isLoading?: boolean;
}

const FALLBACK_SCENARIOS: DemoScenario[] = [
  {
    id: "demo-scam-equipment-check",
    title: "Remote Data Entry — Equipment Check Scam",
    category: "SCAM",
    description: "Classic advance-fee scam requesting the candidate to cash an upfront equipment check and wire funds to a third-party vendor.",
    input: {
      jobTitle: "Remote Data Entry Specialist",
      company: "Apex Global Logistics",
      companyDomain: "apex-global-logistics-careers.com",
      recruiterName: "Sarah Jenkins",
      email: "sarah.jenkins.hr@gmail.com",
      salary: "$45.00/hour",
      jobText: "Congratulations! You have been selected for the Remote Data Entry Specialist role at Apex Global Logistics. Salary is $45/hr with flexible hours. An initial check of $3,500 will be mailed to you immediately to purchase home office equipment from our certified vendor via Zelle or wire transfer.",
    }
  },
  {
    id: "demo-scam-telegram-crypto",
    title: "App Optimization — Telegram Crypto Task Scam",
    category: "SCAM",
    description: "High-yield task scam requiring users to review mobile apps and deposit cryptocurrency to unlock accumulated commission balances.",
    input: {
      jobTitle: "App Rating & Optimization Associate",
      company: "CloudScale Media Global",
      recruiterName: "Elena Rostova",
      salary: "300 - 800 USDT/day",
      jobText: "Hi! We offer part-time remote work helping app developers boost ratings. Earn 300 to 800 USDT daily working 1-2 hours on your phone. You will complete 38 rating tasks per set. A minimum wallet deposit of 100 USDT is required to activate higher commission tiers and withdraw.",
    }
  },
  {
    id: "demo-safe-tech-lead",
    title: "Senior Full-Stack Engineer — Stripe",
    category: "SAFE",
    description: "Legitimate enterprise software engineering opportunity with verified corporate email, matching ATS listing, and standard compensation.",
    input: {
      jobTitle: "Senior Full-Stack Software Engineer",
      company: "Stripe",
      companyDomain: "stripe.com",
      recruiterName: "Marcus Vance",
      email: "mvance@stripe.com",
      salary: "$175,000 - $210,000 / year + equity",
      jobText: "Stripe is seeking a Senior Full-Stack Software Engineer to join our Developer Platform team in San Francisco, CA or Remote (US). You will design high-throughput APIs, build developer dashboards with React and TypeScript, and collaborate with infrastructure teams.",
    }
  },
  {
    id: "demo-safe-healthcare-analyst",
    title: "Healthcare Data Analyst — Memorial Health System",
    category: "SAFE",
    description: "Verified institutional healthcare role featuring formal credential checks, legitimate hospital domain, and standard HR workflows.",
    input: {
      jobTitle: "Clinical Data Analyst",
      company: "Memorial Health System",
      companyDomain: "memorialhealth.org",
      recruiterName: "Karen Phillips",
      email: "kphillips@memorialhealth.org",
      salary: "$82,000 - $96,000 / year",
      jobText: "Memorial Health System is hiring a Clinical Data Analyst to support our Patient Quality Outcomes team in Columbus, OH. You will extract EHR data using SQL, generate Tableau compliance reports, and present quality metrics to clinical directors.",
    }
  },
  {
    id: "demo-review-stealth-startup",
    title: "Founding AI Engineer — Stealth Seed Venture",
    category: "HUMAN_REVIEW",
    description: "Early-stage startup with unlaunched product site and informal domain, requiring manual verification of founders and investors.",
    input: {
      jobTitle: "Founding Engineer (Generative AI)",
      company: "CognitiveFlow Labs (Stealth)",
      companyDomain: "cogflow-ai.co",
      recruiterName: "Devin K.",
      salary: "$140,000 + 2.5% Equity",
      jobText: "Hey! We saw your open-source agent work and loved it. We are building an enterprise context engine in stealth, backed by prominent angel investors. Looking for our first Founding Engineer to lead model evaluation and retrieval pipeline architecture.",
    }
  },
  {
    id: "demo-review-commission-sales",
    title: "Regional Sales Specialist — 100% Commission Model",
    category: "HUMAN_REVIEW",
    description: "B2B commercial sales position with aggressive recruiter pitch and 100% commission compensation, warranting candidate scrutiny of contract terms.",
    input: {
      jobTitle: "Regional Account Executive (Direct B2B)",
      company: "EverGreen Commercial Energy",
      companyDomain: "evergreen-commercial-energy.com",
      salary: "$120,000 - $180,000 Projected OTE (100% Commission)",
      jobText: "Urgent hiring! EverGreen Commercial Energy is expanding territory sales in the Midwest. High-energy closer needed immediately. Make up to $15,000/month selling commercial energy efficiency contracts to local business owners. Uncapped commission, weekly draw against commission, 1099 contractor status.",
    }
  }
];

export function DemoScenarioSelector({ onSelectScenario, isLoading = false }: DemoScenarioSelectorProps) {
  const [scenarios, setScenarios] = useState<DemoScenario[]>(FALLBACK_SCENARIOS);
  const [filter, setFilter] = useState<"ALL" | "SCAM" | "SAFE" | "HUMAN_REVIEW">("ALL");
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadScenarios() {
      try {
        setLoadingList(true);
        const data = await fetchDemoScenarios();
        if (mounted && Array.isArray(data) && data.length > 0) {
          setScenarios(data);
        }
      } catch {
        // Graceful fallback to embedded fixtures
      } finally {
        if (mounted) setLoadingList(false);
      }
    }
    loadScenarios();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredScenarios = scenarios.filter((s) => {
    if (filter === "ALL") return true;
    return s.category === filter;
  });

  return (
    <div className="space-y-6">
      {/* Intro banner */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-900/40 p-5 text-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wider font-mono">
                Deterministic Demo Scenarios
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Evaluate JobShield&apos;s multi-agent investigation architecture without executing live LLM inference or consuming API credits.
              Select any pre-configured scenario below to run an isolated simulation.
            </p>
          </div>
          <span className="shrink-0 px-2.5 py-1 text-[11px] font-mono rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300">
            Offline Safe
          </span>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80 mt-4">
          <span className="text-xs text-slate-400 font-sans mr-1">Filter by verdict:</span>
          {(["ALL", "SCAM", "SAFE", "HUMAN_REVIEW"] as const).map((cat) => {
            const isActive = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                    : "bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-200 hover:border-slate-600"
                }`}
              >
                {cat === "ALL" ? "All Scenarios" : cat === "HUMAN_REVIEW" ? "Human Review" : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScenarios.map((scenario) => {
          const isScam = scenario.category === "SCAM";
          const isSafe = scenario.category === "SAFE";

          return (
            <div
              key={scenario.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 transition-all p-5 space-y-4 shadow-sm group"
            >
              <div className="space-y-3">
                {/* Category badge */}
                <div className="flex items-center justify-between">
                  {isScam ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      <ShieldAlert className="w-3 h-3 text-rose-400" />
                      <span>SCAM</span>
                    </span>
                  ) : isSafe ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>SAFE</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>HUMAN REVIEW</span>
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Simulated
                  </span>
                </div>

                {/* Title & description */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-amber-200 transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                    {scenario.description}
                  </p>
                </div>

                {/* Key metadata tags */}
                <div className="space-y-1.5 text-[11px] text-slate-400 font-sans pt-1">
                  {scenario.input.company && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{scenario.input.company}</span>
                    </div>
                  )}
                  {scenario.input.salary && (
                    <div className="flex items-center gap-1.5 truncate">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate text-slate-300">{scenario.input.salary}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <Button
                type="button"
                size="sm"
                onClick={() => onSelectScenario(scenario)}
                disabled={isLoading}
                className="w-full text-xs font-medium border border-slate-700 bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400 text-slate-200 flex items-center justify-center gap-2 transition-all mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Scenario Demo</span>
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
