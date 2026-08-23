"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { InvestigationForm } from "@/components/investigation/InvestigationForm";
import { InvestigationReport } from "@/components/investigation/InvestigationReport";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ErrorAlert";
import { Shield, Brain } from "lucide-react";
import { streamInvestigation } from "@/lib/investigateApi";
import { InvestigationInput, InvestigationTrace } from "@/lib/investigationTypes";
import { logger } from "@/lib/logger";

export default function InvestigatePage() {
  const [trace, setTrace] = useState<InvestigationTrace | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInvestigating, setIsInvestigating] = useState(false);

  const handleInvestigate = async (input: InvestigationInput) => {
    setIsInvestigating(true);
    setError(null);
    // Initial trace state
    setTrace({
      investigationId: "streaming...",
      state: "RECEIVED",
      input,
      agentTraces: [],
      createdAt: new Date().toISOString()
    } as any);

    try {
      logger.info("Investigation", "Starting Deep Investigation Stream", { data: { length: input.jobText.length }});
      
      await streamInvestigation(
        input,
        (event) => {
          setTrace((prevTrace: any) => {
            if (!prevTrace) return prevTrace;
            const newTrace = { ...prevTrace };
            
            if (event.event === "STATE_UPDATE") {
              newTrace.state = event.state;
            } else if (event.event === "AGENT_COMPLETED") {
              newTrace.agentTraces = [...(newTrace.agentTraces || []), event.trace];
              if (event.agent === "content_investigator") {
                newTrace.contentFindings = event.trace.findings;
              } else if (event.agent === "recruiter_investigator") {
                newTrace.recruiterFindings = event.trace.findings;
              } else if (event.agent === "threat_intelligence_agent") {
                newTrace.threatFindings = event.trace.findings;
              } else if (event.agent === "evidence_aggregator") {
                newTrace.evidenceAggregation = event.trace.findings;
              } else if (event.agent === "final_decision_agent") {
                newTrace.finalDecision = event.trace.findings;
              }
            } else if (event.event === "COMPLETE") {
              return event.trace;
            }
            
            return newTrace;
          });
        },
        (err) => {
          logger.error("Investigation", "Stream error", err);
          setError(err.message || "Stream failed. Please try again.");
          setIsInvestigating(false);
        },
        () => {
          setIsInvestigating(false);
        }
      );
      
    } catch (err: any) {
      logger.error("Investigation", "Failed to run investigation", err);
      setError(err.message || "Failed to run Deep Investigation. Please try again.");
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
