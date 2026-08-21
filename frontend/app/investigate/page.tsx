"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { InvestigationForm } from "@/components/investigation/InvestigationForm";
import { InvestigationReport } from "@/components/investigation/InvestigationReport";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Shield, Brain } from "lucide-react";
import { startInvestigation, getInvestigation } from "@/lib/investigateApi";
import { InvestigationInput, InvestigationTrace } from "@/lib/investigationTypes";
import { logger } from "@/lib/logger";

export default function InvestigatePage() {
  const [trace, setTrace] = useState<InvestigationTrace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);

  const handleInvestigate = async (input: InvestigationInput) => {
    setIsInvestigating(true);
    setError(null);
    setTrace(null);

    try {
      logger.info("Investigation", "Starting Deep Investigation", { data: { length: input.jobText.length }});
      
      // 1. Kick off the investigation
      const initialTrace = await startInvestigation(input);
      setTrace(initialTrace);
      
      // 2. Since this backend route currently might await the whole python call, 
      // or if it returns immediately and we need to poll, we handle it here.
      // Based on investigationRoutes.ts, the backend awaits the investigateJob(req.body)
      // which awaits the python call. So `initialTrace` might already be COMPLETED.
      // If it's not, we would poll. For now, we just set the trace.
      
      if (initialTrace.state !== "COMPLETED" && initialTrace.state !== "FAILED") {
        // If the backend starts returning early for polling, we'd add polling logic here:
        pollInvestigation(initialTrace.investigationId);
      } else {
        setIsInvestigating(false);
      }
      
    } catch (err: any) {
      logger.error("Investigation", "Failed to run investigation", err);
      setError(err.message || "Failed to run Deep Investigation. Please try again.");
      setIsInvestigating(false);
    }
  };

  const pollInvestigation = async (id: string) => {
    try {
      const updatedTrace = await getInvestigation(id);
      setTrace(updatedTrace);
      
      if (updatedTrace.state === "COMPLETED" || updatedTrace.state === "FAILED") {
        setIsInvestigating(false);
      } else {
        setTimeout(() => pollInvestigation(id), 2000);
      }
    } catch (err) {
      console.error("Polling error", err);
      // Stop polling on error to avoid infinite loops, but keep the current trace state
      setIsInvestigating(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen relative">
        <div className="flex w-full flex-col gap-8 relative z-10">
          {/* Hero Section */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Phase 2 Agentic Pipeline
                </p>
                <h1 className="text-4xl font-bold tracking-tight text-slate-100">
                  Deep Investigation
                </h1>
              </div>
              <Button
                asChild
                variant="outline"
                className="rounded-full hover:bg-primary/10"
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
            <p className="max-w-3xl text-base leading-relaxed text-slate-400">
              Launch a multi-agent investigation into a job opportunity. Specialized AI investigators will concurrently analyze the payload, cross-reference recruiter identity, and search threat intelligence databases to build a comprehensive, evidence-backed verdict.
            </p>
          </section>

          {/* Form Content */}
          <div className="w-full">
            <InvestigationForm 
              onInvestigate={handleInvestigate} 
              isInvestigating={isInvestigating && !trace} 
            />
          </div>

          {/* Error Banner */}
          {error && (
            <ErrorAlert
              title="Investigation Failed"
              message={error}
              onDismiss={() => setError(null)}
              variant="destructive"
            />
          )}

          {/* Report Content */}
          {trace && (
            <div className="w-full mt-4">
              <InvestigationReport trace={trace} />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
