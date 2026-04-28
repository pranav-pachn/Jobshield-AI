import React, { useState } from "react";
import { 
  Shield, Save, FileText, Search, Activity, Copy, 
  Calculator, Network, CheckCircle2
} from "lucide-react";
import { WhyItWasFlaggedPanel } from "./WhyItWasFlaggedPanel";
import { EvidenceSourcesPanel } from "./EvidenceSourcesPanel";
import { DomainIntelligencePanel } from "./DomainIntelligencePanel";
import { SimilarPatternPanel } from "./SimilarPatternPanel";
import { CommunityReportsPanel } from "./CommunityReportsPanel";
import { SourceLinksPanel } from "./SourceLinksPanel";
import { ReportDownloadPanel } from "./ReportDownloadPanel";
import { JobSourcePanel, UrlIntelligenceData } from "./JobSourcePanel";
import { BehavioralIndicatorsPanel } from "./BehavioralIndicatorsPanel";
import { ConfidenceBreakdownPanel } from "./ConfidenceBreakdownPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HighlightedJobText } from "@/components/HighlightedJobText";
import { FinalRecommendationCard } from "@/components/FinalRecommendationCard";

export interface EnrichedAnalysisData {
  _id?: string;
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

/* ─── helpers ─────────────────────────────────────────────── */
function getRiskColors(riskLevel: string) {
  switch (riskLevel) {
    case "High":   return { border: "border-red-500/40",     bg: "bg-gradient-to-br from-red-950/40 to-card/20",     accent: "text-red-400",     glow: "shadow-[0_0_24px_rgba(239,68,68,0.25)]",   badge: "bg-red-500/15 text-red-300 border-red-500/30",   strip: "via-red-500/60" };
    case "Medium": return { border: "border-amber-500/40",   bg: "bg-gradient-to-br from-amber-950/30 to-card/20",   accent: "text-amber-400",   glow: "shadow-[0_0_24px_rgba(217,119,6,0.25)]",   badge: "bg-amber-500/15 text-amber-300 border-amber-500/30", strip: "via-amber-500/60" };
    case "Low":    return { border: "border-emerald-500/35", bg: "bg-gradient-to-br from-emerald-950/20 to-card/20", accent: "text-emerald-400", glow: "shadow-[0_0_24px_rgba(16,185,129,0.2)]",   badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25", strip: "via-emerald-500/60" };
    default:       return { border: "border-border",         bg: "bg-card/30",                                       accent: "text-foreground",  glow: "",                                         badge: "bg-card/20 text-foreground border-border",      strip: "via-white/20" };
  }
}

interface SectionProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ number, icon, title, children }) => (
  <section>
    {/* Section header */}
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 text-primary border border-primary/25 font-bold text-sm flex-shrink-0">
        {number}
      </div>
      <div className="flex items-center gap-2">
        <span className="opacity-60">{icon}</span>
        <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
      </div>
      <div className="flex-1 h-px bg-border/50" />
    </div>
    {children}
  </section>
);

