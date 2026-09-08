"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { RecentAnalysesTableComponent } from "@/components/dashboard/RecentAnalysesTable";
import { Activity } from "lucide-react";

export default function InvestigationsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen relative px-4 sm:px-6">
        <div className="relative z-10 py-8 space-y-8 max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100 font-display uppercase tracking-wider">
              Investigation History
            </h1>
            <p className="text-sm text-slate-400 font-mono">
              Historical record of all AI threat analyses and verdicts
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              All Records
            </h2>
            <RecentAnalysesTableComponent />
          </section>

        </div>
      </div>
    </AuthGuard>
  );
}
