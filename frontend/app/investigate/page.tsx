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
          <div className="flex w-full flex-col gap-8 relative z-10 max-w-4xl mx-auto py-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-100 font-display uppercase tracking-wider">
                Threat Scanner
              </h1>
              <p className="text-sm text-slate-400 font-mono">
                Initialize multi-agent investigation on a suspicious payload
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
              <InvestigationReport trace={trace} />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
