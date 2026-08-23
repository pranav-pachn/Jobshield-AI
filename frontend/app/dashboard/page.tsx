"use client";

import { useState, useEffect } from "react";
import { Loader2, ScanLine } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { ThreatSummaryCards } from "@/components/dashboard/ThreatSummaryCards";
import { RecentAnalysesTableComponent } from "@/components/dashboard/RecentAnalysesTable";
import { LastAnalysisResultCard } from "@/components/dashboard/LastAnalysisResult";
import { QuickScanWidget, type QuickScanResult } from "@/components/dashboard/QuickScanWidget";
import { AIResultPanel } from "@/components/dashboard/AIResultPanel";
import { DecisionDistributionChart } from "@/components/dashboard/DecisionDistributionChart";
import { ConfidenceDistributionChart } from "@/components/dashboard/ConfidenceDistributionChart";
import { ScamTrendsPanel } from "@/components/dashboard/ScamTrendsPanel";
import { ThreatIntelPanel } from "@/components/dashboard/ThreatIntelPanel";
import { intelligenceApi } from "@/lib/intelligenceApi";
import { AnalyticsOverview } from "@/lib/intelligenceTypes";

export default function DashboardPage() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [scanResult, setScanResult] = useState<QuickScanResult | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    intelligenceApi.getOverview()
      .then(setOverview)
      .catch(console.error)
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  if (isInitializing) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading dashboard...
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen relative px-4 sm:px-6">
        {/* Content */}
        <div className="relative z-10">
          {/* Main Content */}
          <div className="py-8 space-y-8">
            {/* Section 1: Threat Summary Cards */}
            <section className="space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">
                Threat Summary
              </h2>
              <ThreatSummaryCards />
            </section>

            {/* Quick Scan Section */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <ScanLine className="h-4 w-4" />
                Quick Threat Scan
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                <QuickScanWidget onResult={setScanResult} onClear={() => setScanResult(null)} />
                {scanResult ? (
                  <AIResultPanel result={scanResult} />
                ) : (
                  <div className="hidden lg:flex items-center justify-center rounded-2xl border border-white/5 bg-white/[2%] border-dashed p-8 text-center text-muted-foreground">
                    <p className="text-sm">Paste a job posting and analyze it to see the AI assessment here.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Last Analysis Result Card */}
            <div>
              <LastAnalysisResultCard />
            </div>

            {/* Divider */}
            <div className="divider-gradient" />

            {/* Intelligence Analytics */}
            <section className="space-y-6">
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">
                JobShield Intelligence Analytics (Phase 5)
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                  <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center">
                    Decision Distribution
                  </h3>
                  <DecisionDistributionChart overview={overview} />
                </div>
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                  <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center">
                    Investigation Confidence & Risk
                  </h3>
                  <ConfidenceDistributionChart overview={overview} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                  <ScamTrendsPanel />
                </div>
                
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
                  <ThreatIntelPanel />
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className="divider-gradient" />

            {/* Section 5: Recent Analyses */}
            <section className="space-y-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4">
                Investigation Log
              </h2>
              <RecentAnalysesTableComponent />
            </section>

            {/* Footer Info */}
            <section className="border-t border-slate-800 pt-6 pb-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-[#00ff88]"></div> ENGINE ONLINE</span>
                  <span>v2.4.1-STABLE</span>
                </div>
                <div>SYSTEM NOMINAL</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
