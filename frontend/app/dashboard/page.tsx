"use client";

import { useState } from "react";
import { Loader2, ScanLine, Activity } from "lucide-react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { ThreatSummaryCards } from "@/components/dashboard/ThreatSummaryCards";
import { RecentAnalysesTableComponent } from "@/components/dashboard/RecentAnalysesTable";
import { QuickScanWidget, type QuickScanResult } from "@/components/dashboard/QuickScanWidget";
import { AIResultPanel } from "@/components/dashboard/AIResultPanel";
import { ScamTrendsPanel } from "@/components/dashboard/ScamTrendsPanel";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/context/AuthContext";
import { InvestigationEngineViz } from "@/components/dashboard/InvestigationEngineViz";

export default function DashboardPage() {
  const [scanResult, setScanResult] = useState<QuickScanResult | null>(null);
  const { intelligence: { overview }, isLoading } = useDashboard();

  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || "Analyst";
  
  // Format greeting based on time of day
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-slate-400 font-mono uppercase tracking-widest text-[10px]">
              Initializing Command Center...
            </p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen relative px-4 sm:px-6">
        <div className="relative z-10 py-6 space-y-10 max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100 font-display">
              {greeting}, {userName}
            </h1>
            <p className="text-sm text-slate-400">Threat intelligence overview</p>
          </div>

          {/* Section 1: Threat Summary Cards */}
          <section>
            <ThreatSummaryCards />
          </section>

          {/* Quick Scan Section */}
          <section className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <ScanLine className="h-4 w-4" />
              Quick Threat Scan
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="h-full">
                <QuickScanWidget onResult={setScanResult} onClear={() => setScanResult(null)} />
              </div>
              <div className="h-full">
                {scanResult ? (
                  <AIResultPanel result={scanResult} />
                ) : (
                  <InvestigationEngineViz />
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Recent Investigations */}
          <section className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Investigations
            </h2>
            <RecentAnalysesTableComponent />
          </section>

          {/* Section 4: Threat Activity */}
          <section className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500">
              Threat Activity
            </h2>
            <div className="bg-[#0b1220] border border-slate-800 rounded-xl p-6 shadow-xl">
              <ScamTrendsPanel />
            </div>
          </section>

        </div>
      </div>
    </AuthGuard>
  );
}
