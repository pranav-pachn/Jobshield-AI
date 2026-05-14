"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIThinkingSteps } from "@/components/AIThinkingSteps";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ScamAnalysisDetailedView } from "@/components/explainableAI";
import type { UrlIntelligenceData } from "@/components/explainableAI/JobSourcePanel";
import type { ThreatIntelligenceData } from "@/components/explainableAI/ThreatIntelligencePanel";
import { DomainIntelligenceCard } from "@/components/DomainIntelligenceCard";
import { EmailAnalysisCard } from "@/components/EmailAnalysisCard";
import { Save, Link as LinkIcon, FileText, CheckCircle2 } from "lucide-react";
import { Loader2, Scan, Crosshair, RotateCcw, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { logger } from "@/lib/logger";

const ScamNetworkGraph = dynamic(
  () => import("@/components/ScamNetworkGraph").then((mod) => mod.ScamNetworkGraph),
  { ssr: false }
);

const NetworkGraph = dynamic(
  () => import("@/components/NetworkGraph"),
  { ssr: false }
);

export interface AnalysisResult {
  _id?: string; // MongoDB _id for downloading reports
  scam_probability: number;
  risk_score?: number;
  risk_level: "Low" | "Medium" | "High";
  confidence?: number;
  suspicious_phrases?: string[];
  reasons?: string[];
  summary_reasons?: string[];
  evidence_sources?: Array<{
    source: string;
    description: string;
    confidence: number;
  }>;
  phrase_details?: Array<{
    phrase: string;
    confidence: number;
    reason: string;
  }>;
  matching_templates?: string[];
  ai_latency_ms?: number;
  pipeline_metadata?: {
    ai_invoked: boolean;
    ai_latency_ms: number;
    rule_score: number;
    heuristic_score: number;
    ai_triggered_by: "high_uncertainty" | "not_needed";
    preprocessed_length: number;
  };
  domain_intelligence?: {
    domain?: string;
    domain_age_days?: number;
    trust_score?: number;
    threat_level?: "low" | "medium" | "high";
    recently_registered?: boolean;
  };
  url_intelligence?: UrlIntelligenceData;
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
  threat_intelligence?: ThreatIntelligenceData;
  graph_data?: {
    nodes: Array<{ id: string }>;
    links: Array<{ source: string; target: string }>;
  };
  // Save-related fields
  saved_at?: string;
  is_saved?: boolean;
}

type AnalysisViewData = AnalysisResult & {
  job_text?: string;
};

export function JobAnalyzer() {
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedEmails, setExtractedEmails] = useState<string[]>([]);
  const [extractedDomains, setExtractedDomains] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

  async function handleAnalyzeRisk() {
    const inputPayload = inputType === "text" ? jobText : jobUrl;
    if (!inputPayload.trim()) {
      setAnalyzeError(`Please enter a ${inputType === "text" ? "job description" : "job URL"} to analyze`);
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAnalysisResult(null);

    // Extract emails and domains from text
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const domainRegex = /\b(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    
    // If it's a URL, we implicitly extract the domain later or just let backend handle it, but we can do a quick check
    const textToExtract = inputType === "text" ? jobText : jobUrl;
    const emails = [...new Set((textToExtract.match(emailRegex) || []).map(e => e.toLowerCase()))];
    const domains = [...new Set((textToExtract.match(domainRegex) || []).map(d => d.toLowerCase().replace(/^https?:\/\/(?:www\.)?/, '')))];
    
    setExtractedEmails(emails);
    setExtractedDomains(domains);

    logger.info("Analyzer", "Starting AI analysis with thinking steps", { 
      data: { textLength: jobText.length, emailsFound: emails.length, domainsFound: domains.length } 
    });
  }

  const handleClear = () => {
    setJobText("");
    setJobUrl("");
    setAnalysisResult(null);
    setAnalyzeError(null);
    setIsSaved(false);
    setExtractedEmails([]);
    setExtractedDomains([]);
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult || isSaved || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      // Create a copy of the analysis result to save
      const analysisToSave = {
        ...analysisResult,
        // Add required fields for database storage
        job_text: inputType === "text" ? jobText : jobUrl,
        risk_score: Math.round(analysisResult.scam_probability * 100),
        indicators: {
          suspicious_phrases: analysisResult.suspicious_phrases || [],
          reasons: analysisResult.reasons || []
        },
        timestamp: new Date().toISOString(),
        // Add a timestamp and mark as saved
        saved_at: new Date().toISOString(),
        is_saved: true
      };

      // Call the backend API to save the analysis
      const response = await fetch(`${backendBaseUrl}/api/jobs/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisToSave),
      });

      if (!response.ok) {
        throw new Error('Failed to save analysis');
      }

      const savedAnalysis = await response.json();
      
      if (savedAnalysis) {
        // Update the analysis result with the saved data
        setAnalysisResult({
          ...analysisResult,
          _id: savedAnalysis._id,
          saved_at: savedAnalysis.saved_at,
          is_saved: true
        });
        setIsSaved(true);
        
        // Trigger real-time dashboard update
        const updateEvent = new CustomEvent('realtime-update', {
          detail: { 
            type: 'new_analysis', 
            data: { 
              analysis_id: savedAnalysis._id,
              risk_level: analysisResult.risk_level,
              timestamp: savedAnalysis.saved_at
            } 
          }
        });
        window.dispatchEvent(updateEvent);
        
        // Show success message
        alert("Analysis saved successfully! You can now generate reports.");
      }
    } catch (error) {
      console.error("Failed to save analysis:", error);
      alert("Failed to save analysis. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const QUICK_SCAMS = [
    "Advance Fee Fraud",
    "Fake Checks",
    "Reshipping Scam",
    "Phishing Link"
  ];
  const analysisViewData = analysisResult as AnalysisViewData | null;

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
                <div className="flex items-center gap-1 p-1 bg-black/40 rounded-lg border border-white/10 w-fit">
                  <button
                    onClick={() => setInputType("text")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                      inputType === "text" 
                        ? "bg-primary/20 text-primary border border-primary/30" 
                        : "text-muted-foreground hover:text-gray-300"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Raw Text
                  </button>
                  <button
                    onClick={() => setInputType("url")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
                      inputType === "url" 
                        ? "bg-primary/20 text-primary border border-primary/30" 
                        : "text-muted-foreground hover:text-gray-300"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    Job URL
                  </button>
                </div>
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
              {inputType === "text" ? (
                <>
                  <textarea
                    value={jobText}
                    onChange={(event) => setJobText(event.target.value)}
                    className="min-h-[220px] w-full resize-y rounded-xl border border-white/10 bg-black/50 px-5 py-4 text-sm font-mono text-gray-200 placeholder-gray-600 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-inner group-hover/textarea:border-white/20"
                    placeholder="Paste suspicious job posting, recruiter message, or communication here..."
                  />
                  <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground/60 group-hover/textarea:text-muted-foreground transition-colors">
                    {jobText.length} bytes loaded
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(event) => setJobUrl(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-5 py-4 text-sm font-mono text-gray-200 placeholder-gray-600 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-inner group-hover/textarea:border-white/20"
                    placeholder="https://linkedin.com/jobs/view/..."
                  />
                  <div className="absolute top-4 right-4 text-[10px] text-muted-foreground/60 group-hover/textarea:text-muted-foreground transition-colors">
                    {jobUrl.length > 0 ? "URL ready" : "Awaiting URL"}
                  </div>
                </>
              )}
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

            {/* Primary CTAs */}
          <div className="flex gap-4">
            <Button
              onClick={handleAnalyzeRisk}
              disabled={isAnalyzing || (inputType === "text" ? !jobText.trim() : !jobUrl.trim())}
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

            {/* Save Analysis Button */}
            {analysisResult && (
              <Button
                onClick={handleSaveAnalysis}
                disabled={isSaving || isSaved}
                size="lg"
                variant="outline"
                className="flex items-center gap-2 border-2 border-green-500/20 hover:border-green-400/30 hover:bg-green-50/10 text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Analysis...</span>
                  </>
                ) : isSaved ? (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Analysis Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Analysis</span>
                  </>
                )}
              </Button>
            )}
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
          </div>
        </CardContent>
      </Card>

      {/* AI Thinking Steps */}
      {isAnalyzing &&          <AIThinkingSteps 
            isActive={isAnalyzing} 
            onComplete={(analysis: AnalysisResult) => {
              console.log("Analysis completed with result:", analysis);
              setAnalysisResult(analysis);
              setIsAnalyzing(false);
            }} 
            onError={(error: string) => {
              setAnalyzeError(error);
              setIsAnalyzing(false);
            }} 
            jobPayload={inputType === "text" ? jobText : jobUrl}
          />
      }

      {/* Results Container */}
      {analysisResult && !isAnalyzing && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          
          {/* System Messages Banner */}
          <div className="flex flex-col gap-2">
            {analysisResult.community_report_count !== undefined && analysisResult.community_report_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Signal aggregation matched {analysisResult.community_report_count} known threat signatures from the intelligence network.</span>
              </div>
            )}
          </div>

          {/* Complete Explainable AI Report */}
          <ScamAnalysisDetailedView 
            analysis={analysisViewData as AnalysisViewData}
            job_text={inputType === "text" ? jobText : analysisViewData?.job_text || jobUrl}
            is_saved={isSaved}
            onSave={handleSaveAnalysis}
          />
          
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
          
          {/* Network Graph */}
          {analysisResult.graph_data && analysisResult.graph_data.nodes.length > 0 ? (
            <NetworkGraph graphData={analysisResult.graph_data} />
          ) : analysisResult._id ? (
            <ScamNetworkGraph jobAnalysisId={analysisResult._id} />
          ) : null}
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
