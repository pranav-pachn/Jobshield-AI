import React from "react";
import { AlertTriangle, Shield } from "lucide-react";
import { WhyItWasFlaggedPanel } from "./WhyItWasFlaggedPanel";
import { EvidenceSourcesPanel } from "./EvidenceSourcesPanel";
import { DomainIntelligencePanel } from "./DomainIntelligencePanel";
import { SimilarPatternPanel } from "./SimilarPatternPanel";
import { CommunityReportsPanel } from "./CommunityReportsPanel";
import { ConfidenceLevelPanel } from "./ConfidenceLevelPanel";
import { SourceLinksPanel } from "./SourceLinksPanel";
import { ReportDownloadPanel } from "./ReportDownloadPanel";

export interface EnrichedAnalysisData {
  _id?: string; // MongoDB _id for downloading reports
  scam_probability: number;
  risk_level: "Low" | "Medium" | "High";
  suspicious_phrases?: string[];
  reasons?: string[];
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
  ai_latency_ms?: number;
}

export interface ScamAnalysisDetailedViewProps {
  analysis: EnrichedAnalysisData;
}

/**
 * ScamAnalysisDetailedView
 * Main component that displays all explainable AI features
 * Shows detection results with detailed evidence and reasoning
 */
export const ScamAnalysisDetailedView: React.FC<
  ScamAnalysisDetailedViewProps
> = ({ analysis }) => {
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "High":
        return {
          bg: "bg-red-50",
          border: "border-red-300",
          badge: "bg-red-100 text-red-800",
          icon: "text-red-600",
          text: "text-red-900",
        };
      case "Medium":
        return {
          bg: "bg-orange-50",
          border: "border-orange-300",
          badge: "bg-orange-100 text-orange-800",
          icon: "text-orange-600",
          text: "text-orange-900",
        };
      case "Low":
        return {
          bg: "bg-green-50",
          border: "border-green-300",
          badge: "bg-green-100 text-green-800",
          icon: "text-green-600",
          text: "text-green-900",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-300",
          badge: "bg-gray-100 text-gray-800",
          icon: "text-gray-600",
          text: "text-gray-900",
        };
    }
  };

  const riskColors = getRiskColor(analysis.risk_level);

  // Safety checks for null/undefined data
  const scamProbability = analysis.scam_probability ?? 0;
  const riskLevel = analysis.risk_level ?? "Low";
  const confidenceLevel = analysis.confidence_level ?? "Medium";
  const latencyMs = analysis.ai_latency_ms ?? 0;

  return (
    <div className="w-full space-y-6">
      {/* Header with Risk Score - Fade in animation */}
      <div
        className={`rounded-lg border-2 ${riskColors.bg} ${riskColors.border} p-6 animate-fade-in-scale`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`h-6 w-6 ${riskColors.icon}`} />
              <h2 className={`text-2xl font-bold ${riskColors.text}`}>
                Analysis Result
              </h2>
            </div>
            <p className={`text-sm ${riskColors.text} opacity-90`}>
              Detailed scam detection breakdown
            </p>
          </div>

          <div className="text-right">
            <div className={`inline-block rounded-lg ${riskColors.badge} px-4 py-2 text-center animate-count-up`}>
              <p className="text-xs font-semibold">Risk Level</p>
              <p className="text-xl font-bold">{riskLevel}</p>
            </div>
          </div>
        </div>

        {/* Main Metrics with staggered animation */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-md bg-white/50 p-3 transition-all hover:bg-white/70">
            <p className="text-xs font-medium text-gray-600">Scam Probability</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(scamProbability * 100)}%
              </span>
              <div className="text-right text-xs text-gray-600">
                {latencyMs > 0 && (
                  <p>~{latencyMs}ms analysis</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-md bg-white/50 p-3 transition-all hover:bg-white/70">
            <p className="text-xs font-medium text-gray-600">Confidence</p>
            <p className="text-lg font-bold text-gray-900 mt-2">
              {confidenceLevel}
            </p>
          </div>
        </div>
      </div>

      {/* Explainable AI Panels */}
      <div className="space-y-4">
        {/* 1. Why It Was Flagged */}
        <WhyItWasFlaggedPanel
          suspicious_phrases={analysis.suspicious_phrases || []}
          phrase_details={analysis.phrase_details}
          reasons={analysis.reasons}
        />

        {/* 2. Evidence Sources */}
        <EvidenceSourcesPanel
          evidence_sources={analysis.evidence_sources}
          scam_probability={analysis.scam_probability}
        />

        {/* 3. Domain Intelligence */}
        <DomainIntelligencePanel
          domain_intelligence={analysis.domain_intelligence}
        />

        {/* 4. Similar Patterns */}
        <SimilarPatternPanel
          similar_patterns={analysis.similar_patterns}
          matching_templates={analysis.matching_templates}
        />

        {/* 5. Community Reports */}
        <CommunityReportsPanel
          community_report_count={analysis.community_report_count}
        />

        {/* 6. Confidence Level */}
        <ConfidenceLevelPanel
          confidence_level={analysis.confidence_level as "High" | "Medium" | "Low"}
          confidence_reason={analysis.confidence_reason}
          scam_probability={analysis.scam_probability}
        />

        {/* 7. Source Links */}
        <SourceLinksPanel
          source_links={analysis.source_links}
          risk_level={analysis.risk_level}
        />

        {/* 8. Report Generation */}
        <ReportDownloadPanel
          analysis_id={analysis._id}
          risk_level={analysis.risk_level}
          scam_probability={analysis.scam_probability}
        />
      </div>

      {/* Footer with Recommendations */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {analysis.risk_level === "High" && (
            <>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>Do not apply or provide personal information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>Report to FTC and the job platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-0.5">•</span>
                <span>Block the recruiter if contacted</span>
              </li>
            </>
          )}
          {analysis.risk_level === "Medium" && (
            <>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Verify company details independently</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Be cautious about sharing personal information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold mt-0.5">•</span>
                <span>Watch for red flags during interviews</span>
              </li>
            </>
          )}
          {analysis.risk_level === "Low" && (
            <>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">•</span>
                <span>Appears to be a legitimate job posting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">•</span>
                <span>Standard precautions still recommended</span>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};
