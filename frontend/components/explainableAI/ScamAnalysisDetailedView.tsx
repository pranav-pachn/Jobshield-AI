import React, { useState } from "react";
import { 
  Shield, Save, FileText, Search, Activity, Copy, 
  Calculator, Network, CheckCircle2
} from "lucide-react";
import { AnalysisSection } from "./AnalysisSection";
import { RiskSummaryCard } from "./RiskSummaryCard";
import { WhyItWasFlaggedPanel } from "./WhyItWasFlaggedPanel";
import { EvidenceSourcesPanel } from "./EvidenceSourcesPanel";
import { DomainIntelligencePanel } from "./DomainIntelligencePanel";
import { SimilarPatternPanel } from "./SimilarPatternPanel";
import { CommunityReportsPanel } from "./CommunityReportsPanel";
import { SourceLinksPanel } from "./SourceLinksPanel";
import { ReportDownloadPanel } from "./ReportDownloadPanel";
import { JobSourcePanel, UrlIntelligenceData } from "./JobSourcePanel";
import { ThreatIntelligencePanel, ThreatIntelligenceData } from "./ThreatIntelligencePanel";
import { BehavioralIndicatorsPanel } from "./BehavioralIndicatorsPanel";
import { ConfidenceBreakdownPanel } from "./ConfidenceBreakdownPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HighlightedJobText } from "@/components/HighlightedJobText";
import { FinalRecommendationCard } from "@/components/FinalRecommendationCard";

