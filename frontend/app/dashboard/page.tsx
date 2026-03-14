import { AppShell } from "@/components/AppShell";
import { DashboardStats } from "@/components/DashboardStats";
import { Activity, TrendingUp, Shield, Zap } from "lucide-react";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            Intelligence Dashboard
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Threat Overview
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Monitor real-time fraud patterns, analyze scam indicators, and track threat intelligence across job postings and recruiter networks.
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Detection Rate</p>
              <p className="text-lg font-semibold text-foreground">94.2%</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyber-purple/10">
              <Shield className="h-5 w-5 text-cyber-purple" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Protected Users</p>
              <p className="text-lg font-semibold text-foreground">12.4K</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-risk-low/10">
              <Zap className="h-5 w-5 text-risk-low" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Avg Response</p>
              <p className="text-lg font-semibold text-foreground">420ms</p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <DashboardStats />
      </div>
    </AppShell>
  );
}
