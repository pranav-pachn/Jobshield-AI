"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 space-y-10 max-w-6xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-slate-800" />
          <Skeleton className="h-4 w-96 bg-slate-850" />
        </div>
        <Skeleton className="h-9 w-36 bg-slate-800 rounded-lg" />
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-lg bg-surface-elevated border border-slate-800/80 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24 bg-slate-800" />
              <Skeleton className="h-4 w-4 bg-slate-800" />
            </div>
            <Skeleton className="h-8 w-16 bg-slate-800" />
            <Skeleton className="h-3 w-32 bg-slate-850" />
          </div>
        ))}
      </div>

      {/* Decision Distribution Chart Skeleton */}
      <div className="p-6 rounded-lg bg-surface-elevated border border-slate-800/80 space-y-4">
        <Skeleton className="h-5 w-48 bg-slate-800" />
        <Skeleton className="h-48 w-full bg-slate-850 rounded" />
      </div>

      {/* Recent Analyses Skeleton */}
      <div className="p-6 rounded-lg bg-surface-elevated border border-slate-800/80 space-y-4">
        <Skeleton className="h-5 w-48 bg-slate-800" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full bg-slate-850 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
