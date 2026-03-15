"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Dashboard Loading Skeleton
 * Displays skeleton screens while dashboard data loads
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen space-y-8">
      {/* Header Skeleton */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <Skeleton className="h-8 w-96" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 space-y-8 max-w-7xl mx-auto">
        {/* Threat Summary Cards Skeleton */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="glass-card shadow-xl glow-border">
                <CardHeader>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full" />

        {/* Charts Section Skeleton */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card shadow-xl glow-border">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full rounded-lg" />
              </CardContent>
            </Card>
            <Card className="glass-card shadow-xl glow-border">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Divider */}
        <div className="h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full" />

        {/* Top Indicators Skeleton */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Card className="glass-card shadow-xl glow-border">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-96 w-full rounded-lg" />
            </CardContent>
          </Card>
        </section>

        {/* Divider */}
        <div className="h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full" />

        {/* Recent Analyses Table Skeleton */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Card className="glass-card shadow-xl overflow-hidden glow-border">
            <CardContent className="p-0">
              <div className="space-y-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-border p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
