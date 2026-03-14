import Link from "next/link";

import { DashboardStats } from "@/components/DashboardStats";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 lg:px-10">
        <section className="flex flex-col gap-4 rounded-2xl border border-gray-700 bg-gray-800 px-6 py-8 text-gray-50 shadow-xl sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-gray-400">Intelligence Dashboard</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-100">Track patterns across reports, domains, and recruiters.</h1>
            </div>
            <Button asChild variant="secondary" className="rounded-full bg-gray-700 hover:bg-gray-600 text-gray-100">
              <Link href="/analyze" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Run new analysis
              </Link>
            </Button>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-gray-300 sm:text-base">
            This view provides real-time threat trends, report intake analytics, and relationship discovery using AI-powered scam detection.
          </p>
        </section>

        <section className="grid gap-6">
          <DashboardStats />
        </section>
      </div>
    </main>
  );
}