/* ─── main component ──────────────────────────────────────── */
export const ScamAnalysisDetailedView: React.FC<ScamAnalysisDetailedViewProps> = ({
  analysis,
  job_text,
  is_saved,
  onSave,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const rc = getRiskColors(analysis.risk_level);

  const scamPct = Math.round((analysis.scam_probability ?? 0) * 100);
  const confidenceScore = typeof analysis.confidence === "number"
    ? analysis.confidence
    : analysis.confidence_level === "High" ? 0.91
    : analysis.confidence_level === "Medium" ? 0.75 : 0.55;
  const confPct = Math.round(confidenceScore * 100);

  const topDrivers = (analysis.reasons ?? []).slice(0, 3);

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
      <Section number={1} icon={<Shield className="h-4 w-4" />} title="Risk Summary">
        <div className={`rounded-xl border ${rc.border} ${rc.bg} backdrop-blur-xl p-6 sm:p-8 ${rc.glow} relative overflow-hidden group`}>
          <div className={`h-px w-full absolute top-0 left-0 bg-gradient-to-r from-transparent ${rc.strip} to-transparent`} />
          
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className={`text-xs font-bold uppercase tracking-widest ${rc.accent} opacity-70 mb-1`}>Threat Assessment</div>
              <div className={`text-4xl font-black tracking-tight ${rc.accent}`}>
                {analysis.risk_level.toUpperCase()} RISK
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Scam Probability</div>
                <div className={`text-3xl font-black tabular-nums ${rc.accent}`}>{scamPct}%</div>
              </div>
              <div className="w-px bg-border/50" />
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Confidence</div>
                <div className="text-3xl font-black tabular-nums text-blue-400">{confPct}%</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                analysis.risk_level === "High"   ? "bg-gradient-to-r from-red-600 to-red-400" :
                analysis.risk_level === "Medium" ? "bg-gradient-to-r from-amber-600 to-amber-400" :
                                                    "bg-gradient-to-r from-emerald-600 to-emerald-400"
              }`}
              style={{ width: `${scamPct}%` }}
            />
          </div>

          {/* Risk drivers */}
          {topDrivers.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Risk Drivers</p>
              <ul className="space-y-1.5">
                {topDrivers.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${rc.accent.replace("text-", "bg-")}`} />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 · WHY IT WAS FLAGGED
      ════════════════════════════════════════════════════════ */}
      <Section number={2} icon={<Shield className="h-4 w-4" />} title="Why It Was Flagged">
        <WhyItWasFlaggedPanel
          suspicious_phrases={analysis.suspicious_phrases || []}
          phrase_details={analysis.phrase_details}
          reasons={analysis.reasons}
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 · HIGHLIGHTED JOB TEXT
      ════════════════════════════════════════════════════════ */}
      {job_text && (
        <Section number={3} icon={<Search className="h-4 w-4" />} title="Highlighted Payload Text">
          <HighlightedJobText
            originalText={job_text}
            suspiciousPhrases={analysis.suspicious_phrases || []}
            phraseDetails={analysis.phrase_details}
          />
        </Section>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 4 · SOURCE INTELLIGENCE
      ════════════════════════════════════════════════════════ */}
      <Section number={4} icon={<Network className="h-4 w-4" />} title="Source Intelligence">
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
      </Section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5 · BEHAVIORAL INDICATORS
      ════════════════════════════════════════════════════════ */}
      <Section number={5} icon={<Activity className="h-4 w-4" />} title="Behavioral Red Flags">
        <BehavioralIndicatorsPanel
          suspicious_phrases={analysis.suspicious_phrases}
          phrase_details={analysis.phrase_details}
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6 · PATTERN MATCHING
      ════════════════════════════════════════════════════════ */}
      <Section number={6} icon={<Copy className="h-4 w-4" />} title="Pattern Matching — Similar Scams">
        <SimilarPatternPanel
          similar_patterns={analysis.similar_patterns}
          matching_templates={analysis.matching_templates}
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 7 · CONFIDENCE BREAKDOWN
      ════════════════════════════════════════════════════════ */}
      <Section number={7} icon={<Calculator className="h-4 w-4" />} title="Confidence Breakdown">
        <ConfidenceBreakdownPanel
          scam_probability={analysis.scam_probability}
          pipeline_metadata={analysis.pipeline_metadata}
          domain_trust_score={analysis.domain_intelligence?.trust_score}
          confidence_level={analysis.confidence_level}
          confidence_reason={analysis.confidence_reason}
        />
      </Section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 8 · FINAL RECOMMENDATION
      ════════════════════════════════════════════════════════ */}
      <Section number={8} icon={<Shield className="h-4 w-4" />} title="Final Recommendation">
        <FinalRecommendationCard
          riskLevel={analysis.risk_level}
          riskScore={Math.round(analysis.scam_probability * 100)}
          suspiciousPhrases={analysis.suspicious_phrases}
          reasons={analysis.reasons}
          confidence={analysis.confidence}
        />
      </Section>

      {/* ─── extra intel (folded below main 8 sections) ───── */}
      {/* Evidence & Source Links */}
      {((analysis.evidence_sources && analysis.evidence_sources.length > 0) ||
        (analysis.source_links && analysis.source_links.length > 0)) && (
        <Section number={9} icon={<FileText className="h-4 w-4" />} title="Supporting Evidence">
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
        </Section>
      )}

      {/* Network / Community Reports */}
      {(analysis.community_report_count !== undefined && analysis.community_report_count > 0) && (
        <Section number={10} icon={<Network className="h-4 w-4" />} title="Network Insight">
          <CommunityReportsPanel community_report_count={analysis.community_report_count} />
        </Section>
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
