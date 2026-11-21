"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { InvestigationForm } from "@/components/investigation/InvestigationForm";
import { InvestigationProgressTracker } from "@/components/investigation/InvestigationProgressTracker";
import { InvestigationReport } from "@/components/investigation/InvestigationReport";
import { DemoScenarioSelector } from "@/components/investigation/DemoScenarioSelector";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Button } from "@/components/ui/button";
import { RotateCcw, ArrowLeft, Sparkles, Activity, FlaskConical } from "lucide-react";
import { InvestigationInput, DemoScenario } from "@/lib/investigationTypes";
import { useInvestigationStream } from "@/hooks/useInvestigationStream";
import { useInvestigationStore } from "@/store/investigationStore";

export default function InvestigatePage() {
  const { executionMode, setExecutionMode } = useInvestigationStore();

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

  const handleRunDemoScenario = async (scenario: DemoScenario) => {
    await startStream({
      ...scenario.input,
      mode: "demo",
      scenarioId: scenario.id,
    } as any);
  };

  const handleSwitchToDemo = () => {
    setError(null);
    setExecutionMode("DEMO");
  };

  return (
    <AuthGuard>
      <div className="min-h-screen relative py-8 px-4 sm:px-6">
        <div className="flex w-full flex-col gap-6 relative z-10 max-w-4xl mx-auto">
          {/* Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/60">
            <div className="space-y-1">
              <h1 className="text-3xl font-serif text-slate-100 tracking-tight">
                Investigate a Job
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-sans">
                Analyze job postings, recruiter communications, or employment offers for fraudulent indicators and scam campaigns.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            {!trace && !isStreaming && (
              <div className="flex items-center self-start sm:self-auto p-1 bg-slate-900 border border-slate-800 rounded-lg shadow-inner">
                <button
                  type="button"
                  onClick={() => setExecutionMode("LIVE")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    executionMode === "LIVE"
                      ? "bg-slate-800 text-slate-100 shadow-sm border border-slate-700/80"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Live AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExecutionMode("DEMO")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    executionMode === "DEMO"
                      ? "bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/40"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                  <span>Demo Mode</span>
                </button>
              </div>
            )}
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
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={retryStream}
                  className="text-xs border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Retry Investigation</span>
                </Button>

                {/* Explicit Option to Switch to Demo Mode if Live AI is unreachable or rate limited */}
                {executionMode === "LIVE" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSwitchToDemo}
                    className="text-xs border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex items-center gap-1.5"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                    <span>Try Demo Scenarios (Offline Safe)</span>
                  </Button>
                )}

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

          {/* 3. Input Form or Demo Scenario Selector when idle */}
          {!trace && !isStreaming && (
            <div className="w-full">
              {executionMode === "LIVE" ? (
                <InvestigationForm
                  onInvestigate={handleInvestigate}
                  isInvestigating={isStreaming}
                />
              ) : (
                <DemoScenarioSelector
                  onSelectScenario={handleRunDemoScenario}
                  isLoading={isStreaming}
                />
              )}
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
                  <span>← {executionMode === "DEMO" ? "Select Another Demo Scenario" : "Investigate Another Opportunity"}</span>
                </Button>

                {trace.isSimulated && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    DEMO SIMULATION
                  </span>
                )}
              </div>
              <InvestigationReport trace={trace} onReset={reset} />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
