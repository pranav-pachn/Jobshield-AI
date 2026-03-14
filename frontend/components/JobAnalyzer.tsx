"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskResultCard } from "@/components/RiskResultCard";
import { SuspiciousTextHighlighter } from "@/components/SuspiciousTextHighlighter";
import { Loader2, AlertTriangle, Search, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

const ScamNetworkGraph = dynamic(
  () => import("@/components/ScamNetworkGraph").then((mod) => mod.ScamNetworkGraph),
  { ssr: false }
);

const seedText =
  "Remote data entry position. Earn $3000 weekly with no interview. Registration fee required today to secure onboarding. Contact hr-fasttrack@consultant-mail.net.";

export interface AnalysisResult {
  scam_probability: number;
  risk_level: "High" | "Medium" | "Low";
  reasons: string[];
  suspicious_phrases: string[];
  ai_latency_ms: number;
}

export function JobAnalyzer() {
  const [jobText, setJobText] = useState(seedText);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

  async function handleAnalyzeRisk() {
    if (!jobText.trim()) {
      setAnalyzeError("Please enter a job description to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setAnalysisResult(null);

    const requestUrl = `${backendBaseUrl}/api/jobs/analyze`;
    const requestBody = { text: jobText };

    try {
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(typeof data?.message === "string" ? data.message : "Analysis request failed");
      }

      setAnalysisResult(data);
    } catch (error) {
      setAnalysisResult(null);
      setAnalyzeError(error instanceof Error ? error.message : "Unknown analysis error");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Search className="h-5 w-5" />
            Job Scam Analyzer
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Paste a job description to analyze it for scam indicators using AI detection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Job description or recruiter message
            </label>
            <textarea
              value={jobText}
              onChange={(event) => setJobText(event.target.value)}
              className="min-h-40 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Paste a suspicious job post here..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={handleAnalyzeRisk} 
              disabled={isAnalyzing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Risk
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              AI-powered analysis typically takes 1-2 seconds
            </span>
          </div>

          {analyzeError && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <p className="text-sm font-medium text-destructive">Analysis failed</p>
              </div>
              <p className="mt-2 text-sm text-destructive/80">{analyzeError}</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">AI analyzing job description...</p>
                  <p className="text-xs text-muted-foreground">Running NLP models and pattern matching</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <>
          <RiskResultCard result={analysisResult} />
          <SuspiciousTextHighlighter 
            originalText={jobText} 
            phrases={analysisResult.suspicious_phrases}
          />
          <ScamNetworkGraph />
        </>
      )}
    </div>
  );
}
