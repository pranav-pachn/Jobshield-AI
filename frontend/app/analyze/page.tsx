import Link from "next/link";

import { JobAnalyzer } from "@/components/JobAnalyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, Eye } from "lucide-react";

const indicators = [
  "Fee requests or onboarding payments",
  "Unverifiable recruiter domains or throwaway email accounts", 
  "Urgent pressure tactics and unusual salary promises",
  "Near-duplicate language from known scam templates",
];

export default function AnalyzePage() {
  return (
    <main className="min-h-screen bg-gray-900">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 lg:px-10">
        <section className="flex flex-col gap-4 rounded-2xl border border-gray-700 bg-gray-800 px-6 py-8 shadow-xl sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-gray-400">Analyzer</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-100">Review a job post before you engage.</h1>
            </div>
            <Button asChild variant="outline" className="rounded-full border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Open dashboard
              </Link>
            </Button>
          </div>
          <p className="max-w-3xl text-sm leading-6 text-gray-300 sm:text-base">
            Paste a job description, recruiter message, or onboarding request. The analyzer combines phrase-rule detection, zero-shot AI classification, and semantic template matching to produce a unified risk score with explainable reasons.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <JobAnalyzer />

          <Card className="border-gray-700 bg-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-100">
                <Eye className="h-5 w-5" />
                What gets flagged
              </CardTitle>
              <CardDescription className="text-gray-400">
                These indicators map directly to the behavior described in the system spec.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {indicators.map((item) => (
                <div key={item} className="rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}