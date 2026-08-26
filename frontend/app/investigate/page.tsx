"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { InvestigationForm } from "@/components/investigation/InvestigationForm";
import { InvestigationReport } from "@/components/investigation/InvestigationReport";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Shield, Brain } from "lucide-react";
import { InvestigationInput } from "@/lib/investigationTypes";
import { useInvestigationStream } from "@/hooks/useInvestigationStream";
import { useInvestigationStore } from "@/store/investigationStore";

export default function InvestigatePage() {
  const { trace, error, isStreaming, startStream } = useInvestigationStream();
  const setError = useInvestigationStore(state => state.setError);

  const handleInvestigate = async (input: InvestigationInput) => {
    await startStream(input);
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
              isInvestigating={isStreaming && !trace} 
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
