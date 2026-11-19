"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { InvestigationForm } from "@/components/investigation/InvestigationForm";
import { InvestigationProgressTracker } from "@/components/investigation/InvestigationProgressTracker";
import { InvestigationReport } from "@/components/investigation/InvestigationReport";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft } from "lucide-react";
import { InvestigationInput } from "@/lib/investigationTypes";
import { useInvestigationStream } from "@/hooks/useInvestigationStream";
import { useInvestigationStore } from "@/store/investigationStore";

export default function InvestigatePage() {
  const {
    trace,
    error,
    isStreaming,
    status,
    agentStates,
    startStream,
    cancelStream,
    retryStream,
    reset,
  } = useInvestigationStream();

  const setError = useInvestigationStore((state) => state.setError);

  const handleInvestigate = async (input: InvestigationInput) => {
    await startStream(input);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen relative py-8 px-4 sm:px-6">
        <div className="flex w-full flex-col gap-6 relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-serif text-slate-100 tracking-tight">
              Investigate a Job
            </h1>
            <p className="text-sm text-slate-400 font-sans">
              Analyze job postings, recruiter communications, or employment offers for fraudulent indicators and scam campaigns.
            </p>
          </div>

          {/* 1. Live Progress Tracker while running */}
          {isStreaming && !trace && (
            <div className="w-full">
              <InvestigationProgressTracker
                status={status}
                agentStates={agentStates}
                onCancel={cancelStream}
              />
            </div>
          )}

          {/* 2. Error Banner & Recovery Actions */}
          {error && !isStreaming && (
            <div className="space-y-3">
              <ErrorAlert
                title="Investigation Interrupted"
                message={error}
                onDismiss={() => setError(null)}
                variant="destructive"
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={retryStream}
                  className="text-xs border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Retry Investigation</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={reset}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  <span>Start New Investigation</span>
                </Button>
              </div>
            </div>
          )}

          {/* 3. Input Form when idle or ready */}
          {!trace && !isStreaming && (
            <div className="w-full">
              <InvestigationForm
                onInvestigate={handleInvestigate}
                isInvestigating={isStreaming}
              />
            </div>
          )}

          {/* 4. Canonical Report Content when completed */}
          {trace && (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Investigate Another Opportunity</span>
                </Button>
              </div>
              <InvestigationReport trace={trace} onReset={reset} />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
