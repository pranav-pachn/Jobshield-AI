"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { InvestigationForm } from "@/components/investigation/InvestigationForm";
import { InvestigationReport } from "@/components/investigation/InvestigationReport";
import { ErrorAlert } from "@/components/ui/error-alert";
import { InvestigationInput } from "@/lib/investigationTypes";
import { useInvestigationStream } from "@/hooks/useInvestigationStream";
import { useInvestigationStore } from "@/store/investigationStore";

export default function InvestigatePage() {
  const { trace, error, isStreaming, startStream, reset } = useInvestigationStream();
  const setError = useInvestigationStore(state => state.setError);

  const handleInvestigate = async (input: InvestigationInput) => {
    await startStream(input);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen relative py-8 px-4 sm:px-6">
        <div className="flex w-full flex-col gap-8 relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-serif text-slate-100 tracking-tight">
              Analyze a Job
            </h1>
            <p className="text-sm text-slate-400 font-sans">
              Check a job posting, recruiter message, or employment offer for fraudulent indicators.
            </p>
          </div>

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
              <InvestigationReport trace={trace} onReset={reset} />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