export interface EnrichedAnalysisData {
  _id?: string;
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
  domain_intelligence?: {
    domain?: string;
    domain_age_days?: number;
    trust_score?: number;
    threat_level?: "low" | "medium" | "high";
    recently_registered?: boolean;
    communication_channels?: Array<{
      platform: string;
      username?: string;
      isVerified: boolean;
    }>;
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
  threat_intelligence?: ThreatIntelligenceData;
  phrase_details?: Array<{
    phrase: string;
    confidence: number;
    reason: string;
  }>;
  matching_templates?: string[];
  ai_latency_ms?: number;
  url_intelligence?: UrlIntelligenceData;
  pipeline_metadata?: {
    ai_invoked?: boolean;
    ai_latency_ms?: number;
    rule_score: number;
    heuristic_score: number;
    ai_triggered_by?: string;
    preprocessed_length?: number;
  };
}

export interface ScamAnalysisDetailedViewProps {
  analysis: EnrichedAnalysisData;
  job_text?: string;
  is_saved?: boolean;
  onSave?: () => void;
}

/* ─── main component ──────────────────────────────────────── */
export const ScamAnalysisDetailedView: React.FC<ScamAnalysisDetailedViewProps> = ({
  analysis,
  job_text,
  is_saved,
  onSave,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const scamPct = analysis.risk_score ?? Math.round((analysis.scam_probability ?? 0) * 100);
  const confidenceScore = typeof analysis.confidence === "number"
    ? analysis.confidence
    : analysis.confidence_level === "High" ? 0.91
    : analysis.confidence_level === "Medium" ? 0.75 : 0.55;
  const confPct = Math.round(confidenceScore * 100);

  const topDrivers = (analysis.summary_reasons?.length ? analysis.summary_reasons : analysis.reasons ?? []).slice(0, 4);

  const handleSave = async () => {
    if (!onSave || isSaving || is_saved) return;
    setIsSaving(true);
    try { await onSave(); } 
    catch (e) { console.error("Save failed:", e); } 
    finally { setIsSaving(false); }
  };

  return (
    <div className="w-full space-y-10">

      {/* ═══════════════════════════════════════════════════════
          SECTION 1 · RISK SUMMARY
      ════════════════════════════════════════════════════════ */}
      <AnalysisSection number={1} icon={<Shield className="h-4 w-4" />} title="Risk Summary">
        <RiskSummaryCard
          riskLevel={analysis.risk_level}
          riskScore={scamPct}
          confidencePercent={confPct}
          reasons={topDrivers}
        />
      </AnalysisSection>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 · WHY IT WAS FLAGGED
      ════════════════════════════════════════════════════════ */}
      <AnalysisSection number={2} icon={<Shield className="h-4 w-4" />} title="Why It Was Flagged">
        <WhyItWasFlaggedPanel
          suspicious_phrases={analysis.suspicious_phrases || []}
          phrase_details={analysis.phrase_details}
          reasons={analysis.reasons}
        />
      </AnalysisSection>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 · HIGHLIGHTED JOB TEXT
      ════════════════════════════════════════════════════════ */}
      {job_text && (
        <AnalysisSection number={3} icon={<Search className="h-4 w-4" />} title="Highlighted Payload Text">
          <HighlightedJobText
            originalText={job_text}
            suspiciousPhrases={analysis.suspicious_phrases || []}
            phraseDetails={analysis.phrase_details}
          />
        </AnalysisSection>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 4 · SOURCE INTELLIGENCE
      ════════════════════════════════════════════════════════ */}
      <AnalysisSection number={4} icon={<Network className="h-4 w-4" />} title="Source Intelligence">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {analysis.url_intelligence ? (
            <JobSourcePanel urlIntelligence={analysis.url_intelligence} />
          ) : (
            <Card className="glass-card border-border flex items-center justify-center p-6 text-center text-muted-foreground min-h-[120px]">
              <div>
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No URL intelligence available</p>
              </div>
            </Card>
          )}
          {analysis.domain_intelligence ? (
            <DomainIntelligencePanel domain_intelligence={analysis.domain_intelligence} />
          ) : (
            <Card className="glass-card border-border flex items-center justify-center p-6 text-center text-muted-foreground min-h-[120px]">
              <div>
                <CheckCircle2 className="h-6 w-6 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No domain intelligence available</p>
              </div>
            </Card>
          )}
        </div>
      </AnalysisSection>

      {analysis.threat_intelligence?.alerts?.length ? (
        <AnalysisSection number={5} icon={<Network className="h-4 w-4" />} title="Threat Intelligence">
          <ThreatIntelligencePanel threat_intelligence={analysis.threat_intelligence} />
        </AnalysisSection>
      ) : null}

      {/* ═══════════════════════════════════════════════════════
          SECTION 6 · BEHAVIORAL INDICATORS
      ════════════════════════════════════════════════════════ */}
      <AnalysisSection number={6} icon={<Activity className="h-4 w-4" />} title="Behavioral Red Flags">
        <BehavioralIndicatorsPanel
          suspicious_phrases={analysis.suspicious_phrases}
          phrase_details={analysis.phrase_details}
        />
      </AnalysisSection>

      {/* ═══════════════════════════════════════════════════════
          SECTION 7 · PATTERN MATCHING
      ════════════════════════════════════════════════════════ */}
      <AnalysisSection number={7} icon={<Copy className="h-4 w-4" />} title="Pattern Matching — Similar Scams">
        <SimilarPatternPanel
          similar_patterns={analysis.similar_patterns}
          matching_templates={analysis.matching_templates}
        />
      </AnalysisSection>

      {/* ═══════════════════════════════════════════════════════
          SECTION 8 · CONFIDENCE BREAKDOWN
      ════════════════════════════════════════════════════════ */}
      <AnalysisSection number={8} icon={<Calculator className="h-4 w-4" />} title="Confidence Breakdown">
        <ConfidenceBreakdownPanel
          scam_probability={analysis.scam_probability}
          pipeline_metadata={analysis.pipeline_metadata}
          domain_trust_score={analysis.domain_intelligence?.trust_score}
          confidence_level={analysis.confidence_level}
          confidence_reason={analysis.confidence_reason}
        />
      </AnalysisSection>

      {/* ═══════════════════════════════════════════════════════
          SECTION 9 · FINAL RECOMMENDATION
      ════════════════════════════════════════════════════════ */}
      <AnalysisSection number={9} icon={<Shield className="h-4 w-4" />} title="Final Recommendation">
        <FinalRecommendationCard
          riskLevel={analysis.risk_level}
          riskScore={scamPct}
          suspiciousPhrases={analysis.suspicious_phrases}
          reasons={analysis.reasons}
          confidence={analysis.confidence}
        />
      </AnalysisSection>

      {/* ─── extra intel (folded below main 8 sections) ───── */}
      {/* Evidence & Source Links */}
      {((analysis.evidence_sources && analysis.evidence_sources.length > 0) ||
        (analysis.source_links && analysis.source_links.length > 0)) && (
        <AnalysisSection number={10} icon={<FileText className="h-4 w-4" />} title="Supporting Evidence">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EvidenceSourcesPanel
              evidence_sources={analysis.evidence_sources}
              scam_probability={analysis.scam_probability}
            />
            <SourceLinksPanel
              source_links={analysis.source_links}
              risk_level={analysis.risk_level}
            />
          </div>
        </AnalysisSection>
      )}

      {/* Network / Community Reports */}
      {(analysis.community_report_count !== undefined && analysis.community_report_count > 0) && (
        <AnalysisSection number={11} icon={<Network className="h-4 w-4" />} title="Network Insight">
          <CommunityReportsPanel community_report_count={analysis.community_report_count} />
        </AnalysisSection>
      )}

      {/* ─── Report & Save ─────────────────────────────────── */}
      <div className="pt-6 border-t border-border/40">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-4 w-4 text-primary opacity-70" />
          <h3 className="text-base font-bold text-foreground">Report & Data Retention</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ReportDownloadPanel
            analysis_id={analysis._id}
            risk_level={analysis.risk_level}
            scam_probability={analysis.scam_probability}
          />
          <Card className="glass-card border-border overflow-hidden">
            <CardHeader className="bg-card/40 border-b border-border/50 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Save className="h-4 w-4 text-emerald-400" />
                Save to Intel Database
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {!is_saved ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Save this investigation to the JobShield threat database for permanent access and report downloads.
                  </p>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="lg"
                    className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold"
                  >
                    {isSaving ? "Saving..." : "Save Investigation"}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <Shield className="h-8 w-8 text-emerald-400" />
                  <p className="font-bold text-emerald-400">Analysis Saved ✓</p>
                  <p className="text-xs text-muted-foreground">Logged in threat intelligence database</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
