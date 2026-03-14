"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskResultCard } from "@/components/RiskResultCard";
import { ExplainableAISection } from "@/components/ExplainableAISection";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Loader2, AlertCircle, Scan, Crosshair, HelpCircle, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";

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
  const router = useRouter();
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
      const response = await apiFetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        onUnauthorized: () => router.replace("/login"),
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

  // Transform suspicious_phrases string array to object array with reasons
  const suspiciousPhrasesWithReasons = analysisResult
    ? analysisResult.suspicious_phrases.map((phrase) => ({
        text: phrase,
        reason: getPhrasReason(phrase),
      }))
    : [];

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
      <Card className="glass-card shadow-2xl border-primary/20 bg-background/50 overflow-hidden relative">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <CardHeader className="border-b border-border/50 pb-4 pt-6 bg-card/40">
          <CardTitle className="text-xl flex items-center gap-2 text-foreground font-mono">
            <Crosshair className="h-5 w-5 text-primary" />
            Target Payload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 bg-card/10">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Raw Content Entry
              </label>
              <button
                className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                onClick={handleClear}
              >
                <RotateCcw className="h-3 w-3" />
                Clear buffer
              </button>
            </div>
            <div className="relative group">
              <textarea
                value={jobText}
                onChange={(event) => setJobText(event.target.value)}
                className="min-h-[220px] w-full resize-y rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-sm font-mono text-gray-300 placeholder-gray-600 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
                placeholder="Paste suspicious job posting, recruiter message, or communication here..."
              />
              <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                {jobText.length} bytes loaded
              </div>
            </div>
          </div>

          {/* Quick chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground mr-1 flex items-center">
                <HelpCircle className="h-3 w-3 mr-1" /> Flag targets:
              </span>
              {QUICK_SCAMS.map((s) => (
                <button
                  key={s}
                  className="rounded-full border border-border bg-card/50 px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>

            <Button
              onClick={handleAnalyzeRisk}
              disabled={isAnalyzing || !jobText.trim()}
              size="lg"
              className="relative overflow-hidden group bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative flex items-center gap-2 font-semibold tracking-wide">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Commencing scan...
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4" />
                    Engage Scan
                  </>
                )}
              </div>
            </Button>
          </div>

          {analyzeError && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-5 mt-4 shadow-[0_0_15px_rgba(var(--destructive),0.1)]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm font-bold text-destructive uppercase tracking-wide">Operation Failed</p>
              </div>
              <p className="mt-2 text-sm text-destructive/80 font-mono">{analyzeError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex justify-center py-12">
          <LoadingSpinner message="Analyzing with sophisticated AI threat detection..." size="lg" />
        </div>
      )}

      {/* Results Container */}
      {analysisResult && !isAnalyzing && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          <RiskResultCard result={analysisResult} />
          
          <ExplainableAISection
            originalText={jobText}
            suspiciousPhrases={suspiciousPhrasesWithReasons}
            detectionReasons={analysisResult.reasons}
          />
          
          <ScamNetworkGraph />
        </div>
      )}
    </div>
  );
}

// Helper function to generate reason text for suspicious phrases
function getPhrasReason(phrase: string): string {
  const lowerPhrase = phrase.toLowerCase();

  if (
    lowerPhrase.includes("fee") ||
    lowerPhrase.includes("payment") ||
    lowerPhrase.includes("deposit")
  ) {
    return "Legitimate job postings never require upfront fees or payments. This is a common scam tactic to extract money before employment.";
  }

  if (
    lowerPhrase.includes("$") &&
    (lowerPhrase.includes("weekly") || lowerPhrase.includes("daily") || lowerPhrase.includes("hourly"))
  ) {
    return "Unrealistic earning promises with specific dollar amounts are red flags. Real positions don't guarantee exact earnings without significant experience.";
  }

  if (
    lowerPhrase.includes("telegram") ||
    lowerPhrase.includes("whatsapp") ||
    lowerPhrase.includes("signal")
  ) {
    return "Legitimate recruiters use professional communication channels, not encrypted messaging apps. This shift to personal chat apps suggests evasion attempts.";
  }

  if (
    lowerPhrase.includes("urgent") ||
    lowerPhrase.includes("immediately") ||
    lowerPhrase.includes("today") ||
    lowerPhrase.includes("asap")
  ) {
    return "High-pressure language and artificial urgency are classic social engineering tactics. Real hiring processes allow reasonable time for consideration.";
  }

  if (
    lowerPhrase.includes("click") ||
    lowerPhrase.includes("link") ||
    lowerPhrase.includes("verify")
  ) {
    return "Requests to click links or verify credentials are often phishing attempts. Scammers use these to harvest personal information or install malware.";
  }

  if (
    lowerPhrase.includes("training") ||
    lowerPhrase.includes("certification") ||
    lowerPhrase.includes("course")
  ) {
    return "Requiring paid training or certifications before employment is a common scam. Employers typically provide necessary training.";
  }

  return "This phrase exhibits characteristics commonly found in fraudulent job postings based on AI pattern analysis.";
}