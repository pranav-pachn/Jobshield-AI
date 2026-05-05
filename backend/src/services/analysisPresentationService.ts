import { UrlIntelligenceResult } from "./urlIntelligenceService";

export interface ThreatIntelligencePresentation {
  found: boolean;
  frequency: number;
  intelligence_boost: number;
  alerts: string[];
}

export function buildThreatIntelligencePresentation(input?: {
  found?: boolean;
  frequency?: number;
  risk_boost?: number;
  details?: string[];
}): ThreatIntelligencePresentation {
  return {
    found: Boolean(input?.found),
    frequency: input?.frequency ?? 0,
    intelligence_boost: input?.risk_boost ?? 0,
    alerts: input?.details ?? [],
  };
}

export function buildWorkflowResponse(params: {
  text: string;
  analysis: {
    scam_probability: number;
    risk_score: number;
    risk_level: "Low" | "Medium" | "High";
    confidence?: number;
    suspicious_phrases: string[];
    reasons: string[];
    summary_reasons?: string[];
  };
  componentScores?: unknown;
  pipelineMetadata?: unknown;
  enrichment: {
    evidence_sources?: unknown[];
    domain_intelligence?: unknown;
    url_intelligence?: UrlIntelligenceResult;
    similar_patterns?: unknown[];
    community_report_count?: number;
    confidence_level?: string;
    confidence_reason?: string;
    source_links?: unknown[];
  };
  threatIntelligence?: ThreatIntelligencePresentation;
  network: unknown[];
  cached: boolean;
}) {
  return {
    user_input: {
      status: "completed",
      data: {
        text_length: params.text.length,
      },
    },
    ai_analyzes: {
      status: params.cached ? "skipped_cached_result" : "completed",
      data: {
        scam_probability: params.analysis.scam_probability,
        risk_score: params.analysis.risk_score,
        risk_level: params.analysis.risk_level,
        confidence: params.analysis.confidence,
        suspicious_phrases: params.analysis.suspicious_phrases,
      },
    },
    explains_reasoning: {
      status: "completed",
      data: {
        reasons: params.analysis.reasons,
        summary_reasons: params.analysis.summary_reasons || params.analysis.reasons.slice(0, 4),
        component_scores: params.componentScores,
        pipeline_metadata: params.pipelineMetadata,
      },
    },
    shows_evidence: {
      status: "completed",
      data: {
        evidence_sources: params.enrichment.evidence_sources || [],
        domain_intelligence: params.enrichment.domain_intelligence,
        similar_patterns: params.enrichment.similar_patterns || [],
        community_report_count: params.enrichment.community_report_count || 0,
        confidence_level: params.enrichment.confidence_level,
        confidence_reason: params.enrichment.confidence_reason,
        source_links: params.enrichment.source_links || [],
        threat_intelligence:
          params.threatIntelligence ||
          buildThreatIntelligencePresentation(),
      },
    },
    builds_scam_network: {
      status: "completed",
      data: {
        correlations: params.network || [],
        total_network_links: (params.network || []).length,
      },
    },
  };
}
