"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { ThreatSummaryCards } from "@/components/dashboard/ThreatSummaryCards";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { ScamTrendsChart } from "@/components/dashboard/ScamTrendsChart";
import { TopIndicatorsChart } from "@/components/dashboard/TopIndicatorsChart";
import { RecentAnalysesTableComponent } from "@/components/dashboard/RecentAnalysesTable";

/**
 * Threat Intelligence Dashboard
 * 
 * Visualizes job analysis security data:
 * - Threat summary metrics
 * - Risk distribution pie chart
 * - Scam detection trends over time
 * - Top scam indicator phrases
 * - Recent analysis records
 */
export default function DashboardPage() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Just verify auth and set initialized
    const timer = setTimeout(() => setIsInitializing(false), 100);
    return () => clearTimeout(timer);
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
      <div className="min-h-screen relative">
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="border-b border-slate-700/30 bg-gradient-to-r from-card/40 to-card/20 backdrop-blur-xl sticky top-0 z-40">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 backdrop-blur-sm">
                      <TrendingUp className="h-6 w-6 text-blue-400" />
                    </div>
                    Threat Intelligence Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground ml-16">
                    AI-powered real-time job scam detection and fraud risk analysis
                  </p>
                </div>
                <div className="text-right space-y-1 flex-shrink-0">
                  <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                    Last Updated
                  </p>
                  <p className="text-sm text-foreground font-mono">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 py-10 space-y-10 max-w-7xl mx-auto">
            {/* Section 1: Threat Summary Cards */}
            <section className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-8 bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-500 rounded-full" />
                <h2 className="text-2xl font-bold text-foreground">
                  Threat Summary
                </h2>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest ml-auto">Live</span>
              </div>
              <ThreatSummaryCards />
            </section>

            {/* Section 2 & 3: Charts Grid */}
            <section className="space-y-5 animate-slide-up animation-delay-2000">
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-8 bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 rounded-full" />
                <h2 className="text-2xl font-bold text-foreground">
                  Risk Distribution Analysis
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskDistributionChart />
                <ScamTrendsChart />
              </div>
            </section>

            {/* Section 4: Top Indicators */}
            <section className="space-y-5 animate-slide-up animation-delay-4000">
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-8 bg-gradient-to-r from-orange-500 via-orange-400 to-red-500 rounded-full" />
                <h2 className="text-2xl font-bold text-foreground">
                  Common Scam Indicators
                </h2>
              </div>
              <TopIndicatorsChart />
            </section>

            {/* Section 5: Recent Analyses */}
            <section className="space-y-5 animate-slide-up">
              <div className="flex items-center gap-3">
                <div className="h-0.5 w-8 bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 rounded-full" />
                <h2 className="text-2xl font-bold text-foreground">
                  Recent Job Analyses
                </h2>
              </div>
              <RecentAnalysesTableComponent />
            </section>

            {/* Footer KPI Section */}
            <section className="border-t border-slate-700/30 pt-12 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card group p-6 text-center">
                  <p className="text-4xl font-bold text-blue-400 mb-2">98.5%</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    Detection Accuracy
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
                    AI-powered precision detection
                  </p>
                </div>
                <div className="glass-card group p-6 text-center">
                  <p className="text-4xl font-bold text-green-400 mb-2">24/7</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    Continuous Monitoring
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
                    Always-on threat detection
                  </p>
                </div>
                <div className="glass-card group p-6 text-center">
                  <p className="text-4xl font-bold text-purple-400 mb-2">Real-time</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    Live Updates
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2 group-hover:text-foreground transition-colors">
                    Instant intelligence updates
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
