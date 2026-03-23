"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { ThreatSummaryCards } from "@/components/dashboard/ThreatSummaryCards";
import { RiskDistributionChart } from "@/components/dashboard/RiskDistributionChart";
import { ScamTrendsChart } from "@/components/dashboard/ScamTrendsChart";
import { TopIndicatorsChart } from "@/components/dashboard/TopIndicatorsChart";
import { RecentAnalysesTableComponent } from "@/components/dashboard/RecentAnalysesTable";
import { ThreatActivityFeed } from "@/components/dashboard/ThreatActivityFeed";
import { LastAnalysisResultCard } from "@/components/dashboard/LastAnalysisResult";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

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
        <DashboardHeader />
        {/* Content */}
        <div className="relative z-10">
          {/* Main Content */}
          <div className="py-8 space-y-8">
            {/* Section 1: Threat Summary Cards */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                <h2 className="text-xl font-semibold text-foreground">
                  Threat Summary
                </h2>
              </div>
              <ThreatSummaryCards />
            </section>

            {/* Last Analysis Result Card */}
            <div>
              <LastAnalysisResultCard />
            </div>

            {/* Divider */}
            <div className="divider-gradient" />

            {/* Section 2 & 3: Charts Grid */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                <h2 className="text-xl font-semibold text-foreground">
                  Risk Analysis
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskDistributionChart />
                <ScamTrendsChart />
              </div>
            </section>

            {/* Divider */}
            <div className="divider-gradient" />

            {/* Section 4: Top Indicators */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                <h2 className="text-xl font-semibold text-foreground">
                  Scam Intelligence
                </h2>
              </div>
              <TopIndicatorsChart />
            </section>

            {/* Threat Activity Feed */}
            <div>
              <ThreatActivityFeed maxItems={5} />
            </div>

            {/* Divider */}
            <div className="divider-gradient" />

            {/* Section 5: Recent Analyses */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1 w-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                <h2 className="text-xl font-semibold text-foreground">
                  Detailed Records
                </h2>
              </div>
              <RecentAnalysesTableComponent />
            </section>

            {/* Footer Info */}
            <section className="border-t border-border/30 pt-8 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-blue-400">98.5%</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Detection Accuracy
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-green-400">24/7</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Monitoring Active
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-purple-400">Real-time</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    Data Updates
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