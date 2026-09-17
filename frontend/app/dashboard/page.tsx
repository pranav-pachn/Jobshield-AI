"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DecisionDistributionChart } from "@/components/dashboard/DecisionDistributionChart";
import { RecentAnalysesTableComponent } from "@/components/dashboard/RecentAnalysesTable";
import { ScamTrendsPanel } from "@/components/dashboard/ScamTrendsPanel";
import { ThreatIntelPanel } from "@/components/dashboard/ThreatIntelPanel";
import { useDashboard } from "@/hooks/useDashboard";
import { ShieldAlert, ShieldCheck, UserCheck, Percent, ArrowRight, Search } from "lucide-react";

export default function DashboardPage() {
  const { intelligence: { overview }, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <AuthGuard>
        <DashboardSkeleton />
      </AuthGuard>
    );
  }

  const totalInvestigations = overview?.totalInvestigations ?? 0;
  const threatsDetected = overview?.scamCount ?? 0;
  const humanReviews = overview?.humanReviewCount ?? 0;
  const rawConf = overview?.averageConfidence ?? 0;
  const avgConfidence = Math.round(rawConf > 1 ? rawConf : rawConf * 100);

  return (
    <AuthGuard>
      <div className="min-h-screen relative px-4 sm:px-6 py-8">
        <div className="relative z-10 space-y-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/40 pb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-serif text-slate-100 tracking-tight">
                Intelligence Overview
              </h1>
              <p className="text-sm text-slate-400 font-sans">
                Monitor investigations and emerging threats.
              </p>
            </div>

            <Link
              href="/investigate"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-sans font-medium transition-colors shadow-sm self-start sm:self-auto"
            >
              <Search className="h-3.5 w-3.5" />
              Analyze a new job
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Metric Cards */}
          <section aria-label="Key Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-lg bg-surface-elevated border border-slate-800/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-sans font-medium">Investigations</span>
                <ShieldCheck className="h-4 w-4 text-blue-400" />
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-slate-100">
                {totalInvestigations}
              </div>
              <span className="text-[11px] text-slate-500 font-sans mt-1">Total jobs evaluated</span>
            </div>

            <div className="p-5 rounded-lg bg-surface-elevated border border-slate-800/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-sans font-medium">Threats Detected</span>
                <ShieldAlert className="h-4 w-4 text-red-400" />
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-red-400">
                {threatsDetected}
              </div>
              <span className="text-[11px] text-slate-500 font-sans mt-1">Confirmed fraudulent patterns</span>
            </div>

            <div className="p-5 rounded-lg bg-surface-elevated border border-slate-800/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-sans font-medium">Human Review</span>
                <UserCheck className="h-4 w-4 text-amber-400" />
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-amber-400">
                {humanReviews}
              </div>
              <span className="text-[11px] text-slate-500 font-sans mt-1">Cases requiring analyst attention</span>
            </div>

            <div className="p-5 rounded-lg bg-surface-elevated border border-slate-800/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-sans font-medium">Avg Confidence</span>
                <Percent className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-semibold text-slate-100">
                {avgConfidence}%
              </div>
              <span className="text-[11px] text-slate-500 font-sans mt-1">Across analyzed investigations</span>
            </div>
          </section>

          {/* Core Analytics Row */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-3">
              <div>
                <h2 className="text-base font-sans font-bold text-slate-100 tracking-tight">
                  Decision Distribution
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Proportions of analyzed cases.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-surface-elevated border border-slate-800/40 h-[calc(100%-2.5rem)]">
                <DecisionDistributionChart overview={overview ?? null} />
              </div>
            </div>

            <div className="lg:col-span-8 space-y-3">
              <div>
                <h2 className="text-base font-sans font-bold text-slate-100 tracking-tight">
                  Recent Investigations
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Latest job scam investigations processed across the workspace.
                </p>
              </div>
              <div className="bg-surface-elevated rounded-lg border border-slate-800/40 overflow-hidden">
                <RecentAnalysesTableComponent />
              </div>
            </div>
          </section>

          {/* Scam Trends & Threat Intelligence */}
          <section aria-label="Threat Trends and Intelligence" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <h2 className="text-base font-sans font-bold text-slate-100 tracking-tight">
                  Scam Patterns
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  High-frequency indicators extracted from recent cases.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-surface-elevated border border-slate-800/40">
                <ScamTrendsPanel />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-base font-sans font-bold text-slate-100 tracking-tight">
                  Threat Intelligence
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Active fraud networks and recurring campaign clusters.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-surface-elevated border border-slate-800/40">
                <ThreatIntelPanel />
              </div>
            </div>
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}

