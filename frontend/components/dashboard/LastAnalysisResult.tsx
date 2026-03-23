"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingUp, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/RiskBadge";
import Link from "next/link";
import { LastAnalysisResult } from "@/lib/dashboardTypes";

/**
 * Last Analysis Result Component
 * Displays the most recent job analysis with full context
 * Item: #10 (Last Analysis Result) from dashboard enhancement plan
 */
export function LastAnalysisResultCard() {
  const [result, setResult] = useState<LastAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLastAnalysis = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${apiUrl}/api/jobs/recent?limit=1`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          // Extract the first recent analysis
          const analyses = Array.isArray(data.analyses) ? data.analyses : data.analyses?.analyses || [];
          if (analyses.length > 0) {
            const analysis = analyses[0];
            // Map job analysis to LastAnalysisResult format
            setResult({
              job_id: analysis._id?.toString() || "",
              job_title: analysis.job_title || "Job Analysis",
              company: analysis.company || "Unknown",
              risk_level: analysis.risk_level || "Medium",
              confidence: Math.round(((typeof analysis.confidence === "number" ? analysis.confidence : analysis.scam_probability) || 0) * 100),
              indicators: analysis.suspicious_phrases || analysis.indicators || [],
              analyzed_at: analysis.created_at || new Date().toISOString(),
            });
          } else {
            setError("No analysis results available yet");
          }
          setError(null);
        } else if (response.status === 404 || response.status >= 500) {
          // 404 = no analyses yet; 5xx = backend issue (treat same as empty)
          setError("No recent analysis available");
        } else {
          throw new Error(`Failed to fetch recent analyses: ${response.statusText}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.warn("LastAnalysisResultCard: could not load data —", errorMessage);
        setError("No recent analysis available");
      } finally {
        setLoading(false);
      }
    };

    loadLastAnalysis();
  }, []);

  if (loading) {
    return (
      <Card className="glow-border glow-border-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <Zap className="h-5 w-5 text-yellow-400" />
            Last Analysis Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !result) {
    return (
      <Card className="glow-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <Zap className="h-5 w-5 text-yellow-400" />
            Last Analysis Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {error || "No analysis result available"}
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeSinceAnalysis = Math.round(
    (Date.now() - new Date(result.analyzed_at).getTime()) / 1000 / 60
  );
  const timeLabel =
    timeSinceAnalysis < 1
      ? "just now"
      : timeSinceAnalysis < 60
      ? `${timeSinceAnalysis}m ago`
      : timeSinceAnalysis < 1440
      ? `${Math.round(timeSinceAnalysis / 60)}h ago`
      : `${Math.round(timeSinceAnalysis / 1440)}d ago`;

  return (
    <Card className="glow-border glow-border-hover border-l-4" style={{ borderLeftColor: result.risk_level === 'High' ? '#ff4d4f' : result.risk_level === 'Medium' ? '#f7b500' : '#2ecc71' }}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <Zap className="h-5 w-5 text-yellow-400" />
            Last Analysis Result
          </div>
          <span className="text-xs font-normal text-muted-foreground">
            {timeLabel}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job Title & Company */}
        <div>
          <p className="text-lg font-semibold text-foreground">{result.job_title}</p>
          <p className="text-sm text-muted-foreground">{result.company}</p>
        </div>

        {/* Risk Level & Confidence */}
        <div className="flex items-center justify-between">
          <RiskBadge level={result.risk_level} size="md" />
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Confidence:</span>
            <span className="text-lg font-bold text-foreground">{result.confidence}%</span>
          </div>
        </div>

        {/* Indicators */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Red Flags Detected
          </p>
          <div className="flex flex-wrap gap-2">
            {result.indicators.map((indicator, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/30"
              >
                <Zap className="h-3 w-3" />
                {indicator}
              </span>
            ))}
          </div>
        </div>

        {/* View Full Report Link */}
        <div className="pt-2 border-t border-border/50">
          <Link
            href={`/reports/${result.job_id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            View full analysis report <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
