"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIThinkingSteps } from "@/components/AIThinkingSteps";
import { ErrorAlert } from "@/components/ErrorAlert";
import { ScamAnalysisDetailedView } from "@/components/explainableAI";
import { HighlightedJobText } from "@/components/HighlightedJobText";
import { DomainIntelligenceCard } from "@/components/DomainIntelligenceCard";
import { EmailAnalysisCard } from "@/components/EmailAnalysisCard";
import { FinalRecommendationCard } from "@/components/FinalRecommendationCard";
import { Save, Download, Trash2 } from "lucide-react";
import { Loader2, Scan, Crosshair, RotateCcw, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";
import { logger } from "@/lib/logger";

const ScamNetworkGraph = dynamic(
  () => import("@/components/ScamNetworkGraph").then((mod) => mod.ScamNetworkGraph),
  { ssr: false }
);

export interface AnalysisResult {
  _id?: string; // MongoDB _id for downloading reports
  scam_probability: number;
  risk_level: "Low" | "Medium" | "High";
  confidence?: number;
  suspicious_phrases?: string[];
  reasons?: string[];
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
  // Save-related fields
  saved_at?: string;
  is_saved?: boolean;
}

export function JobAnalyzer() {
  const [jobText, setJobText] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedEmails, setExtractedEmails] = useState<string[]>([]);
  const [extractedDomains, setExtractedDomains] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

  async function handleAnalyzeRisk() {
    if (!jobText.trim()) {
      setAnalyzeError("Please enter a job description to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAnalysisResult(null);

    // Extract emails and domains from text
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const domainRegex = /\b(?:https?:\/\/)?(?:www\.)?[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    
    const emails = [...new Set((jobText.match(emailRegex) || []).map(e => e.toLowerCase()))];
    const domains = [...new Set((jobText.match(domainRegex) || []).map(d => d.toLowerCase().replace(/^https?:\/\/(?:www\.)?/, '')))];
    
    setExtractedEmails(emails);
    setExtractedDomains(domains);

    logger.info("Analyzer", "Starting AI analysis with thinking steps", { 
      data: { textLength: jobText.length, emailsFound: emails.length, domainsFound: domains.length } 
    });
  }

  const handleClear = () => {
    setJobText("");
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
        job_text: jobText,
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

            {/* Primary CTAs */}
          <div className="flex gap-4">
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
      {isAnalyzing && (
        <AIThinkingSteps 
          isActive={isAnalyzing}
          onComplete={(analysis) => {
            setAnalysisResult(analysis as unknown as AnalysisResult);
            setIsAnalyzing(false);
          }}
          onError={(error) => {
            setAnalyzeError(error);
            setIsAnalyzing(false);
          }}
        />
      )}

      {/* Results Container */}
      {analysisResult && !isAnalyzing && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          {/* Final Recommendation Card */}
          <FinalRecommendationCard
            riskLevel={analysisResult.risk_level}
            riskScore={Math.round(analysisResult.scam_probability * 100)}
            suspiciousPhrases={analysisResult.suspicious_phrases}
            reasons={analysisResult.reasons}
            confidence={analysisResult.confidence}
          />

          <HighlightedJobText
            originalText={jobText}
            suspiciousPhrases={analysisResult.suspicious_phrases || []}
            phraseDetails={analysisResult.phrase_details}
          />

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
