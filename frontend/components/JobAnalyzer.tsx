"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProgressSteps } from "@/components/ProgressSteps";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ScamAnalysisDetailedView } from "@/components/explainableAI";
import { DomainIntelligenceCard } from "@/components/DomainIntelligenceCard";
import { EmailAnalysisCard } from "@/components/EmailAnalysisCard";
import { Loader2, AlertCircle, Scan, Crosshair, HelpCircle, RotateCcw, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";
import { logger } from "@/lib/logger";

const ScamNetworkGraph = dynamic(
  () => import("@/components/ScamNetworkGraph").then((mod) => mod.ScamNetworkGraph),
  { ssr: false }
);

export interface AnalysisResult {
  _id?: string; // MongoDB _id for report generation
  scam_probability: number;
  risk_level: "High" | "Medium" | "Low";
  reasons: string[];
  suspicious_phrases: string[];
  ai_latency_ms: number;
  // Explainable AI enriched fields
  evidence_sources?: Array<{
    source: string;
    description: string;
    confidence: number;
  }>;
  domain_intelligence?: {
    domain?: string;
    domain_age_days?: number;
    trust_score?: number;
    threat_level?: "low" | "medium" | "high";
    recently_registered?: boolean;
  };
  similar_patterns?: Array<{
    pattern: string;
    frequency: number;
    confidence: number;
  }>;
  community_report_count?: number;
  confidence_level?: "High" | "Medium" | "Low";
  confidence_reason?: string;
  source_links?: Array<{
    title: string;
    url: string;
    category: string;
  }>;
  phrase_details?: Array<{
    phrase: string;
    confidence: number;
    reason: string;
  }>;
  matching_templates?: string[];
  component_scores?: {
    rule_score?: number;
    zero_shot_score?: number;
    similarity_score?: number;
  };
}

export function JobAnalyzer() {
  const router = useRouter();
  const [jobText, setJobText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [extractedEmails, setExtractedEmails] = useState<string[]>([]);
  const [extractedDomains, setExtractedDomains] = useState<string[]>([]);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

  const ANALYSIS_STEPS = [
    "Extracting job entities...",
    "Detecting scam indicators...",
    "Checking scam patterns...",
    "Generating investigation report...",
  ];

  async function handleAnalyzeRisk() {
    if (!jobText.trim()) {
      setAnalyzeError("Please enter a job description to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAnalysisResult(null);
    setLoadingStep(0);

    // Extract emails and domains from text
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const domainRegex = /\b(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    
    const emails = [...new Set((jobText.match(emailRegex) || []).map(e => e.toLowerCase()))];
    const domains = [...new Set((jobText.match(domainRegex) || []).map(d => d.toLowerCase().replace(/^https?:\/\/(?:www\.)?/, '')))];
    
    setExtractedEmails(emails);
    setExtractedDomains(domains);

    const requestUrl = `${backendBaseUrl}/api/jobs/analyze`;
    const requestBody = { text: jobText };

    logger.info("Analyzer", "Sending job analysis request", { 
      data: { textLength: jobText.length, emailsFound: emails.length, domainsFound: domains.length } 
    });

    try {
      const response = await apiFetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        onUnauthorized: () => router.replace("/login"),
      });

      // Simulate step progression during loading
      const stepInterval = setInterval(() => {
        setLoadingStep((prev) => Math.min(prev + 1, ANALYSIS_STEPS.length - 1));
      }, 800);

      const data = await response.json();
      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error(typeof data?.message === "string" ? data.message : "Analysis request failed");
      }

      logger.info("Analyzer", "AI response received", { 
        data: { riskLevel: data.risk_level, probability: data.scam_probability } 
      });
      setAnalysisResult(data);
    } catch (error) {
      setAnalysisResult(null);
      const errorMessage = error instanceof Error ? error.message : "Unknown analysis error";
      logger.error("Analyzer", "Analysis failed", { data: { error: errorMessage } });
      setAnalyzeError(errorMessage);
    } finally {
      setIsAnalyzing(false);
      setLoadingStep(0);
    }
  }

  const handleClear = () => {
    setJobText("");
    setAnalysisResult(null);
    setAnalyzeError(null);
  };

  const QUICK_SCAMS = [
    "Advance Fee Fraud",
    "Fake Checks",
    "Reshipping Scam",
    "Phishing Link"
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header Info */}
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Intelligence Analyzer</h1>
        <p className="text-muted-foreground max-w-3xl">
          Instantly evaluate suspicious communications, job postings, or direct messages. Advanced AI threat intelligence will cross-reference payloads against known adversary patterns and provide detailed reasoning.
        </p>
      </div>

      {/* Main Analyzer Card */}
      <Card className="glass-card-accent shadow-2xl border-primary/30 overflow-hidden relative group">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary via-secondary to-transparent" />
        <CardHeader className="border-b border-white/10 pb-4 pt-6 bg-gradient-to-br from-card/60 to-card/30">
          <CardTitle className="text-lg flex items-center gap-3 text-foreground font-mono">
            <Crosshair className="h-5 w-5 text-primary" />
            Target Payload Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Raw Content Entry
              </label>
              <button
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/10"
                onClick={handleClear}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear buffer
              </button>
            </div>
            <div className="relative group/textarea">
              <textarea
                value={jobText}
                onChange={(event) => setJobText(event.target.value)}
                className="min-h-[220px] w-full resize-y rounded-xl border border-white/10 bg-black/50 px-5 py-4 text-sm font-mono text-gray-200 placeholder-gray-600 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-inner group-hover/textarea:border-white/20"
                placeholder="Paste suspicious job posting, recruiter message, or communication here..."
              />
              <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground/60 group-hover/textarea:text-muted-foreground transition-colors">
                {jobText.length} bytes loaded
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="space-y-4">
            {/* Quick filter chips */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500/70" />
                Quick threat flags:
              </span>
              <div className="flex flex-wrap gap-2">
                {QUICK_SCAMS.map((s) => (
                  <button
                    key={s}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-all hover:bg-primary/20 hover:border-primary/50 hover:text-primary hover:shadow-[0_0_12px_rgba(96,125,255,0.2)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary CTA */}
            <Button
              onClick={handleAnalyzeRisk}
              disabled={isAnalyzing || !jobText.trim()}
              size="lg"
              className="relative w-full overflow-hidden group bg-gradient-to-r from-primary to-primary/80 hover:shadow-[0_0_30px_rgba(96,125,255,0.4)] text-white rounded-lg px-8 font-bold tracking-wide transition-all disabled:opacity-50 disabled:shadow-none"
            >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out" />
              <div className="relative flex items-center justify-center gap-2">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing Payload...</span>
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5" />
                    <span>Engage Analysis</span>
                  </>
                )}
              </div>
            </Button>
          </div>

          {analyzeError && (
            <ErrorAlert
              title="Analysis Failed"
              message={analyzeError}
              onRetry={handleAnalyzeRisk}
              onDismiss={() => setAnalyzeError(null)}
              variant="destructive"
            />
          )}
        </CardContent>
      </Card>

      {/* Loading State with Progress Steps */}
      {isAnalyzing && (
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-card/60 to-card/40 p-12 flex flex-col items-center gap-8 shadow-2xl animate-slide-up">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2 text-center">AI analyzing job description...</h3>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Running threat analysis against known scam patterns
            </p>
          </div>
          <ProgressSteps steps={ANALYSIS_STEPS} currentStep={loadingStep} />
        </div>
      )}

      {/* Results Container */}
      {analysisResult && !isAnalyzing && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {/* Main Explainable AI Component */}
          <ScamAnalysisDetailedView analysis={analysisResult} />
          
          {/* Domain and Email Analysis */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Domain Intelligence Cards */}
            {extractedDomains.map((domain, index) => (
              <DomainIntelligenceCard 
                key={`domain-${index}`}
                domain={domain}
                onDataReceived={(data) => {
                  console.log('Domain intelligence received:', data);
                }}
              />
            ))}
            
            {/* Email Analysis Cards */}
            {extractedEmails.map((email, index) => (
              <EmailAnalysisCard 
                key={`email-${index}`}
                email={email}
                onDataReceived={(data) => {
                  console.log('Email analysis received:', data);
                }}
              />
            ))}
          </div>
          
          {/* Network Graph with Real Correlations */}
          {analysisResult._id && (
            <ScamNetworkGraph jobAnalysisId={analysisResult._id} />
          )}
        </div>
      )}
    </div>
  );
}

// Note: To use individual components instead of ScamAnalysisDetailedView,
// import and use them directly:
// import {
//   WhyItWasFlaggedPanel,
//   EvidenceSourcesPanel,
//   DomainIntelligencePanel,
//   SimilarPatternPanel,
//   CommunityReportsPanel,
//   ConfidenceLevelPanel,
//   SourceLinksPanel,
// } from "@/components/explainableAI";