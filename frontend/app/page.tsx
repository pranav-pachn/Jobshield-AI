import Link from "next/link";

import { DashboardStats } from "@/components/DashboardStats";
import { ScamGraph } from "@/components/ScamGraph";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
      <section className="surface-grid relative overflow-hidden rounded-[2rem] border border-border/70 bg-white/80 px-6 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-10 lg:px-12">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-cyan-600 to-slate-900" />
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-amber-300/70 bg-amber-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
              Fraud intelligence for job seekers
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Detect fake job offers before they become a breach.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                JobShield AI combines NLP risk scoring, recruiter verification, and relationship mapping to expose scam campaigns across job posts, domains, and contact identities.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 rounded-full px-5">
                <Link href="/analyze">Open Analyzer</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-full px-5">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>

          <Card className="border border-slate-200/70 bg-slate-950 text-slate-50 shadow-none">
            <CardHeader>
              <CardTitle className="text-slate-50">Live signal summary</CardTitle>
              <CardDescription className="text-slate-300">
                Sample telemetry for the first dashboard iteration.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {[
                ["Scam probability", "89%"],
                ["Flagged domains", "27"],
                ["Linked recruiter IDs", "14"],
                ["Median response time", "420 ms"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
                  <div className="mt-3 text-3xl font-semibold text-white">{value}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <DashboardStats />
        <ScamGraph />
      </section>
    </main>
  );
}
