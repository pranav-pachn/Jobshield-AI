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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface EnrichedAnalysisData {
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
          bg: "bg-gradient-to-br from-red-900/30 to-red-900/10",
          border: "border-red-500/40",
          badge: "bg-red-500/20 text-red-300",
          badgeBg: "from-red-500 to-red-600",
          icon: "text-red-400",
          text: "text-red-100",
          accent: "text-red-400",
          glow: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
        };
      case "Medium":
        return {
          bg: "bg-gradient-to-br from-amber-900/30 to-amber-900/10",
          border: "border-amber-500/40",
          badge: "bg-amber-500/20 text-amber-300",
          badgeBg: "from-amber-500 to-amber-600",
          icon: "text-amber-400",
          text: "text-amber-100",
          accent: "text-amber-400",
          glow: "shadow-[0_0_20px_rgba(217,119,6,0.3)]",
        };
      case "Low":
        return {
          bg: "bg-gradient-to-br from-emerald-900/30 to-emerald-900/10",
          border: "border-emerald-500/40",
          badge: "bg-emerald-500/20 text-emerald-300",
          badgeBg: "from-emerald-500 to-emerald-600",
          icon: "text-emerald-400",
          text: "text-emerald-100",
          accent: "text-emerald-400",
          glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        };
      default:
        return {
          bg: "bg-gradient-to-br from-slate-900/30 to-slate-900/10",
          border: "border-slate-500/40",
          badge: "bg-slate-500/20 text-slate-300",
          badgeBg: "from-slate-500 to-slate-600",
          icon: "text-slate-400",
          text: "text-slate-100",
          accent: "text-slate-400",
          glow: "shadow-[0_0_20px_rgba(100,116,139,0.3)]",
        };
    }
  };

  const riskColors = getRiskColor(analysis.risk_level);

  // Safety checks for null/undefined data
  const scamProbability = analysis.scam_probability ?? 0;
  const riskLevel = analysis.risk_level ?? "Low";
  const confidenceLevel = analysis.confidence_level ?? "Medium";
  const confidenceScore =
    typeof analysis.confidence === "number"
      ? analysis.confidence
      : confidenceLevel === "High"
      ? 0.91
      : confidenceLevel === "Medium"
      ? 0.75
      : 0.55;
  const latencyMs = analysis.ai_latency_ms ?? 0;

  return (
    <div className="w-full space-y-6">
      {/* Header with Risk Score - Professional SaaS Design */}
      <div
        className={`rounded-xl border ${riskColors.border} ${riskColors.bg} backdrop-blur-xl p-8 ${riskColors.glow} animate-fade-in-scale overflow-hidden relative group`}
      >
        {/* Gradient overlay effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-lg ${riskColors.bg} border ${riskColors.border}`}>
                  <Shield className={`h-6 w-6 ${riskColors.icon}`} />
                </div>
                <div>
                  <h2 className={`text-3xl font-bold tracking-tight ${riskColors.text}`}>
                    Analysis Result
                  </h2>
                  <p className={`text-sm ${riskColors.text} opacity-70 mt-1`}>
                    Comprehensive threat assessment
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Badge */}
            <div className="flex flex-col gap-2">
              <div className={`inline-flex flex-col items-center rounded-xl ${riskColors.badge} border ${riskColors.border} px-6 py-4 backdrop-blur-sm ${riskColors.glow}`}>
                <p className="text-xs font-semibold tracking-widest uppercase text-white/70">Risk Level</p>
                <p className={`text-3xl font-black mt-2 ${riskColors.accent}`}>{`${riskLevel.toUpperCase()} RISK`}</p>
              </div>
            </div>
          </div>

          {/* Main Metrics - Professional Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Scam Probability */}
            <div className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm p-4 hover:border-white/20 transition-all hover:bg-white/8 group/metric">
              <p className={`text-2xl font-black mt-3 ${riskColors.accent}`}>
                {`Scam Probability: ${Math.round(scamProbability * 100)}%`}
              </p>
              {/* Progress bar */}
              <div className="mt-4 w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    riskLevel === "High" ? "bg-gradient-to-r from-red-500 to-red-600" :
                    riskLevel === "Medium" ? "bg-gradient-to-r from-amber-500 to-amber-600" :
                    "bg-gradient-to-r from-emerald-500 to-emerald-600"
                  }`}
                  style={{ width: `${scamProbability * 100}%` }}
                />
              </div>
            </div>

            {/* Confidence Level */}
            <div className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm p-4 hover:border-white/20 transition-all hover:bg-white/8 group/metric">
              <p className="text-2xl font-black text-blue-400 mt-3">
                {`Confidence: ${Math.round(confidenceScore * 100)}%`}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {confidenceLevel === "High" ? "Highly reliable" : confidenceLevel === "Medium" ? "Moderately reliable" : "Low confidence"}
              </p>
            </div>

            {/* Analysis Speed */}
            <div className="rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm p-4 hover:border-white/20 transition-all hover:bg-white/8 group/metric">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover/metric:text-gray-300 transition-colors">Analysis Speed</p>
              <p className="text-3xl font-black text-purple-400 mt-3">
                {latencyMs > 0 ? `${latencyMs}ms` : "Ready"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {latencyMs < 1000 ? "Ultra fast" : latencyMs < 5000 ? "Standard" : "Complex analysis"}
              </p>
            </div>
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

        {/* 8. Recruiter Intelligence */}
        {analysis.domain_intelligence && (
          <Card className="glass-card border-border overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-4 pt-6 bg-card/40">
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Recruiter Threat Intelligence
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Analysis of recruiter identity, communication channels, and threat patterns.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Domain Intelligence */}
              {analysis.domain_intelligence.domain && (
                <div className="rounded-lg border border-border/30 bg-card/40 p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5">
                      🌐
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Domain Analysis
                      </p>
                      <p className="font-mono text-sm text-foreground break-all">
                        {analysis.domain_intelligence.domain}
                      </p>
                      {analysis.domain_intelligence.domain_age_days !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Domain Age: {analysis.domain_intelligence.domain_age_days} days
                          {analysis.domain_intelligence.recently_registered && (
                            <span className="text-destructive ml-2">(Recently Registered)</span>
                          )}
                        </p>
                      )}
                      {analysis.domain_intelligence.trust_score !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Trust Score: {analysis.domain_intelligence.trust_score}/100
                        </p>
                      )}
                      {analysis.domain_intelligence.threat_level && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Threat Level: {analysis.domain_intelligence.threat_level}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Communication Channels */}
              {analysis.domain_intelligence.communication_channels && analysis.domain_intelligence.communication_channels.length > 0 && (
                <div className="rounded-lg border border-border/30 bg-card/40 p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5">
                      📱
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Communication Channels
                      </p>
                      <div className="space-y-2">
                        {analysis.domain_intelligence.communication_channels.map((channel, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded border border-border/20 bg-card/20">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                <span className={
                                  channel.isVerified 
                                    ? "text-green-600" 
                                    : "text-destructive"
                                }>
                                  {channel.platform}
                                </span>
                                {channel.username && (
                                  <span className="text-muted-foreground ml-2">
                                    @{channel.username}
                                  </span>
                                )}
                              </p>
                              {channel.isVerified ? (
                                <div className="text-xs text-green-600 mt-1">✓ Verified</div>
                              ) : (
                                <div className="text-xs text-destructive mt-1">⚠ Unverified</div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={
                                channel.isVerified 
                                  ? "text-green-600" 
                                  : "text-destructive"
                              }>
                                {channel.isVerified ? "Safe" : "Risky"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Assessment */}
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <h4 className="text-lg font-semibold text-destructive">Recruiter Risk Assessment</h4>
                </div>
                <div className="space-y-3 text-sm text-foreground">
                  <p>
                    {analysis.domain_intelligence.threat_level === 'high' && (
                      <>
                        <strong>⚠️ High Risk Detected</strong>
                        <span className="ml-2">Multiple threat indicators found. Exercise extreme caution.</span>
                      </>
                    )}
                    {analysis.domain_intelligence.threat_level === 'medium' && (
                      <>
                        <strong>⚡ Medium Risk Detected</strong>
                        <span className="ml-2">Some concerning patterns identified. Verify independently.</span>
                      </>
                    )}
                    {analysis.domain_intelligence.threat_level === 'low' && (
                      <>
                        <strong>✅ Low Risk</strong>
                        <span className="ml-2">Recruiter appears legitimate based on available data.</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Analysis includes domain reputation, communication channel verification, and threat intelligence patterns.
                    Always verify recruiter identity through official channels before sharing personal information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 8. Report Generation */}
        <ReportDownloadPanel
          analysis_id={analysis._id}
          risk_level={analysis.risk_level}
          scam_probability={analysis.scam_probability}
        />
      </div>

      {/* Footer with Recommendations - Professional SaaS Style */}
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur-xl p-6 sm:p-8 hover:border-white/20 transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/40">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recommended Actions</h3>
            <p className="text-xs text-gray-400 mt-1">Follow these steps to protect yourself</p>
          </div>
        </div>
        
        <div className={`rounded-lg border backdrop-blur-sm p-4 mb-4 ${
          analysis.risk_level === "High" 
            ? "border-red-500/30 bg-red-500/10"
            : analysis.risk_level === "Medium"
            ? "border-amber-500/30 bg-amber-500/10"
            : "border-emerald-500/30 bg-emerald-500/10"
        }`}>
          <ul className={`space-y-3 text-sm ${
            analysis.risk_level === "High" 
              ? "text-red-200"
              : analysis.risk_level === "Medium"
              ? "text-amber-200"
              : "text-emerald-200"
          }`}>
            {analysis.risk_level === "High" && (
              <>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold text-lg mt-0">⚠</span>
                  <span className="pt-0.5"><strong>Do not apply</strong> or provide personal information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold text-lg mt-0">⚠</span>
                  <span className="pt-0.5"><strong>Report immediately</strong> to FTC and the job platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-400 font-bold text-lg mt-0">⚠</span>
                  <span className="pt-0.5"><strong>Block the recruiter</strong> if contacted directly</span>
                </li>
              </>
            )}
            {analysis.risk_level === "Medium" && (
              <>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 font-bold text-lg mt-0">⚡</span>
                  <span className="pt-0.5"><strong>Verify details</strong> independently through official company channels</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 font-bold text-lg mt-0">⚡</span>
                  <span className="pt-0.5"><strong>Be cautious</strong> about sharing personal information early</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-400 font-bold text-lg mt-0">⚡</span>
                  <span className="pt-0.5"><strong>Watch for red flags</strong> during the interview process</span>
                </li>
              </>
            )}
            {analysis.risk_level === "Low" && (
              <>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold text-lg mt-0">✓</span>
                  <span className="pt-0.5">This appears to be a <strong>legitimate job posting</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold text-lg mt-0">✓</span>
                  <span className="pt-0.5">Standard precautions <strong>still recommended</strong> for all applications</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
