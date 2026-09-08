"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RoleGuard } from "@/components/layout/RoleGuard";
import AnalystReviewQueue from "@/components/analyst/AnalystReviewQueue";

export default function ReviewQueuePage() {
  return (
    <RoleGuard allowedRoles={["ANALYST", "ADMIN"]}>
      <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/30">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
            <div className="max-w-4xl mx-auto space-y-10">
              <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-light text-white tracking-tight">Analyst Review Queue</h1>
                <p className="text-sm font-medium text-primary uppercase tracking-widest">Pending Validation</p>
              </header>
              <AnalystReviewQueue />
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
