"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { RecentAnalysesTableComponent } from "@/components/dashboard/RecentAnalysesTable";

export default function InvestigationsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen relative px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1.5 border-b border-slate-800/80 pb-6">
          <h1 className="text-3xl font-serif text-slate-100 tracking-tight">
            Investigations
          </h1>
          <p className="text-sm text-slate-400 font-sans">
            Past job fraud investigations and multi-agent risk determinations.
          </p>
        </div>

        <section className="space-y-3">
          <RecentAnalysesTableComponent />
        </section>
      </div>
    </AuthGuard>
  );
}
